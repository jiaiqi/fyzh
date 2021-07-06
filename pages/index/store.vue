<template>
	<view>
		<goods-list image="gd_img" name="gd_name" desc="gd_desc" ref="goodsList" :list="goodsList"></goods-list>
		<u-loadmore :status="loadStatus" @loadmore="loadMore" :load-text="loadText" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
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
							let url = this.$u.getImagePath(cur['gd_img'], true);
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

</style>
