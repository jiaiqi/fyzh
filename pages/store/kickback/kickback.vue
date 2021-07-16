<template>
	<view>
		<view class="number" v-if="vuex_memberInfo">
			<view class="digit">
				{{vuex_memberInfo.brokerage_amount}}
			</view>
			<view class="label">
				佣金余额
			</view>
		</view>
		<view class="record">
			<view class="record-item" v-for="item in record">
				<view class="value">
					<text class="type">
						{{item.bd_detail_type}}
					</text>
					{{item.bk_balance_after||0}}
				</view>
				<view class="date">
					{{item.create_time}}
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
				record: [],
				pageNo: 1,
				status: "loadmore", // 'nomore,loading,loadmore'
			}
		},
		methods: {
			refreshMember() {
				getMemberInfo()
			},
			getRecord(type) {
				const url = '/fyzhmd/select/srvstore_brokerage_detail_select'
				const req = {
					"serviceName": "srvstore_brokerage_detail_select",
					"colNames": ["*"],
					"condition": [{
						"colName": "hy_no",
						"ruleType": "eq",
						"value": this.vuex_memberInfo.hy_no
					}],
					"page": {
						"pageNo": this.pageNo,
						"rownumber": 50
					},
					"order": [],
				}
				this.status = 'loading'
				this.$u.post(url, req).then(res => {
					if (res.state === 'SUCCESS') {
						if (res.page) {
							if (res.page.total > res.page.rownumber * res.page.pageNo) {
								this.status = 'loadmore'
							} else {
								this.status = 'nomore'
							}
						}
						if (type === 'loadmore') {
							this.record = [...this.record, ...res.data]
						} else {
							this.record = res.data
						}
					}
				})
			},
		},
		created() {
			if (this.vuex_memberInfo?.hy_no) {
				this.getRecord()
			}
		},
		onPullDownRefresh() {
			this.getRecord()
			setTimeout(() => {
				uni.stopPullDownRefresh()
			}, 1000)
		},
		onReachBottom() {
			if (this.status === 'loadmore') {
				this.pageNo++
				this.getRecord('loadmore')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.number {
		margin: 20rpx;
		background-color: #18B566;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fff;
		font-weight: bold;
		font-size: 80rpx;
		border-radius: 20rpx;
		flex-direction: column;
		padding: 40rpx 0;

		.label {
			font-size: 32rpx;
			padding: 20rpx;
			font-weight: normal;
		}
	}
	.record-item{
		padding: 20rpx 40rpx;
		margin-bottom: 10rpx;
		background-color: #fff;
		display: flex;
		justify-content: space-between;
		.date{
			margin: 10rpx 0 ;
			color: #999;
		}
		.value{
			font-size: 40rpx;
			.type{
				color: #666;
				font-size: 24rpx;
				margin-right: 20rpx;
			}
		}
	}
</style>
