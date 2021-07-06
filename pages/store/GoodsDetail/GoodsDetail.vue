<template>
	<view class="goods-detail ">
		<swiper class="screen-swiper main-image square-dot" easing-function="linear" :height="300"
			:indicator-dots="true" :circular="true" :autoplay="true" interval="5000" duration="500">
			<swiper-item v-for="(item, index) in swiperList" :key="item.url">
				<image :src="item.url" mode="aspectFill" @click.stop="toPreviewImage(item.url)"></image>
			</swiper-item>
		</swiper>
		<!-- <image :src="getImagePath(goodsInfo.goods_img,true)" mode="aspectFill"></image> -->
		<view class="goods-info ">{{ goodsInfo.gd_name }}</view>
		<view class="desc">
			<view class="title">简介</view>
			<view class="" v-html="goodsInfo.gd_desc" v-if="goodsInfo.gd_desc"> </view>
		</view>
		<!-- 	<view class="store-info">
			<image :src="$u.getImagePath(goodsInfo.store_image)" class="store-icon"></image>
			<view class="store-name">{{ goodsInfo.store_name }}</view>
			<view class="phoneCall"><text class="cuIcon-phone text-cyan"></text></view>
		</view> -->
		<view class="detail">
			<view class="title">图文详情</view>
			<view class="image-box">
				<image :src="item.url" mode="aspectFill"
					:style="{ width: item.imgWidth + 'px', height: item.imgHeight + 'px' }"
					v-for="item in goodsDetailImage"></image>
			</view>
		</view>
		<view class="cu-bar foot bottom bg-white tabbar border shop">
			<view class="shopping-cart" @click="toCart">
				<text class="cuIcon-cart" :class="{'animation-shake':shake}">
					<text class="cu-tag badge" v-if="vuex_cart&&vuex_cart.length>0">{{vuex_cart.length}}</text>
				</text>
			</view>
			<view class="price text-red ">
				<text class="symbol">￥</text>
				<text class="number" v-if="fill2Digit(goodsInfo.price)">
					<text class="int">{{ fill2Digit(goodsInfo.price)[0] }}.</text>
					<text class="float">{{ fill2Digit(goodsInfo.price)[1] }}</text>
				</text>
			</view>
			<view class="right-btn"><button class="cu-btn bg-orange round shadow-blur margin-right"
					@click="add2cart">加入购物车</button><button class="cu-btn bg-red round shadow-blur"
					@click="payOrder">立即购买</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		toPreviewImage
	} from '@/common/util.js'
	export default {
		data() {
			return {
				goodsInfo: {},
				shake: false,
				swiperList: [],
				goodsDetailImage: []
			};
		},
		methods: {
			toCart() {
				if (!this.vuex_memberInfo?.id) {
					uni.showModal({
						title: '提示',
						content: "加入会员后才能进行此操作，是否需要注册为会员？",
						success(res) {
							if (res.confirm) {
								uni.navigateTo({
									url: '/page/mine/memberReg/memberReg'
								})
							}
						}
					})
					return
				}
				uni.navigateTo({
					url: '/pages/store/cart/cart'
				})
			},
			add2cart() {
				// 加入购物车
				// 购物车中有相同商品时 商品数量+1
				if (!this.vuex_memberInfo?.id) {
					uni.showModal({
						title: '提示',
						content: "加入会员后才能进行此操作，是否需要注册为会员？",
						success(res) {
							if (res.confirm) {
								uni.navigateTo({
									url: '/page/mine/memberReg/memberReg'
								})
							}
						}
					})
					return
				}
				let url = '/fyzhmd/operate/srvstore_shop_cart_goods_add'
				let req = [{
					"serviceName": "srvstore_shop_cart_goods_add",
					"condition": [],
					"data": [{
						"user_no": this.vuex_loginUser.user_no,
						"gd_no": this.goodsInfo.gd_no,
						"gd_img": this.goodsInfo.gd_img,
						"goods_name": this.goodsInfo.gd_name,
						"sum_price": this.goodsInfo.price,
						"unit": this.goodsInfo.unit,
						"unit_price": this.goodsInfo.price,
						"amount": 1
					}]
				}]
				if (Array.isArray(this.vuex_cart)) {
					let goods = this.vuex_cart.find(item => item.gd_no === this.goodsInfo.gd_no)
					if (goods && goods.gd_no) {
						url = '/fyzhmd/operate/srvstore_shop_cart_goods_update'
						req = [{
							"serviceName": "srvstore_shop_cart_goods_update",
							"condition": [{
								colName: 'id',
								ruleType: 'eq',
								value: goods.id
							}],
							"data": [{
								"user_no": this.vuex_loginUser.user_no,
								"gd_no": this.goodsInfo.gd_no,
								"gd_img": this.goodsInfo.gd_img,
								"goods_name": this.goodsInfo.gd_name,
								"sum_price": this.goodsInfo.price * (goods.amount + 1),
								"unit": this.goodsInfo.unit,
								"unit_price": this.goodsInfo.price,
								"amount": (goods.amount + 1)
							}]
						}]
					}
				}
				this.$u.post(url, req).then(res => {
					if (res.state == 'SUCCESS') {
						this.shake = true;
						this.$u.api.getCart(this.vuex_loginUser.user_no)
						setTimeout(() => {
							this.shake = false
						}, 1000)
						uni.showToast({
							title: '添加成功'
						})
					}
				})


			},
			toPreviewImage(e) {
				return toPreviewImage(e)
			},
			payOrder() {
				if (!this.vuex_memberInfo?.id) {
					uni.showModal({
						title: '提示',
						content: "加入会员后才能进行此操作，是否需要注册为会员？",
						success(res) {
							if (res.confirm) {
								uni.navigateTo({
									url: '/page/mine/memberReg/memberReg'
								})
							}
						}
					})
					return
				}
				let goodsInfo = this.$u.deepClone(this.goodsInfo)
				goodsInfo.name = goodsInfo.gd_name
				goodsInfo.image = goodsInfo.gd_img
				goodsInfo.amount = goodsInfo.amount || 1
				goodsInfo.unit_price = goodsInfo.price
				this.$u.vuex('vuex_cart', [goodsInfo])
				uni.navigateTo({
					url: '/pages/store/payOrder/payOrder?goodsList=' +
						encodeURIComponent(
							JSON.stringify([goodsInfo]))
				});
			},
			async getSwiperList(e) {
				if (e.gd_img) {
					let res = await this.$u.api.getFilePath(e.gd_img);
					if (Array.isArray(res)) {
						this.swiperList = res
					}
				}
			},
			async getDetaiImageList(e) {
				if (e.photos) {
					let res = await this.$u.api.getFilePath(e.photos);
					if (Array.isArray(res)) {
						this.goodsDetailImage = res.reduce((pre, cur) => {
							if (cur.fileurl) {
								this.$u.getImageInfo({
									url: cur.url
								}).then(picInfo => {
									if (picInfo.w && picInfo.h) {
										let res = this.setPicHeight(picInfo);
										if (res.w && res.h) {
											this.$set(cur, 'imgWidth', res.w);
											this.$set(cur, 'imgHeight', res.h);
										}
									}
								});
							}
							pre.push(cur);
							return pre;
						}, []);
					}
				}
			},
			fill2Digit(val) {
				// 精确到小数点后两位
				if (Number(val).toString() !== 'NaN') {
					return [parseInt(val), val.toFixed(2).slice(-2)];
				} else {
					return false;
				}
			},
			setPicHeight(content) {
				let maxW = uni.upx2px(750);
				content.h = (maxW * content.h) / content.w;
				content.w = maxW;
				return content;
			},
			getGoodsInfo(no) {
				let req = {
					"serviceName": "srvstore_goods_mgmt_select",
					"colNames": ["*"],
					"condition": [{
						colName: 'gd_no',
						ruleType: 'eq',
						value: no
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 1
					},
				}
				let url = '/fyzhmd/select/srvstore_goods_mgmt_select'
				this.$u.post(url, req).then(res => {
					if (Array.isArray(res.data) && res.data.length > 0) {
						this.goodsInfo = res.data[0];
						this.getSwiperList(this.goodsInfo);
						this.getDetaiImageList(this.goodsInfo);
					}
				});
			}
		},
		onLoad(option) {
			if (option.gd_no) {
				this.getGoodsInfo(option.gd_no);
			}
		}
	};
</script>

<style scoped lang="scss">
	@import "../../../colorui/animation.css";

	.goods-detail {
		min-height: calc(100vh - var(--window-top) - var(--window-bottom));
		background-color: #FFF;
	}

	.goods-info {
		font-size: 18px;
		letter-spacing: 2px;
		padding: 20rpx;
		background-color: #fff;
		margin-bottom: 20rpx;
	}

	.store-info {
		margin: 20rpx 0;
		background-color: #fff;
		border-top: 1rpx solid #f1f1f1;
		margin-bottom: 20rpx;
		padding: 20rpx;
		display: flex;
		align-items: center;

		.store-name {
			font-size: 16px;
			font-weight: bold;
			color: #333;
			margin-left: 20rpx;
		}

		.store-icon {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
		}

		.phoneCall {
			flex: 1;
			font-size: 30px;
			text-align: right;
		}
	}

	.desc {
		color: #aaa;
		padding: 20rpx;
		background-color: #fff;

		.title {
			padding: 10rpx 0;
			border-bottom: 1rpx solid #f1f1f1;
			margin-bottom: 10rpx;
		}
	}

	.detail {
		padding-bottom: 50px;
		background-color: #fff;

		.title {
			border-bottom: 1rpx solid #f1f1f1;
			padding: 20rpx;
		}

		.image-box {
			width: 100%;

			image {
				width: 100%;
			}
		}
	}

	.main-image {
		width: 100%;
		height: 400rpx;
		overflow: hidden;

		image {
			width: 100%;
			height: 100%;
		}
	}

	.shopping-cart {
		width: 140rpx;
		height: 100rpx;
		font-size: 50rpx;
		border-right: 1px solid #f1f1f1;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 20rpx;

		.cuIcon-cart {
			animationDelay: 0.5s;
			position: relative;
		}

		.badge {
			position: absolute;
			top: -20rpx;
			right: -20rpx;
			background-color: #E54D42;
			color: #fff;
		}
	}

	.right-btn {
		display: flex;
		justify-content: center;
		flex: 1;
		align-items: center;
		height: 100%;
	}

	.price {
		.symbol {
			font-size: 12px;
		}

		.number {
			font-size: 24px;
			margin: 0 5rpx;

			.float {
				font-size: 14px;
			}
		}
	}
</style>
