<template>
	<view>
		<u-navbar :is-back="false" title="　" :border-bottom="false" :background="background">
			<view class="u-flex u-row-right" style="width: 100%;">
				<!-- <view class="camera u-flex u-row-center">
					<u-icon name="camera-fill" color="#000000" size="48"></u-icon>
				</view> -->
			</view>
		</u-navbar>

		<view class="u-flex user-box u-p-l-30 u-p-r-20 u-p-b-30">
			<view class="u-m-r-20">
				<u-avatar size="140" v-if="needAuthProfile"></u-avatar>
				<u-avatar bg-color="#DB0011" :src="vuex_loginUser.headimgurl" size="140"
					v-else="isLogin&&vuex_loginUser&&vuex_loginUser.headimgurl"></u-avatar>
			</view>
			<view class="u-flex-1">
				<button class="cu-btn bg-red light " v-else @click="wxLogin" v-if="needAuthProfile">登录</button>
				<view class="u-font-18 u-p-b-20" v-else-if="vuex_loginUser&&vuex_loginUser.real_name">
					{{vuex_loginUser.real_name}}</view>
				<!-- <view class="u-font-14 u-tips-color">微信号:helang_uView</view> -->
			</view>
			<!-- 	<view class="u-m-l-10 u-p-10">
				<u-icon name="scan" color="#fff" size="28"></u-icon>
			</view>
			<view class="u-m-l-10 u-p-10">
				<u-icon name="arrow-right" color="#fff" size="28"></u-icon>
			</view> -->
		</view>
		<view class="order-menu">
			<view class="menu-item">
				<text class="cuIcon-pay"></text>
				<text>待付款</text>
			</view>
			<view class="menu-item">
				<text class="cuIcon-send"></text>
				<text>待收货</text>
			</view>
			<view class="menu-item">
				<text class="cuIcon-vipcard"></text>
				<text>已完成</text>
			</view>
			<view class="menu-item">
				<text class="cuIcon-form"></text>
				<text>全部订单</text>
			</view>
		</view>
		<view class="u-m-t-20">
			<u-cell-group>
				<u-cell-item icon="rmb-circle" title="支付"></u-cell-item>
			</u-cell-group>
		</view>

		<view class="u-m-t-20">
			<u-cell-group>
				<u-cell-item icon="star" title="收藏"></u-cell-item>
				<u-cell-item icon="photo" title="相册"></u-cell-item>
				<u-cell-item icon="coupon" title="卡券"></u-cell-item>
				<u-cell-item icon="heart" title="关注"></u-cell-item>
			</u-cell-group>
		</view>

		<view class="u-m-t-20">
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
				profile: '',
				background: {
					backgroundColor: '#FF5C4E',
					// 导航栏背景图
					// background: 'url(https://cdn.uviewui.com/uview/swiper/1.jpg) no-repeat',
					// 还可以设置背景图size属性
					// backgroundSize: 'cover',
					// 渐变色
					// backgroundImage: 'linear-gradient(45deg, rgb(28, 187, 180), rgb(141, 198, 63))'
				}
			}
		},
		onLoad() {

		},
		methods: {
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

		.empty-profile {
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

	.order-menu {
		display: flex;
		background-color: #Fff;
		padding: 20rpx 30rpx;
		margin-top: 20rpx;
		.menu-item {
			display: flex;
			flex: 1;
			flex-direction: column;
			text-align: center;
			
			text[class*='cuIcon-']{
				font-size:40rpx;
				mrgin-bottom:20rpx;
			}
		}
	}
</style>
