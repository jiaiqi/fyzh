<template>
	<view class="coupon-wrap">
		<view class="coupon-content" v-for="coupon in couponList" :key="coupon.id">
			<view class="left">
				<view class="sum">
					￥
					<text class="num">{{coupon.value}}</text>
				</view>
				<!-- <view class="type">{{coupon.cp_name}}</view> -->
			</view>
			<view class="right">
				<text>{{coupon.cp_name}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				couponList: []
			}
		},
		methods: {
			getList() {
				if (!this.vuex_memberInfo?.hy_no) {
					return
				}
				const url = '/fyzhmd/select/srvstore_sales_coupon_detail_select'
				const req = {
					"serviceName": "srvstore_sales_coupon_detail_select",
					"colNames": ["*"],
					"condition": [{
						colName: 'hy_no',
						ruleType: 'eq',
						value: this.vuex_memberInfo.hy_no
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 50
					}
				}
				this.$u.post(url, req).then(res => {
					if (res.state === 'SUCCESS') {
						this.couponList = res.data
					}
				})
			}
		},
		created() {
			this.getList()
		},
		onPullDownRefresh() {
			this.getList()
			setTimeout(()=>{
				uni.stopPullDownRefresh()
			},500)
		}
	}
</script>

<style scoped lang="scss">
	.coupon-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: calc(100vh - var(--window-top));
		background-color: #F3F4F6;
	}

	.coupon-content {
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

		.right {
			padding: 20rpx 20rpx 0;
			font-size: 28rpx;
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 40rpx;
			font-weight: bold;
			letter-spacing: 5rpx;
		}
	}
</style>
