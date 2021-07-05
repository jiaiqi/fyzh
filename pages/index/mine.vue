<template>
	<view>
		<u-navbar :is-back="false" title="我的" title-color="#000" :border-bottom="false" :background="background">
		</u-navbar>

		<view class="u-flex user-box u-p-l-30 u-p-r-20 u-p-b-30">
			<view class="u-m-r-20">
				<u-avatar size="140" v-if="needAuthProfile"></u-avatar>
				<view class="empty-profile" v-else-if="isLogin&&vuex_loginUser&&vuex_loginUser.id">
					<open-data type="userAvatarUrl"></open-data>
				</view>
				<!-- 	<u-avatar bg-color="#DB0011" :src="vuex_loginUser.headimgurl" size="140"
					v-else-if="isLogin&&vuex_loginUser&&vuex_loginUser.headimgurl"></u-avatar> -->
			</view>
			<view class="u-flex-1">
				<view class="u-font-18 u-p-b-20" v-if="isLogin&&vuex_loginUser&&vuex_loginUser.id">
					<open-data type="userNickName"></open-data>
				</view>
				<button class="cu-btn bg-red light " v-else @click="wxLogin" v-else-if="needAuthProfile">登录</button>
			</view>
		</view>
		<view class="vip-card" v-if="!vuex_memberInfo||vuex_memberInfo.length===0">
			<view class="not-vip" v-if="!vuex_memberInfo||vuex_memberInfo.length===0">
				<view class="slogan text-brown ">
					<text class="cuIcon-choiceness margin-right-xs"></text>
					成为会员即可享受超多优惠
				</view>
				<button class="cu-btn round bg-black" @click="applyMember">会员申请</button>
			</view>
			<view class="is-vip" v-else>

			</view>
		</view>
		<view class="order-menu">
			<view class="title">
				<text>我的订单</text>
				<text class="to-all" @click="toOrderList('全部')">查看全部订单<text class="cuIcon-right"></text></text>
			</view>
			<view class="menu-item" @click="toOrderList(item.label)" v-for="item in menuList" :key="item.label">
				<text :class="[item.icon]"></text>
				<text class="label">{{item.label}}</text>
			</view>
		</view>

		<view class="u-m-t-20 menu-list">
			<u-cell-group>
				<u-cell-item icon="shopping-cart" title="购物车" @click="toCart"></u-cell-item>
				<u-cell-item icon="coupon" title="卡券"></u-cell-item>
				<u-cell-item icon="heart" title="关注"></u-cell-item>
			</u-cell-group>
		</view>

		<view class="u-m-t-20  menu-list">
			<u-cell-group>
				<u-cell-item icon="setting" title="设置"></u-cell-item>
			</u-cell-group>
		</view>



	</view>
</template>

<script>
	import {
		wxOpenLogin
	} from '@/common/api.js'
	export default {
		data() {
			return {
				menuList: [{
						label: '待支付',
						icon: 'cuIcon-pay'
					},
					{
						label: '待发货',
						icon: 'cuIcon-send'
					},
					{
						label: '待收货',
						icon: 'cuIcon-deliver'
					}, {
						label: '已完成',
						icon: 'cuIcon-vipcard'
					}
					// , {
					// 	label: '全部',
					// 	icon: 'cuIcon-form'
					// }
				],
				profile: '',
				background: {
					backgroundColor: '#f1f1f1',
					// backgroundColor: '#FF5C4E',
					// 导航栏背景图
					// background: 'url(https://cdn.uviewui.com/uview/swiper/1.jpg) no-repeat',
					// 还可以设置背景图size属性
					// backgroundSize: 'cover',
					// 渐变色
					// backgroundImage: 'linear-gradient(45deg, rgb(28, 187, 180), rgb(141, 198, 63))'
				}
			}
		},
		methods: {
			toCart() {
				// 跳转到购物车页面
				uni.navigateTo({
					url: '/pages/store/cart/cart'
				})
			},
			applyMember() {
				// 申请加入会员
			},
			toOrderList(e) {
				uni.navigateTo({
					url: '/pages/store/orderList/orderList?type=' + e
				})
			},
			async getUserProfile(e) {
				// 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
				// 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
				return await wx.getUserProfile({
					desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
				})
			},
			wxLogin() {
				this.getUserProfile().then(res => {
					if (res && res.userInfo) {
						wxOpenLogin(res)
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	page {
		background-color: #ededed;
	}

	.camera {
		width: 54px;
		height: 44px;

		&:active {
			background-color: #ededed;
		}
	}

	.user-box {
		background-color: #FF5C4E;
		color: #fff;
		margin: 20rpx 20rpx 0;
		border-radius: 10rpx;
		padding-top: 20rpx;

		.empty-profile {
			overflow: hidden;
			width: 140rpx;
			height: 140rpx;
			line-height: 140rpx;
			font-size: 60rpx;
			text-align: center;
			border: 1px solid #fff;
			border-radius: 50%;
			margin-right: 20rpx;
		}
	}

	.vip-card {
		margin: 20rpx;
		padding: 30rpx;
		border-radius: 20rpx;
		min-height: 100rpx;
		background-image: linear-gradient(to top, #e6b980 0%, #eacda3 100%);

		.not-vip {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
	}

	.order-menu {
		margin: 0 20rpx;
		border-radius: 10rpx;
		display: flex;
		background-color: #Fff;
		padding: 20rpx 0;
		margin-top: 20rpx;
		flex-wrap: wrap;

		.title {
			padding: 10rpx 20rpx;
			padding-top: 0;
			width: 100%;
			margin-bottom: 10rpx;
			border-bottom: 1px solid #f1f1f1;
			display: flex;
			justify-content: space-between;

			.to-all {
				color: #999;
				font-size: 24rpx;
			}
		}

		.menu-item {
			display: flex;
			flex: 1;
			flex-direction: column;
			text-align: center;

			.label {
				font-size: 24rpx;
			}

			text[class*='cuIcon-'] {
				font-size: 60rpx;
				mrgin-bottom: 20rpx;
			}
		}
	}

	.menu-list {
		margin: 0 20rpx;
		border-radius: 10rpx;
		overflow: hidden;
	}
</style>
