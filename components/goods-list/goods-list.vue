<template>
	<view class="goods-list" :style="[calcStyle]" :class="[layout]">
		<view class="utils-bar">
			<view class="util-item" @click="changeLayout">
				<text class="cuIcon-list" v-if="layout==='double'"></text>
				<text class="cuIcon-cascades" v-else></text>
			</view>
		</view>
		<view class="single" v-if="layout==='single'">
			<view class="goods-item" v-for="(item,index) in goodsList" @click="toGoodsDetail(item)">
				<u-lazy-load class="image"  height="200" :image="item.url" :index="index"
					error-img="@/static/icon/goods.png" v-if="item.url">
				</u-lazy-load>
				<u-lazy-load class="image"  height="200" image="/static/icon/goods.png" v-else />
				<view class="goods-info">
					<view class="goods-name">{{ item[name]||'' }}</view>
					<view class="desc" v-html="item[desc]" v-if="item[desc]"></view>
					<view class="price text-cyan">
						<text class="symbol">￥</text>
						<text class="number">{{ item[price] }}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="double-column" v-if="layout==='double'">
			<view class="left-list">
				<view class="goods-item" v-for="(item,index) in leftList" @click="toGoodsDetail(item)">
					<u-lazy-load  height="200" :image="item.url" v-if="item.url" :index="index"
						error-img="@/static/icon/goods.png">
					</u-lazy-load>
					<u-lazy-load class="image" threshold="-450" height="200" image="/static/icon/goods.png" v-else />
					<view class="goods-info">
						<view class="goods-name">{{ item[name]||'' }}</view>
						<view class="desc" v-html="item[desc]" v-if="item[desc]"></view>
						<view class="price text-cyan">
							<text class="symbol">￥</text>
							<text class="number">{{ item[price] }}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="right-list">
				<view class="goods-item" v-for="item in rightList" @click="toGoodsDetail(item)">
					<u-lazy-load threshold="-450" :image="item.url" v-if="item.url" :index="index"
						error-img="@/static/icon/goods.png">
					</u-lazy-load>
					<u-lazy-load class="image" threshold="-450" height="200" image="/static/icon/goods.png" v-else />
					<view class="goods-info">
						<view class="goods-name">{{ item[name]||'' }}</view>
						<view class="desc" v-html="item[desc]" v-if="item[desc]"></view>
						<view class="price text-cyan">
							<text class="symbol">￥</text>
							<text class="number">{{ item[price] }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	/**
	 * 商品列表组件
	 * @description 商品列表组件
	 * @property {Array} list 商品数据
	 * @property {String} image 图片字段
	 * @property {String} name 商品名字字段
	 * @property {String} desc 商品描述字段
	 * @property {String} price 商品价格字段
	 * @event {Function} toGoodsDetail 跳转到商品详情
	 * @example <good-list :list=""></good-list>
	 */

	export default {
		name: 'good-list',
		computed: {
			calcStyle() {
				if (this.pageItem && (this.pageItem.margin || this.pageItem.margin == 0)) {
					return {
						margin: this.pageItem.margin
					}
				}
			},
		},
		data() {
			return {
				errorImg: require('@/static/icon/goods.png'),
				layout: "single",
				leftList: [],
				rightList: [],
				goodsList: [],
				page: {
					total: 0,
					rownumber: 10,
					pageNo: 1
				}
			};
		},
		watch: {
			list: {
				handler(newValue, oldValue) {
					if (Array.isArray(newValue)) {
						this.goodsList = newValue
						let leftList = []
						let rightList = []
						newValue.forEach((item, index) => {
							if (index % 2 === 0) {
								leftList.push(item)
							} else {
								rightList.push(item)
							}
						})
						this.leftList = leftList
						this.rightList = rightList
					}
				}
			}
		},
		created() {
			
			// this.getGoodsListData()
			if (this.defaultLayout) {
				this.layout = this.defaultLayout
			}
		},
		methods: {
			changeLayout() {
				this.layout === 'double' ? this.layout = 'single' : this.layout = 'double'
			},
			getGoodsListData(type) {
				let req = {
					"serviceName": "srvstore_goods_mgmt_select",
					"colNames": ["*"],
					"condition": [],
					"relation_condition": {},
					"page": {
						"pageNo": this.page.pageNo,
						"rownumber": this.page.rownumber
					}
				}
				let url = '/fyzhmd/select/srvstore_goods_mgmt_select'
				this.$u.post(url, req).then(res => {
					if (Array.isArray(res.data)) {
						this.page = res.page
						let list = res.data.reduce((pre, cur) => {
							let url = this.$u.getImagePath(cur[this.image], true);
							cur.url = url;
							if (cur[this.image]) {
								this.$u.getImageInfo({
									url: url
								}).then(picInfo => {
									if (picInfo.w && picInfo.h) {
										let res = this.setPicHeight(picInfo);
										if (res.w && res.h) {
											this.$set(cur, 'imgWidth', res.w);
											this.$set(cur, 'imgHeight', res.h);
										}
									}
								});
							}
							pre.push(cur)
							return pre
						}, []);
						let leftList = []
						let rightList = []
						list.forEach((item, index) => {
							if (index % 2 === 0) {
								leftList.push(item)
							} else {
								rightList.push(item)
							}
						})
						if (type === 'loadmore') {
							this.leftList = [...this.leftList, ...leftList]
							this.rightList = [...this.rightList, ...rightList]
						} else {
							this.leftList = leftList
							this.rightList = rightList
						}
					}
				});
			},
			setPicHeight(content) {
				let maxW = uni.upx2px(350);
				content.h = (maxW * content.h) / content.w;
				content.w = maxW;
				return content;
			},
			toGoodsDetail(e) {
				if (e.gd_no) {
					uni.navigateTo({
						url: '/pages/store/GoodsDetail/GoodsDetail?gd_no=' + e.gd_no
					});
				}
			}
		},
		props: {
			defaultLayout: {
				type: String,
				default: "single"
			},
			storeNo: {
				type: String
			},
			list: {
				type: Array
			},
			image: {
				type: String,
				default: 'image'
			},
			name: {
				type: String,
				default: 'name'
			},
			desc: {
				type: String,
				default: 'description'
			},
			price: {
				type: String,
				default: 'price'
			}
		}
	};
</script>

<style scoped lang="scss">
	.goods-list {
		display: flex;
		// flex-wrap: wrap;
		// column-count: 2;
		// column-gap: 10px;
		// padding: 0 5px 20px;
		flex-direction: column;

		&.single {}

		.utils-bar {
			margin: 20rpx 20rpx 0;
			flex: 1;
			background-color: #fff;
			padding: 20rpx;
			display: flex;
			justify-content: flex-end;
			border-radius: 20rpx;

			text[class*=cuIcon-] {
				font-size: 40rpx;
			}
		}

		.double-column {
			display: flex;
			padding-left: 20rpx;
		}

		.single {
			padding: 20rpx;

			.goods-item {
				width: 100%;
				// display: flex;
				// align-items: center;
				min-height: 200rpx;

				.image {
					text-align: center;
					min-height: 100rpx;
					font-size: 40rpx;
				}

				.goods-info {
					flex: 1;
					margin-left: 20rpx;
				}
			}
		}

		.left-list,
		.right-list {
			padding-left: 20rpx;
			padding: 20rpx 0;
			flex: 1;
			margin-right: 20rpx;
		}
	}

	.goods-item {
		border-radius: 10px;
		overflow: hidden;
		background-color: #fff;
		break-inside: avoid;
		margin-bottom: 20rpx;

		// box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
		&:nth-child(2n) {
			margin-right: 0;
		}
	}

	.goods-image {
		width: 100%;
		height: 100rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 20px;
		font-weight: bold;
		border: 1px solid #fff;
	}

	.goods-info {
		padding: 10rpx;
		width: 100%;
		margin-top: 5px;
		font-size: 16px;

		.desc {
			font-size: 12px;
			color: #aaa;
			margin-top: 5px;
		}

		.price {
			margin-top: 20rpx;

			.symbol {
				font-size: 12px;
			}

			.number {
				font-size: 20px;
			}
		}
	}

	.goods-name {
		text-align: left;
	}
</style>
