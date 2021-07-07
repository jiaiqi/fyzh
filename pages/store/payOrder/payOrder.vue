<template>
	<view class="pay-order">
		<view class="address-box" @click="chooseAddress">
			<view class="left "><text class="cuIcon-locationfill"></text></view>
			<view class="center" v-if="addressInfo&&addressInfo.fullAddress&&addressInfo.phone&&addressInfo.userName">
				<view class="">
					<text class="name margin-right-xs">{{ addressInfo.userName}}</text>
					<text class="phone">{{ addressInfo.phone || '-' }}</text>
				</view>
				<view class="address">{{ addressInfo.fullAddress || '-' }}</view>
			</view>
			<view class="center" v-else>
				<view class="address">点击选择地址</view>
			</view>
			<view class="right"><text class="cuIcon-right"></text></view>
		</view>
		<view class="order-detail">
			<view class="order-info">
				<view class="title-bar">
					<text class="store-logo cuIcon-shop"></text>
					<!-- <text class="store-name">{{ orderInfo.store_name ? orderInfo.store_name : orderInfo.name || '' }}</text> -->
				</view>
				<view class="goods-list">
					<view class="goods-item" v-for="goods in goodsList">
						<image class="goods-image" :src="$u.getImagePath(goods.gd_img)" mode=""></image>
						<view class="content">
							<view class="goods-name">{{ goods.name||goods.goods_name}}
							</view>
						</view>
						<view class="num">
							<view class="price">
								<text class="money-operate">￥</text>
								{{ goods.unit_price ? goods.unit_price : goods.price || '' }}
							</view>
							<view class="amount">x{{goods.amount || '' }}
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="handler-bar">
			<text class="amount">共{{ totalAmount }}件</text>
			<text class="text">合计:</text>
			<text class="money-amount">
				<text class="money-operate">￥</text>
				<text>{{ totalMoney }}</text>
			</text>
			<button class="cu-btn bg-gradual-orange round" @click="submitOrder" v-if="orderInfo.order_status === '待提交'"
				:disabled="!canSubmit">提交订单</button>
			<button class="cu-btn bg-gradual-orange round" @click="toPay"
				v-if="orderInfo.order_status === '待支付' && (orderInfo.pay_status === '取消支付' || orderInfo.pay_status === '未支付')">
				付款
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				orderNo: '', //订单编号
				orderInfo: {},
				goodsList: [],
				addressInfo: {
					fullAddress: ''
				}
			};
		},
		computed: {
			canSubmit() {
				// 是否可以提交订单
				return this.addressInfo && this.addressInfo.fullAddress && this.addressInfo.phone && this.addressInfo
					.userName && this.totalMoney
			},
			totalAmount() {
				if (Array.isArray(this.goodsList)) {
					return this.goodsList.reduce((pre, cur) => {
						if (cur.goods_amount) {
							pre += cur.goods_amount;
						}
						if (cur.amount) {
							pre += cur.amount;
						}
						return pre;
					}, 0);
				}
			},
			totalMoney() {
				if (Array.isArray(this.goodsList)) {
					return this.goodsList.reduce((pre, cur) => {
						if (cur.goods_amount && cur.unit_price) {
							pre += cur.goods_amount * cur.unit_price;
						} else if (cur.price && cur.amount) {
							pre += cur.amount * cur.price;
						} else if (cur.unit_price && cur.amount) {
							pre += cur.amount * cur.unit_price;
						}
						return pre;
					}, 0);
				}
			}
		},
		methods: {
			updateOrderState(order_status, pay_status, prepay_id) {
				let req = [{
					serviceName: 'srvstore_shop_order_update',
					condition: [{
						colName: 'id',
						ruleType: 'eq',
						value: this.orderInfo.id
					}],
					data: [{
						order_status: order_status
					}, {
						pay_status: pay_status
					}]
				}];
				if (prepay_id && this.orderInfo.id) {
					req[0].data.push({
						prepay_id: prepay_id
					});
				} else {
					return
				}
				let url = '/fyzhmd/operate/srvstore_shop_order_update'
				this.$u.post(url, req)
			},
			chooseAddress() {
				let self = this;
				// #ifdef MP-WEIXIN
				uni.chooseAddress({
					success(res) {
						self.addressInfo = res;
						self.addressInfo.phone = res.telNumber; // 手机号
						self.addressInfo.fullAddress = res.provinceName + res.cityName + res.countyName + res
							.detailInfo;
					}
				});
				// #endif
			},
			async getOrderInfo() {
				let req = {
					"serviceName": "srvstore_shop_order_select",
					"colNames": ["*"],
					"condition": [{
						colName: 'order_no',
						ruleType: 'eq',
						value: this.orderNo
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 1
					}
				}
				const url = '/fyzhmd/select/srvstore_shop_order_select'
				let orderInfo = await this.$u.post(url, req);
				if (orderInfo && orderInfo.data && orderInfo.data.length > 0) {
					this.orderInfo = orderInfo.data[0];
					if (this.orderInfo.order_status === '未支付' && this.orderInfo.pay_status === '取消支付') {
						uni.setNavigationBarTitle({
							title: '等待买家付款'
						});
					}
					let goods = await this.getGoodsList();
					return this.orderInfo;
				}
			},
			async getGoodsList() {
				let req = {
					"serviceName": "srvstore_shop_order_goods_select",
					"colNames": ["*"],
					"condition": [{
						"colName": "order_no",
						"ruleType": "eq",
						"value": this.orderNo
					}],
					"relation_condition": {},
					"page": {
						"pageNo": 1,
						"rownumber": 5
					},
					"order": [],
					"draft": false,
					"query_source": "list_page"
				}
				let url = '/fyzhmd/select/srvstore_shop_order_goods_select'
				if (this.orderNo) {
					let goodsList = await this.$u.post(url, req);
					if (goodsList.success) {
						this.goodsList = goodsList.data
						this.$set(this.orderInfo, 'goodsList', goodsList.data);
					}
				}
			},
			submitOrder() {
				const userInfo = this.vuex_loginUser
				let req = [{
					serviceName: 'srvstore_shop_order_add',
					condition: [],
					data: [{
						image: this.orderInfo.image,
						type: this.orderInfo.type,
						rcv_addr: this.addressInfo.fullAddress,
						rcv_name: this.addressInfo.userName,
						rcv_phone: this.addressInfo.telNumber,
						hy_name: userInfo.real_name,
						// user_no: userInfo.user_no,
						// profile_url: userInfo.headimgurl,
						money_total: this.totalMoney,
						// order_remark: '订单备注',
						pay_status: '未支付',
						order_status: '待支付',
						child_data_list: [{
							serviceName: 'srvstore_shop_order_goods_add',
							condition: [],
							depend_keys: [{
								type: 'column',
								add_col: 'order_no',
								depend_key: 'order_no'
							}],
							data: this.goodsList.map(item => {
								let obj = {
									amount: item.amount,
									gd_no: item.gd_no,
									goods_name: item.gd_name,
									sum_price: item.price,
									unit: item.unit,
									unit_price: item.unit_price
								}
								return obj
							})
						}]
					}]
				}];
				debugger
				const url = '/fyzhmd/operate/srvstore_shop_order_add'
				this.$u.post(url, req).then(res => {
					let data = []
					if (
						Array.isArray(res.response) &&
						res.response.length > 0 &&
						res.response[0].response &&
						Array.isArray(res.response[0].response.effect_data) &&
						res.response[0].response.effect_data.length > 0
					) {
						data = res.response[0].response.effect_data
					}
					debugger
					if (data && Array.isArray(data) && data.length > 0) {
						console.log(data[0]);
						this.orderNo = data[0].order_no;
						this.getOrderInfo().then(data => {
							this.toPay();
						});
					}
				});
			},

			// 发起支付
			async toPay() {
				let self = this;
				let orderData = this.$u.deepClone(this.orderInfo);
				let goodsData = this.$u.deepClone(this.goodsList);
				debugger
				if (typeof this.totalMoney !== 'number' || this.totalMoney.toString() === 'NaN') {
					uni.showModal({
						title: '提示',
						content: '订单状态有误',
						showCancel: false
					});
					return;
				}
				let result = {};
				if (orderData.prepay_id) {
					result.prepay_id = orderData.prepay_id;
				} else {
					result = await this.$u.api.toPlaceOrder(
						this.totalMoney ? this.totalMoney : 1,
						this.loginUserInfo && this.loginUserInfo.login_user_type ? this.loginUserInfo
						.login_user_type : '',
						orderData
					);
				}
				debugger
				if (result && result.prepay_id) {
					let res = await this.$u.api.getPayParams(result.prepay_id);
					debugger
					wx.requestPayment({
						timeStamp: res.timeStamp.toString(),
						nonceStr: res.nonceStr,
						package: res.package,
						signType: 'MD5',
						paySign: res.paySign,
						success(res) {
							// 支付成功
							self.orderInfo.order_status = '待发货';
							self.updateOrderState('待发货', '已支付', result.prepay_id);
							self.orderInfo.pay_status = '已支付';
							uni.redirectTo({
								url: '/pages/store/successPay/successPay?order_no=' + orderData
									.order_no + '&totalMoney=' + self.totalMoney
							});
						},
						fail(res) {
							// 支付失败/取消支付
							self.orderInfo.pay_status = '取消支付';
							self.updateOrderState('待支付', '取消支付', result.prepay_id);
						}
					});
				}
			}
		},
		onLoad(option) {
			// 1. 从订单列表进入
			if (option.order_no) {
				// 查找订单信息
				this.getOrderInfo();
			} else {
				// 2. 从购物车进入或商品页直接支付 初始化订单信息
				if (option.goodsList) {
					try {
						option.goodsList = JSON.parse(decodeURIComponent(option.goodsList))
					} catch (e) {
						//TODO handle the exception
					}
					this.goodsList = option.goodsList
					this.$set(this.orderInfo, 'goodsList', option.goodsList)
					this.$set(this.orderInfo, 'order_status', '待提交')
					this.$set(this.orderInfo, 'pay_status', '未支付')
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.pay-order {
		height: calc(100vh - var(--window-top));
		display: flex;
		flex-direction: column;

		.address-box {
			margin: 20rpx;
			padding: 20rpx;
			display: flex;
			background-color: #fff;
			border-radius: 10px;
			align-items: center;

			.left {
				height: 50px;
				width: 50px;
				text-align: center;
				line-height: 50px;
				font-size: 30px;
				background: linear-gradient(#ff9700, #ed1c24);
				color: #fff;
				border-radius: 50px;
			}

			.center {
				flex: 1;
				padding: 20rpx;

				.name {
					line-height: 30px;
					font-size: 16px;
					font-weight: bold;
				}
			}

			.right {
				font-size: 20px;
				color: #999;
			}
		}

		.order-detail {
			flex: 1;
		}

		.order-info {
			margin: 20rpx;
			margin-top: 0;
			background-color: #fff;
			padding: 20rpx 20rpx 40rpx;
			border-radius: 10px;

			.title-bar {
				padding: 20rpx 0 30rpx;
			}

			.store-logo {
				width: 20px;
				height: 20px;
			}

			.store-name {
				font-weight: bold;
				margin-left: 10rpx;
			}

			.goods-item {
				display: flex;

				&+.goods-item {
					margin-top: 20px;
				}

				.goods-image {
					width: 100rpx;
					height: 100rpx;
					background-color: #f1f1f1;
					border-radius: 5px;
				}

				.content {
					flex: 1;
					padding: 0 20rpx;
					font-weight: bold;
				}

				.num {
					width: 100px;
					text-align: right;
					margin-bottom: 5px;

					.price {
						font-weight: bold;
						color: #f76260;
						font-size: 18px;
						margin-bottom: 5px;

						.money-operate {
							font-size: 12px;
						}
					}

					.amount {
						font-size: 12px;
						color: #999;
					}
				}
			}
		}

		.handler-bar {
			background-color: #fff;
			height: 50px;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			padding-right: 20rpx;

			.amount {
				font-size: 12px;
				color: #999;
				margin-right: 10px;
			}

			.text {
				font-weight: bold;
			}

			.money-amount {
				padding-right: 10px;
				font-size: 18px;
				color: orange;

				.money-operate {
					font-size: 12px;
				}
			}
		}
	}
</style>
