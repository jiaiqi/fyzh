<template>
	<view>
<!-- 		<cu-custom :isBack="true">
			<view class="" slot="content">
			</view>
		</cu-custom> -->
		<view class="top-card">
			<view class="user-box">
				<view class="u-m-r-20">
					<view class="empty-profile" v-if="isLogin&&vuex_loginUser&&vuex_loginUser.id">
						<open-data type="userAvatarUrl"></open-data>
					</view>
					<view class="empty-profile" v-else>
						<u-avatar size="110"></u-avatar>
					</view>
				</view>
				<view class="u-flex-1">
					<view class="u-font-18 u-p-b-20 text-white" v-if="isLogin&&vuex_loginUser&&vuex_loginUser.id">
						<text class="cuIcon-vip margin-right-xs"></text>
						<open-data type="userNickName"></open-data>
					</view>
					<view class="u-font-18 u-p-b-20 text-white" v-else>
						未知用户
					</view>
					<view class="join-date" v-if="vuex_loginUser.create_time">
						{{$u.timeFormat(vuex_loginUser.create_time, 'yyyy年mm月dd日')}}加入会员
					</view>
				</view>
			</view>
			<view class="credits-overview"  v-if="vuex_memberInfo">
				<view class="credits-item">
					<view class="value">
						{{vuex_memberInfo.recharge_balance||0}}
					</view>
					<view class="label">
						金币
					</view>
				</view>
				<view class="credits-item">
					<view class="value">
						{{vuex_memberInfo.jifen_balance||0}}
					</view>
					<view class="label">
						积分
					</view>
				</view>
			</view>
		</view>
		<view class="history-box">
			<view class="sub-box">
				<u-subsection :list="subList" :current="curSub" active-color="#fff"  buttonColor="#ff9900"
					@change="changeSub">
				</u-subsection>
			</view>
			<view class="history-list">
				<view class="list-item" v-for="item in currentList" :key="item.id">
					<view class="left">
						<view class="label">
							{{item.srv_type||item.jf_type}}
						</view>
						<view class="date">
							{{item.create_time}}
						</view>
					</view>
					<view class="right">
						{{getSymbol(item)||''}}
						{{item.coin_count||item.score||0}}
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getMemberInfo
	} from '@/common/api.js'
	export default {
		data() {
			return {
				curSub: 0,
				subList: [{
						name: "金币明细" //充值卡流水
					},
					{
						name: "积分明细" //康宝卡积分
					}
				],
				credits: [], //积分数据
				yearCard: [], //年卡
				memberCard: [], //会员卡
				creditsList: [], // 积分使用记录
				memUsedList: [], // 会员金币使用记录
				recordPageNo: 1,
				recordStatus: "loadmore"
			}
		},
		computed: {
			currentList() {
				if (this.curSub === 0) {
					return this.memUsedList
				} else {
					return this.creditsList
				}
			},
			// totalMemberAmount() {
			// 	return this.memberCard.reduce((pre, cur) => {
			// 		if (!isNaN(Number(cur.coin_count))) {
			// 			return pre + Number(cur.coin_count)
			// 		} else {
			// 			return pre
			// 		}
			// 	}, 0)
			// },
			// totalCredits() {
			// 	return this.credits.reduce((pre, cur) => {
			// 		if (!isNaN(Number(cur.score))) {
			// 			return pre + Number(cur.score)
			// 		} else {
			// 			return pre
			// 		}
			// 	}, 0)
			// }
		},
		created() {
			// // 查找会员卡数据
			// this.loadData('srvstore_member_card_select', 'memberCard')
			// // 查找年卡数据
			// this.loadData('srvstore_year_card_select', 'yearCard')
			// // 查找积分数据
			// this.loadData('srvstore_score_card_select', 'credits')
			// 会员卡消费记录
			this.loadHistory()
			getMemberInfo()
		},
		onPullDownRefresh() {
			getMemberInfo()
			this.loadHistory()
			setTimeout(()=>{
				uni.stopPullDownRefresh()
			},1000)
		},
		// onReachBottom() {
			
		// },
		methods: {
			getSymbol(e) {
				if (e.srv_type) {
					if (e.srv_type === '充值') {
						return '+'
					} else if (e.srv_type === '消费') {
						return '-'
					}
				} else if (e.jf_type) {
					if (e.jf_type === '积分') {
						return '+'
					} else if (e.jf_type === '扣分') {
						return '-'
					}
				}

			},
			changeSub(e) {
				this.curSub = e
				this.recordStatus = 'loadmore'
				this.recordPageNo = 1
				this.loadHistory()
			},
			loadHistory() {
				const serviceName = this.curSub === 0 ? "srvstore_member_card_transaction_record_select" :
					"srvstore_score_card_record_select"
				const url = `/fyzhmd/select/${serviceName}`
				const req = {
					"serviceName": serviceName,
					"colNames": ["*"],
					"condition": [{
						"colName": "hy_no",
						"ruleType": "eq",
						"value": this.vuex_memberInfo.hy_no
					}],
					"page": {
						"pageNo": this.recordPageNo,
						"rownumber": 90
					}
				}
				this.$u.post(url, req).then(res => {
					if (res.state === 'SUCCESS') {
						let {page} = res
						if(page&&page)
						if (this.curSub === 0) {
							this.memUsedList = res.data
						} else {
							this.creditsList = res.data
						}
					}
				})
			},
			loadData(serviceName, key) {
				const url = `/fyzhmd/select/${serviceName}`
				const req = {
					"serviceName": serviceName,
					"colNames": ["*"],
					"condition": [{
						"colName": "hy_no",
						"ruleType": "eq",
						"value": this.vuex_memberInfo.hy_no
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 30
					}
				}
				if (!serviceName || !key) {
					return
				}
				this.$u.post(url, req).then(res => {
					if (res.state === 'SUCCESS') {
						this[key] = res.data
					}
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.top-card {
		min-height: 300rpx;
		margin: 20rpx;
		border-radius: 20rpx;
		background: #F85032;
		background: linear-gradient(to bottom left, #F85032 0%, #F16F5C 0%, #F6290C 96%, #F02F17 100%, #E73827 100%);
		overflow: hidden;

		.user-box {
			display: flex;
			align-items: center;
			padding: 20rpx;

			.join-date {
				font-size: 24rpx;
				color: #FFEFDC;
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
				border: 6rpx solid #FEE4C3;
			}
		}

		.credits-overview {
			display: flex;
			margin-top: 20rpx;
			background-image: linear-gradient(to top, #F16F5C 0%, #F16F5C 50%, rgba(255, 255, 255, 0.1) 100%);

			.credits-item {
				padding: 20rpx;
				flex: 1;
				display: flex;
				justify-content: center;
				align-items: center;
				border-right: 1px solid rgba($color: #fff, $alpha: 0.2);
				color: #f1f1f1;
				flex-direction: column;

				&:last-child {
					border-right: none;
				}

				.value {
					margin-bottom: 5rpx;
					font-size: 50rpx;
				}
			}
		}
	}

	.history-box {
		padding: 20rpx;
		margin: 20rpx;
		border-radius: 20rpx;
		background-color: #fff;
		.sub-box{
			width: 80%;
			margin: 0 auto;
		}
		.history-list {
			margin-top: 20rpx;
		}

		.list-item {
			display: flex;
			padding: 20rpx 10rpx;
			border-bottom: 1px solid #f1f1f1;

			.left {
				flex: 1;
				display: flex;
				flex-direction: column;

				.date {
					font-size: 24rpx;
					margin-top: 10rpx;
					color: #666;
				}
			}

			.right {
				color: #E54D42;
				font-size: 50rpx;
			}
		}
	}
</style>
