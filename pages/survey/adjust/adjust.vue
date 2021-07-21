<template>
	<view>
		<view class="tizhi-list">
			<view class="tizhi-item" v-for="(item,index) in list" @click="toDetail(item)">
				<view class="icon">
					<image class="image" :src="$u.api.getImagePath(item.tz_icon)" mode="aspectFit" v-if="item.tz_icon">
					</image>
					<image class="image" src="../../../static/icon/pinghe.png" mode="aspectFit" v-else></image>
				</view>
				<view class="label">
					{{item.tz_name}}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list: []
			}
		},
		methods: {
			toDetail(e) {
				uni.navigateTo({
					url: '/pages/survey/adjustDetail/adjustDetail?id=' + e.id
				})
			},
			loadData() {
				const url = '/fyzhmd/select/srvstore_health_body_solution_set_select'
				const req = {
					"serviceName": "srvstore_health_body_solution_set_select",
					"colNames": ["*"],
					"page": {
						"pageNo": 1,
						"rownumber": 10
					},
				}
				this.$u.post(url, req).then(res => {
					if (res.state === 'SUCCESS') {
						this.list = res.data
					}
				})
			},
		},
		created() {
			this.loadData()
		}
	}
</script>

<style lang="scss" scoped>
	.tizhi-list {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		background-color: #fff;
		min-height: calc(100vh - var(--window-top));
		padding:10rpx 20rpx;
		flex-wrap: wrap;
		.tizhi-item {
			flex: 1;
			min-width: calc(33% - 40rpx);
			border-right: 1px solid #f1f1f1;
			border-bottom: 1rpx solid #f1f1f1;
			text-align: center;
			padding: 20rpx;

			&:nth-child(3n+1) {
				border-left: 1rpx solid #f1f1f1;
			}

			&:nth-child(1),
			&:nth-child(2),
			&:nth-child(3) {
				border-top: 1rpx solid #f1f1f1;
			}

			.label {
				margin-top: 10rpx;
			}

			.image {
				width: 200rpx;
				height: 200rpx;
			}

		}
	}
</style>
