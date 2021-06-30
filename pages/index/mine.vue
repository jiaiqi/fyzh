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
				<u-avatar bg-color="#DB0011" src="" size="140" v-if="is_login"></u-avatar>
				<u-avatar  size="140" v-else></u-avatar>
			</view>
			<view class="u-flex-1">
				<view class="u-font-18 u-p-b-20"  v-if="is_login">{{vuex_user.name}}</view>
				<view class="u-font-18 u-p-b-20" v-else @tap="wxLogin">登录</view>
				<!-- <view class="u-font-14 u-tips-color">微信号:helang_uView</view> -->
			</view>
		<!-- 	<view class="u-m-l-10 u-p-10">
				<u-icon name="scan" color="#fff" size="28"></u-icon>
			</view>
			<view class="u-m-l-10 u-p-10">
				<u-icon name="arrow-right" color="#fff" size="28"></u-icon>
			</view> -->
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
			wxLogin(){
				this.$u.api.wxLogin()
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
		.empty-profile{
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
</style>
