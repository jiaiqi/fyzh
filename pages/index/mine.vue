<template>
	<view>
		<!-- 		<u-navbar :is-back="false" title="我的" title-color="#000" :border-bottom="false" :background="background">
		</u-navbar> -->
		<view class="u-flex user-box u-p-l-30 u-p-r-20 u-p-b-30"
			:style="{ width: '100%', 'padding-top': Number(navbarHeight) + statusBarHeight + 'px' }">
			<view class="user-box-main">
				<view class="u-m-r-20">
					<u-avatar size="120" v-if="needAuthProfile"></u-avatar>
					<view class="empty-profile" v-else-if="isLogin&&vuex_loginUser&&vuex_loginUser.id">
						<open-data type="userAvatarUrl"></open-data>
					</view>
					<!-- 	<u-avatar bg-color="#DB0011" :src="vuex_loginUser.headimgurl" size="120"
						v-else-if="isLogin&&vuex_loginUser&&vuex_loginUser.headimgurl"></u-avatar> -->
				</view>
				<view class="u-flex-1">
					<view class="u-font-18 u-p-b-20 text-black" v-if="isLogin&&vuex_loginUser&&vuex_loginUser.id">
						<open-data type="userNickName"></open-data>
					</view>
					<button class="cu-btn bg-red light " v-else @click="wxLogin" v-else-if="needAuthProfile">登录</button>
				</view>
			</view>
		</view>
		<view class="main-box">
			<view class="vip-card"  v-if="!vuex_memberInfo||!vuex_memberInfo.id">
				<view class="not-vip">
					<view class="slogan text-brown ">
						<text class="cuIcon-choiceness margin-right-xs"></text>
						成为会员即可享受超多优惠
					</view>
					<button class="cu-btn round bg-black" @click="applyMember">会员申请</button>
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
					<u-cell-item icon="coupon" title="钱包" @click="toCoupon"></u-cell-item>
					<!-- <u-cell-item icon="gift" title="积分"></u-cell-item> -->
				</u-cell-group>
			</view>
			
			<view class="u-m-t-20  menu-list">
				<u-cell-group>
					<u-cell-item icon="setting" title="设置"></u-cell-item>
				</u-cell-group>
			</view>
		</view>
		
		
		<u-popup v-model="showJoinMember" mode="bottom" closeable>
			<view class="join-member">
				<u-form :model="form" ref="uForm" label-position="top" :border-bottom="false">
					<u-form-item label="姓名" :border-bottom="false">
						<u-input v-model="form.hy_name" border />
					</u-form-item>
					<u-form-item label="电话" :border-bottom="false">
						<u-input v-model="form.phone" border />
					</u-form-item>
					<u-form-item label="生日" :border-bottom="false">
						<view class="date-picker">
							<picker mode="date" :value="form.birth_day" @change="changeDate">
								<view class="uni-input" v-if="form.birth_day">{{form.birth_day||'点击选择日期'}}</view>
								<view class=" place-holder" v-else>点击选择日期</view>
							</picker>
						</view>
					</u-form-item>
					<u-form-item label="住址" :border-bottom="false">
						<u-input v-model="form.addr" border />
					</u-form-item>
					<u-form-item label="爱好" :border-bottom="false">
						<u-input v-model="form.hobby" border />
					</u-form-item>
				</u-form>
				<view class="button-box">
					<button type="primary" class="cu-btn bg-blue">下一步</button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	import {
		wxOpenLogin
	} from '@/common/api.js'
	// 获取系统状态栏的高度
	let systemInfo = uni.getSystemInfoSync();
	let menuButtonInfo = {};
	// 如果是小程序，获取右上角胶囊的尺寸信息，避免导航栏右侧内容与胶囊重叠(支付宝小程序非本API，尚未兼容)
	// #ifdef MP-WEIXIN || MP-BAIDU || MP-TOUTIAO || MP-QQ
	menuButtonInfo = uni.getMenuButtonBoundingClientRect();
	// #endif
	export default {
		computed: {
			navbarHeight() {
				// #ifdef APP-PLUS || H5
				return this.height ? this.height : 44;
				// #endif
				// #ifdef MP
				// 小程序特别处理，让导航栏高度 = 胶囊高度 + 两倍胶囊顶部与状态栏底部的距离之差(相当于同时获得了导航栏底部与胶囊底部的距离)
				// 此方法有缺陷，暂不用(会导致少了几个px)，采用直接固定值的方式
				// return menuButtonInfo.height + (menuButtonInfo.top - this.statusBarHeight) * 2;//导航高度
				let height = systemInfo.platform == 'ios' ? 44 : 48;
				return this.height ? this.height : height;
				// #endif
			}
		},
		data() {
			return {
				menuButtonInfo: menuButtonInfo,
				statusBarHeight: systemInfo.statusBarHeight,
				form: {
					// 基本信息
					hy_name: "", //会员姓名
					hy_role: "推广员", //会员角色
					phone: "", //电话
					birth_day: "", //生日,
					addr: "", //住址
					hobby: "", //爱好
					family_member: "", //家庭成员
					// 健康信息
					medical_history: "", //既往病史
					family_history: "", //家族史,
					liability_disease: "", //易患疾病,
					regular_medication: "", //常服药物,
					regular_health_care_products: "", //常服保健品
				},
				showJoinMember: false,
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

			changeDate(e) {
				this.form.birth_day = e.target.value
			},
			toCoupon(){
				// 跳转到卡券页面
				uni.navigateTo({
					url:'/pages/mine/coupon/coupon'
				})
			},
			toCart() {
				// 跳转到购物车页面
				uni.navigateTo({
					url: '/pages/store/cart/cart'
				})
			},
			applyMember() {
				// 申请加入会员
				uni.navigateTo({
					url: '/pages/mine/memberReg/memberReg'
				})
				// this.showJoinMember = true
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
		min-height:350rpx;
		background-color: #e6b980;
		background-image: linear-gradient(to bottom, #FEE4C3 0%, #FEE4C3 50%,#FEE4C3 80%,#FFEFDC 90%, #f1f1f1 100%);
		color: #fff;
		margin: 0 0 20rpx;
		padding-top: 20rpx;
		align-items: flex-start;
		.user-box-main{
			display: flex;
			align-items: center;
		}
		.empty-profile {
			overflow: hidden;
			width: 120rpx;
			height: 120rpx;
			line-height: 120rpx;
			font-size: 50rpx;
			text-align: center;
			border-radius: 50%;
			margin-right: 20rpx;
		}
	}

	.main-box{
		position: relative;
		top: -80rpx;
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
		border-radius: 20rpx;
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
		border-radius:20rpx;
		overflow: hidden;
	}

	.join-member {
		padding: 20rpx;

		.button-box {
			text-align: center;
			padding: 20rpx;
		}

		.date-picker {
			padding: 0 10px;
			border-color: #dcdfe6;
			text-align: left;
			border-radius: 6rpx;
			border: 1px solid #dcdfe6;

			.place-holder {
				color: #dcdfe6;
			}
		}
	}
</style>
