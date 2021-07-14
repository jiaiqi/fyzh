<template>
	<view>
		<view class="store-list">
			<view class="store-item" v-for="item in list" :key="item.id">
				<view class="left-image">
					<image :src="$u.api.getImagePath(item.icom)" mode="aspectFit" v-if="item.icom"></image>
					<text class="cuIcon-shop" v-else></text>
				</view>
				<view class="right-content">
					<view class="store-name">
						{{item.store_name}}
					</view>
					<view class="address">
						{{item.store_addr||'地址：xxxxxx'}}
						<text class="cuIcon-location"></text>
					</view>
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
			loadList() {
				const url = '/fyzhmd/select/srvstore_shop_mgmt_select'
				const req = {
					"serviceName": "srvstore_shop_mgmt_select",
					"colNames": ["*"],
					"condition": [],
					"page": {
						"pageNo": 1,
						"rownumber": 10
					},
					"order": []
				}
				this.$u.post(url, req).then(res => {
					if (res.state === 'SUCCESS') {
						this.list = res.data
					}
				})
			},
		},
		created() {
			this.loadList()
		}
	}
</script>

<style scoped lang="scss">
	.store-item{
		background-color: #fff;
		margin-top: 4rpx;
		padding: 20rpx 40rpx;
		display: flex;
		align-items: center;
	}
	.left-image {
		width: 100rpx;
		height: 100rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #F0F0F0;
		border-radius: 20rpx;
		margin-right: 20rpx;
		font-size: 40rpx;
	}
	.right-content{
		.address{
			margin-top: 10rpx;
			.cuIcon-location{
				margin-left: 10rpx;
			}
		}
	}
</style>
