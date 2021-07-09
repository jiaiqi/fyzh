<template>
	<view class="store-wrap">
		<u-navbar :is-back="false" title-color="#000" :border-bottom="false" :background="background">
			<view class="utils-bar">
				<view class="util-item" @click="changeLayout">
					<text class="cuIcon-list" v-if="layout==='double'"></text>
					<text class="cuIcon-cascades" v-else></text>
				</view>
			</view>
		</u-navbar>
		<view class="u-p-20 bg-white">
			<u-swiper :list="swiperList" border-radiu="20" :effect3d="false" :height="300"
				@click="clickImage"></u-swiper>
		</view>
		<view class="goods-layout">
			<goods-list image="gd_img" name="gd_name" desc="gd_desc" ref="goodsList" :list="goodsList"
				:defaultLayout="layout"></goods-list>
			<u-loadmore :status="loadStatus" @loadmore="loadMore" :load-text="loadText" />
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				background: {
					backgroundColor: '#fff',
					// backgroundImage: 'linear-gradient(45deg, rgb(28, 187, 180), rgb(141, 198, 63))',
					// backgroundImage: 'linear-gradient( 135deg, #81FBB8 10%, #28C76F 100%)'
				},
				swiperList: [{
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
				],
				goodsList: [],
				loadText: {
					loadmore: '点击或上拉加载更多',
					loading: '努力加载中',
					nomore: '实在没有了'
				},
				page: {
					rownumber: 10,
					pageNo: 1
				},
				layout: 'double',
				loadStatus: "loadmore", //loading / nomore
			};
		},
		onReachBottom() {
			if (this.loadStatus === 'loadmore') {
				this.page.pageNo++
				this.getList('loadmore')
			}
		},
		onPullDownRefresh() {
			this.page.pageNo = 1
			this.getList()
			setTimeout(() => {
				uni.stopPullDownRefresh()
			}, 1000)
		},
		created() {
			this.getList()
		},
		methods: {
			changeLayout(){
				this.layout === 'double' ? this.layout = 'single' : this.layout = 'double'
			},
			clickImage(e) {

			},
			loadMore() {
				if (this.loadStatus === 'loadmore') {
					this.page.pageNo++
					this.getList('loadmore')
				}
			},
			getList(type) {
				let req = {
					"serviceName": "srvstore_goods_mgmt_select",
					"colNames": ["*"],
					"condition": [],
					"page": {
						"pageNo": this.page.pageNo,
						"rownumber": this.page.rownumber
					},
					"order": [],
				}
				let url = '/fyzhmd/select/srvstore_goods_mgmt_select'
				this.loadStatus = 'loading'
				this.$u.post(url, req).then(res => {
					this.page = res.page
					if (res.page.total <= res.page.pageNo * res.page.rownumber) {
						this.loadStatus = 'nomore'
					} else {
						this.loadStatus = 'loadmore'
					}
					if (Array.isArray(res.data)) {
						let list = res.data.reduce((pre, cur) => {
							let url = this.$u.getImagePath(cur['gd_img']);
							cur.url = url;
							if (cur['gd_img']) {
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
						if (type === 'loadmore') {
							this.goodsList = [...this.goodsList, ...list]
						} else {
							this.goodsList = list
						}
					}
				}).catch(err => {
					this.loadStatus = 'loadmore'
				})
			},
			setPicHeight(content) {
				let maxW = uni.upx2px(350);
				content.h = (maxW * content.h) / content.w;
				content.w = maxW;
				return content;
			},
		},

	}
</script>

<style lang="scss" scoped>
	.utils-bar {
		flex: 1;
		padding:  0 20rpx;
		text[class*=cuIcon-] {
			font-size: 40rpx;
		}
	}
	.store-wrap{
		background-color: #fbf8f8;
	}
</style>
