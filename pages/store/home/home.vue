<template>
	<view>
		<u-swiper :list="imgList" height="400"></u-swiper>
		<view class="store-info" v-if="info">
			<view class="store-icon">
				<image :src="$u.api.getImagePath(info.icon)" class="icon" mode="aspectFit" v-if="info.icon"></image>
				<view class="icon" v-else>
					<text class="cuIcon-shop"></text>
				</view>
			</view>
			<view class="store-intro">
				<view class="name">
					{{info.store_name}}
				</view>
				<view class="address">
					<text class="cuIcon-locationfill margin-right-xs text-blue"></text> {{info.store_addr||''}}
				</view>
			</view>
		</view>

		<view class="store-detail">
			<rich-text :nodes="info.store_intro"></rich-text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: '',
				info: null,
				imgList: [{
						image: 'https://cdn.uviewui.com/uview/swiper/1.jpg',
						title: '昨夜星辰昨夜风，画楼西畔桂堂东'
					},
					{
						image: 'https://cdn.uviewui.com/uview/swiper/2.jpg',
						title: '身无彩凤双飞翼，心有灵犀一点通'
					},
					{
						image: 'https://cdn.uviewui.com/uview/swiper/3.jpg',
						title: '谁念西风独自凉，萧萧黄叶闭疏窗，沉思往事立残阳'
					}
				]
			}
		},
		onLoad(option) {
			if (option.id) {
				this.id = option.id
				this.getInfo()
			}
		},
		methods: {
			getImages() {

			},
			getInfo() {
				const url = '/fyzhmd/select/srvstore_shop_mgmt_select'
				const req = {
					"serviceName": "srvstore_shop_mgmt_select",
					"colNames": ["*"],
					"condition": [{
						colName: "id",
						ruleType: 'eq',
						value: this.id
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 50
					},
					"order": []
				}
				this.$u.post(url, req).then(res => {
					if (res.state === 'SUCCESS' && Array.isArray(res.data) && res.data.length > 0) {
						this.info = res.data[0]
					}
				})

			},
		}
	}
</script>

<style lang="scss" scoped>
	.store-info {
		background-color: #fff;
		display: flex;
		padding: 20rpx;
		align-items: center;
		flex-wrap: wrap;

		.store-intro {
			flex: 1;

			.name {
				font-weight: bold;
				font-size: 36rpx;
			}

			.address {
				width: 100%;
			}
		}

		.store-icon {
			margin-right: 20rpx;
			.icon {
				width: 100rpx;
				height: 100rpx;
				border-radius: 10rpx;
				border: 1px solid #f1f1f1;
				text-align: center;
				line-height: 100rpx;
				font-size: 80rpx;
			}

		}

	}

	.store-detail {
		padding:20rpx;
		background-color: #fff;
		color: #333;
		margin-top: 10rpx;
	}
</style>
