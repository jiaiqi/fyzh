<template>
	<view>
		<view class="u-flex user-box u-p-l-30 u-p-r-20 u-p-b-30"
			:style="{ width: '100%', 'padding-top': Number(navbarHeight) + statusBarHeight + 'px' }">
			<view class="user-box-main">
				<view class="u-m-r-20">
					<u-avatar size="120" v-if="needAuthProfile"></u-avatar>
					<view class="empty-profile" v-else-if="isLogin&&vuex_loginUser&&vuex_loginUser.id">
						<open-data type="userAvatarUrl"></open-data>
					</view>
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
			<view class="vip-card" v-if="!vuex_memberInfo||!vuex_memberInfo.id">
				<view class="not-vip">
					<view class="slogan text-brown ">
						<text class="cuIcon-choiceness margin-right-xs"></text>
						成为会员即可享受超多优惠
					</view>
					<button class="cu-btn round bg-black" @click="applyMember">会员申请</button>
				</view>
			</view>
			<view class="order-menu">
				<view class="title" @click="toOrderList('全部')">
					<text>我的订单</text>
					<text class="to-all">查看全部订单<text class="cuIcon-right"></text></text>
				</view>
				<view class="menu-item" @click="toOrderList(item.label)" v-for="item in menuList" :key="item.label">
					<text :class="[item.icon]"></text>
					<text class="label">{{item.label}}</text>
				</view>
			</view>

			<view class="u-m-t-20 menu-list">
				<u-cell-group>
					<u-cell-item icon="red-packet" title="钱包" @click="toPage('wallet')"></u-cell-item>
					<u-cell-item icon="coupon" title="优惠券" @click="toPage('coupon')"></u-cell-item>
					<u-cell-item icon="shopping-cart" title="购物车" @click="toPage('cart')"></u-cell-item>
					<u-cell-item icon="map" title="我的地址" @click="toAddress"></u-cell-item>
					<u-cell-item icon="account" title="我的战友" @click="toPage('contact')"></u-cell-item>
				</u-cell-group>
			</view>

			<view class="u-m-t-20  menu-list">
				<u-cell-group>
					<!-- <u-cell-item icon="setting" title="设置"></u-cell-item> -->
					<u-cell-item icon="gift" title="我的佣金" @click="toPage('kickback')"></u-cell-item>
					<u-cell-item icon="share" title="分享" @click="openShare"></u-cell-item>
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
		<u-popup v-model="showShareAction" mode="bottom" closeable>
			<view class="share-action">
				<button class="action-item" open-type="share">
					<view class="image">
						<image class="image" src="../../static/icon/timeline.png" mode=""></image>
					</view>
					<view class="label">
						分享给好友
					</view>
				</button>
				<button class="action-item" @click="getPosterImage">
					<view class="image">
						<image class="image" src="../../static/icon/poster.png" mode=""></image>
					</view>
					<view class="label">
						生成分享海报
					</view>
				</button>
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
				showShareAction: false,
				actionList: [{
						text: "分享给好友"
					},
					{
						text: '生成分享海报'
					}
				],
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
						label: '未支付',
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
			toAddress() {
				uni.chooseAddress({
					success(res) {
						console.log(res.userName)
						console.log(res.postalCode)
						console.log(res.provinceName)
						console.log(res.cityName)
						console.log(res.countyName)
						console.log(res.detailInfo)
						console.log(res.nationalCode)
						console.log(res.telNumber)
					}
				})
			},
			changeDate(e) {
				this.form.birth_day = e.target.value
			},
			openShare() {
				this.showShareAction = true
			},
			async getPosterImage() {
				uni.showToast({
					title: '功能正在开发中...',
					icon: 'none'
				})
				return
				const imgFileNo = '' //背景图file_no
				const qrcontent = '' //二维码内容
				const xp = '' //二维码x\y坐标 左上为原点 百分比
				const yp = ''
				const qrwidth = '' //二维码宽度
				const logoFileNo = '' //二维码logo的file_no
				const url =
					`/file/adv/download?imgFileNo=${imgFileNo}&qrcontent=${qrcontent}&xp=${xp}&yp=${yp}&qrwidth=${qrwidth}&logoFileNo=${logoFileNo}&bx_auth_ticket=${this.vuex_token}`
				let res = await this.$u.get(url)
				debugger
			},
			toPage(type, query) {
				if (!this.vuex_memberInfo || !this.vuex_memberInfo.id) {
					uni.showModal({
						title: '提示',
						content: '加入会员后才可进行此操作，是否申请加入会员？',
						success: (res) => {
							if (res.confirm) {
								this.applyMember()
							}
						}
					})
					return
				}
				let url = ''
				switch (type) {
					case 'coupon': //优惠券
						url = '/pages/mine/coupon/coupon'
						break;
					case 'wallet': //钱包
						url = '/pages/mine/wallet/wallet'
						break;
					case 'cart': //购物车
						url = '/pages/store/cart/cart'
						break;
					case 'contact': //分享人
						url = '/pages/mine/contact/contact'
						break;
					case 'kickback': //佣金记录
						url = '/pages/store/kickback/kickback'
						break;
				}
				uni.navigateTo({
					url
				})
			},
			applyMember() {
				// 申请加入会员
				uni.navigateTo({
					url: '/pages/mine/memberReg/memberReg'
				})
			},
			toOrderList(e) {
				if (!this.vuex_memberInfo || !this.vuex_memberInfo.id) {
					uni.showModal({
						title: '提示',
						content: '加入会员后才可进行此操作，是否申请加入会员？',
						success: (res) => {
							if (res.confirm) {
								this.applyMember()
							}
						}
					})
					return
				}
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
		},
		onShareAppMessage() {
			let path = `pages/index/mine/mine?from=share`;
			let title = ''
			if (this.vuex_memberInfo?.hy_no) {
				path += `&add_hy_no=${this.vuex_memberInfo.hy_no}`
			}
			if (this.vuex_memberInfo?.hy_name) {
				// path += `&invite_hy_name=${this.vuex_memberInfo.hy_name}`
				title = `${this.vuex_memberInfo.hy_name}邀请您使用枫叶健行小程序`
			}
			return {
				title,
				path
			};
		},
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
		min-height: 350rpx;
		background-color: #e6b980;
		background-image: linear-gradient(to bottom, #FEE4C3 0%, #FEE4C3 50%, #FEE4C3 80%, #FFEFDC 90%, #f1f1f1 100%);

		color: #fff;
		margin: 0 0 20rpx;
		padding-top: 20rpx;
		align-items: flex-start;

		.user-box-main {
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

	.main-box {
		position: relative;
		top: -80rpx;
	}

	.vip-card {
		margin: 20rpx;
		padding: 30rpx;
		border-radius: 20rpx;
		min-height: 100rpx;
		background-image: linear-gradient(to top, #fdcb8d 0%, #eacda3 100%);

		// background-image: linear-gradient(to top, #e6b980 0%, #eacda3 100%);
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
		border-radius: 20rpx;
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

	.share-action {
		display: flex;
		padding: 100rpx 20rpx;

		.action-item {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			background-color: #fff;
			border: none;

			&::after {
				border: none;
			}

			.image {
				width: 100rpx;
				height: 100rpx;
			}

			.label {
				margin-top: 10rpx;
			}
		}
	}
</style>
