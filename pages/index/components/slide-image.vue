<template>
	<u-swiper :list="swiperList" :height="300" border-radius="0"></u-swiper>
</template>

<script>
	export default {
		computed: {
			calcStyle() {
				if (this.pageItem && (this.pageItem.margin || this.pageItem.margin == 0)) {
					return {
						margin: this.pageItem.margin
					}
				}
			},
		},
		props: {
			pageItem: {
				type: Object
			},
		},
		data() {
			return {
				swiperList: []
			}
		},
		watch: {
			pageItem:{
				immediate:true,
				handler(newValue, oldValue) {
				if(newValue&&newValue.id){
					this.$u.api.getItemDetail(newValue).then(data=>{
						this.swiperList = data
					})
				}
			}
			}
		},
		created() {
			// this.getSwiperList()
		},
		methods: {
			async getSwiperList() {
				let image = this?.pageItem?.swiper_image
				if (image) {
					let res = await this.$u.api.getFilePath(image);
					if (Array.isArray(res)) {
						let swiperList = res.reduce((pre, cur) => {
							if (cur.fileurl) {
								cur.url = this.$api.getFilePath + cur.fileurl + '&bx_auth_ticket=' + uni
									.getStorageSync('bx_auth_ticket');
							}
							pre.push(cur);
							return pre;
						}, []);
						this.swiperList = swiperList
						return swiperList
					} else {
						return []
					}
				}
			},
		},
	}
</script>
