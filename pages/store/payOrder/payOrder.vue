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
						<image class="goods-image" :src="$u.getImagePath(goods.gd_img)" mode=" aspectFit"
							v-if="goods.gd_img"></image>
						<text class="cuIcon-goods goods-image" v-else></text>
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
			<view class="order-info">
				<view class="order-item">
					<view class="label">
						商品总价
					</view>
					<view class="value">
						<text> ￥{{totalMoney||''}}</text>
						<text class="cuIcon-right text-white"></text>
					</view>
				</view>
				<view class="order-item" @click="openCouponPopup" v-if="couponList&&couponList.length>0">
					<view class="label">
						优惠券
					</view>
					<view class="value text-red" v-if="couponChecked.length>0">
						<text>-￥{{deduction||'0'}}</text>
						<text class="cuIcon-right"></text>
					</view>
					<view class="value " v-else>
						<text>{{couponList.length}}张可用</text>
						<text class="cuIcon-right text-gray"></text>
					</view>
				</view>
				<view class="order-item"
					v-else-if="orderInfo&&orderInfo.money_topay&&orderInfo.money_total!==orderInfo.money_topay">
					<view class="label">
						优惠价:
					</view>
					<view class="value text-red">
						<text>-￥{{orderInfo.money_topay||'0'}}</text>
						<text class="cuIcon-right text-white"></text>
					</view>
				</view>
			</view>
		</view>
		<view class="handler-bar">
			<view class="amount">共{{ totalAmount }}件</view>
			<view class="amount" v-if="orderInfo&&orderInfo.money_youhuiquan">总价<text
					class="text-orange">￥{{ totalMoney }}</text>, 优惠<text
					class="text-orange">-￥{{orderInfo.money_youhuiquan}}</text></view>
			<text class="text">合计:</text>
			<text class="money-amount">
				<text class="money-operate">￥</text>
				<text>{{ finallMoney }}</text>
			</text>
			<button class="cu-btn bg-gradual-orange round" @click="submitOrder" v-if="orderInfo.order_status === '待提交'"
				:disabled="!canSubmit">提交订单</button>
			<button class="cu-btn bg-gradual-orange round" @click="toPay"
				v-if="orderInfo.order_status === '待支付' && (orderInfo.pay_status === '取消支付' || orderInfo.pay_status === '未支付')">
				付款
			</button>
		</view>
		<u-popup v-model="showCouponPopup" mode="bottom" closeable border-radius="20">
			<view class="coupon-popup">
				<view class="coupon-title">
					<text>优惠券</text>
					<!-- <text class="explain">使用说明</text> -->
				</view>
				<!-- 			<view class="coupon-title-tip">
					请选择优惠券
				</view> -->
				<scroll-view scroll-y="true">
					<view class="coupon-list">
						<view class="coupon-item" v-for="item in couponList" :key="item.id"
							@click="radioGroupChange(item)">
							<view class="left">
								<view class="sum">
									￥
									<text class="num">{{item.value}}</text>
								</view>
							</view>
							<view class="center">
								<text class="margin-right">{{item.cp_name}}</text>

							</view>
							<view class="right">
								<u-checkbox v-model="item.checked" shape="circle">
								</u-checkbox>
							</view>
						</view>
					</view>
				</scroll-view>
				<view class="button-box">
					<button class="cu-btn bg-gradual-orange shadow-blur " @click="openCouponPopup">确定</button>
				</view>
			</view>
		</u-popup>
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
				},
				showCouponPopup: false,
				couponList: [], //可用优惠券
				couponCheckedNo: '',
			};
		},
		computed: {
			couponChecked() {
				if (this.couponCheckedNo) {
					return this.couponList.find(item => item.cpd_no === this.couponCheckedNo)
				} else {
					return this.couponList.filter(item => item.checked)
				}
			},
			canSubmit() {
				// 是否可以提交订单
				return this.addressInfo && this.addressInfo.fullAddress && this.addressInfo.phone && this.addressInfo
					.userName && this.totalMoney
			},
			deduction() {
				if (Array.isArray(this.couponChecked) && this.couponChecked.length > 0) {
					let deduction = this.couponChecked.reduce((res, cur) => {
						if (cur.value && typeof cur.value === 'number' && !isNaN(cur.value)) {
							res += cur.value
						}
						return res
					}, 0)
					return deduction
				} else if (this.orderInfo && this.orderInfo.money_youhuiquan) {
					return this.orderInfo.money_youhuiquan
				}
				return 0
			},
			finallMoney() {
				// 最终支付金额
				let result = this.totalMoney
				if (this.deduction) {
					let res = this.totalMoney - this.deduction
					if (res && typeof res === 'number' && !isNaN(result)) {
						result = res
					}
				}
				return result
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
			radioGroupChange(e) {
				if (e && e.id) {
					this.couponList = this.couponList.map(item => {
						if (item.id === e.id) {
							item.checked = !item.checked
						} else {
							item.checked = false
						}
						return item
					})
				}
			},
			async getCouponList() {
				// 查找可用优惠券列表
				const req = {
					"serviceName": "srvstore_sales_coupon_detail_select",
					"colNames": ["*"],
					"condition": [{
							colName: 'hy_no',
							ruleType: 'eq',
							value: this.vuex_memberInfo.hy_no
						},
						{
							colName: 'state',
							ruleType: 'eq',
							value: '待使用'
						},
						{
							colName: 'use_order_no',
							ruleType: 'isnull'
						}
					],
					"page": {
						"pageNo": 1,
						"rownumber": 10
					},
				}
				const url = '/fyzhmd/select/srvstore_sales_coupon_detail_select'
				const res = await this.$u.post(url, req)
				if (res.state === 'SUCCESS') {
					this.couponList = res.data.map(item => {
						item.checked = false
						if (Array.isArray(this.couponChecked) && this.couponChecked.length > 0 && this
							.couponChecked.find(c => c.id === item.id)) {
							item.checked = true
						}
						return item
					})
				}
				return res
			},
			async openCouponPopup() {
				if (!this.showCouponPopup) {
					await this.getCouponList()

				}
				this.showCouponPopup = !this.showCouponPopup
			},
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
					if (this.orderInfo.order_status === '待支付' && this.orderInfo.pay_status === '取消支付') {
						uni.setNavigationBarTitle({
							title: '等待买家付款'
						});
					}
					this.addressInfo.fullAddress = this.orderInfo.rcv_addr
					this.addressInfo.userName = this.orderInfo.rcv_name
					this.addressInfo.telNumber = this.orderInfo.rcv_phone
					this.addressInfo.phone = this.orderInfo.rcv_phone
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
					if (goodsList.state === 'SUCCESS') {
						this.goodsList = goodsList.data
						this.$set(this.orderInfo, 'goodsList', goodsList.data);
					}
				}
			},
			async submitOrder() {
				const userInfo = this.vuex_loginUser
				const vuex_memberInfo = this.vuex_memberInfo
				let req = [{
					serviceName: 'srvstore_shop_order_add',
					condition: [],
					data: [{
						image: this.orderInfo.image,
						type: this.orderInfo.type,
						rcv_addr: this.addressInfo.fullAddress,
						rcv_name: this.addressInfo.userName,
						rcv_phone: this.addressInfo.telNumber,
						hy_no: vuex_memberInfo.hy_no,
						hy_name: vuex_memberInfo.hy_name,
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
				const url = '/fyzhmd/operate/srvstore_shop_order_add'
				const res = await this.$u.post(url, req)
				// .then(res => {
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
				if (data && Array.isArray(data) && data.length > 0) {
					this.orderNo = data[0].order_no;
					if (Array.isArray(this.couponChecked) && this.couponChecked.length > 0 && this.orderNo) {
						const useCouponResult = await this.useCoupon()
					}
					this.getOrderInfo().then(data => {
						this.toPay();
					});
				}
				// });
			},
			async useCoupon() {
				// 使用优惠券
				const req = [{
					"serviceName": "srvstore_sales_coupon_detail_update",
					"condition": [{
						"colName": "id",
						"ruleType": "in",
						"value": this.couponChecked.map(item => item.id).toString()
					}],
					"data": [{
						"state": "已使用",
						"use_order_no": this.orderNo
					}]
				}]
				let url = '/fyzhmd/operate/srvstore_sales_coupon_detail_update'
				const res = await this.$u.post(url, req)
				if (res.state == 'SUCCESS') {
					return res.data
				}
			},

			async updatePrepayId(prepay_id) {
				// 生成微信订单后 更新订单的预支付id
				const url = '/fyzhmd/operate/srvstore_shop_order_update'
				const req = [{
					"serviceName": "srvstore_shop_order_update",
					"condition": [{
						"colName": "order_no",
						"ruleType": "eq",
						"value": this.orderNo
					}],
					"data": [{
						"prepay_id": prepay_id
					}]
				}]
				let res = await this.$u.post(url, req)
				return res
			},
			// 发起支付
			async toPay() {
				let self = this;
				let money = this.finallMoney || this.orderInfo?.money_topay || this.orderInfo.money_total || this
					.totalMoney
				let orderData = this.$u.deepClone(this.orderInfo);
				let goodsData = this.$u.deepClone(this.goodsList);
				if (typeof money !== 'number' || isNaN(money)) {
					uni.showModal({
						title: '提示',
						content: '订单状态有误',
						showCancel: false
					});
					return;
				}
				let result = {};
				debugger
				if (orderData.prepay_id) {
					result.prepay_id = orderData.prepay_id;
				} else {
					result = await this.$u.api.toPlaceOrder(
						money * 100 || 1, this.vuex_loginUser
						?.login_user_type,
						orderData
					);

				}

				if (result && result.prepay_id) {
					await this.updatePrepayId(result.prepay_id)
					let res = await this.$u.api.getPayParams(result.prepay_id);
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
									.order_no + '&totalMoney=' + money
							});
						},
						fail(res) {
							// 支付失败/取消支付
							self.orderInfo.pay_status = '取消支付';
							self.updateOrderState('未支付', '取消支付', result.prepay_id);
						}
					});
				}
			}
		},
		onLoad(option) {
			// 1. 从订单列表进入
			if (option.order_no) {
				// 查找订单信息
				this.orderNo = option.order_no
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
				this.getCouponList()
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

			.order-item {
				display: flex;
				justify-content: space-between;
				padding: 10rpx 20rpx 0 0;

				.label {
					color: #666;
				}

				.value {
					.cuIcon-right {
						font-weight: normal;
					}

					font-weight: bold;
				}
			}

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
					font-size: 60rpx;
					height: 100rpx;
					text-align: center;
					line-height: 100rpx;
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

	.coupon-popup {
		background-color: #F5F5F5;

		.coupon-title {
			font-weight: bold;
			background-color: #fff;
			padding: 20rpx;
			font-size: 36rpx;
		}

		.coupon-title-tip {
			padding: 0 20rpx;
			background-color: #fff;
			color: #666;
		}

		.button-box {
			padding: 20rpx 0 40rpx;
			text-align: center;
			background-color: #fff;

			.cu-btn {
				width: 80%;
			}
		}

		.coupon-list {
			padding: 20rpx;
			max-height: 65vh;
		}

		.coupon-item {
			margin-top: 20rpx;
			width: 700rpx;
			background-color: #ffffff;
			display: flex;
			border-radius: 20rpx;
			-webkit-mask: radial-gradient(circle at 0, transparent 20rpx, red 0), radial-gradient(circle at right, transparent 30rpx, blue 0);
			-webkit-mask-size: 50%;
			-webkit-mask-position: 0, 100%;
			-webkit-mask-repeat: no-repeat;
			box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);

			// background: linear-gradient(45deg, orange, red);
			.left {
				padding: 0 30rpx;
				background-color: rgb(95, 148, 224); //rgb(94, 152, 225);
				text-align: center;
				font-size: 28rpx;
				color: #ffffff;
				flex: 0.4;

				.sum {
					margin-top: 50rpx;
					margin-bottom: 50rpx;
					font-weight: bold;
					font-size: 32rpx;

					.num {
						font-size: 80rpx;
					}
				}

				.type {
					margin-bottom: 50rpx;
					font-size: 24rpx;
				}
			}

			.center {
				font-size: 28rpx;
				flex: 1;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 40rpx;
				font-weight: bold;
				letter-spacing: 5rpx;
			}

			.right {
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 20rpx;
			}
		}
	}
</style>
