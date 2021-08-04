<template>
	<view>
		<!-- <image mode="scaleToFill" class="image-lazy-view no-load" ref="vref" onerror="this.src='/static/noneImg.png'"
			src="/static/img/load.gif" :data-src="imgSrc"></image> -->
		<image mode="scaleToFill" class="image-lazy-view " :src="imgSrc" v-if="imgSrc"></image>
		<view class="image-lazy-view " v-else>
			<u-icon name="photo"></u-icon>
			<!-- <text class="cuIcon-photo"></text> -->
		</view>
	</view>
</template>
<script>
	export default {
		props: {
			item: {
				type: Object,
				default () {
					return {}
				}
			},
			imgColName: {
				type: String,
				default: "img"
			},
			className: {
				type: String,
				default: "main-image"
			}
		},
		computed: {
			imgSrc() {
				if (this.item) {
					let val = this.item[this.imgColName]
					if (val) {
						if (val.indexOf('http') !== -1) {
							return val
						} else {
							return this.getImagePath(val, true)
						}
					}
				}

			}
		},
		data() {
			return {
				imageElements: []
			}
		},
		methods: {
			getImagePath(no, notThumb) {
				if (no && (no.indexOf('http://') !== -1 || no.indexOf('https://') !== -1)) {
					return no
				} else if (no) {
					if (no.indexOf('&bx_auth_ticket') !== -1) {
						no = no.split('&bx_auth_ticket')[0]
					}
					if (notThumb) {
						return this.$u.$api.downloadFile + no + '&bx_auth_ticket=' + uni.getStorageSync(
							'bx_auth_ticket');
					} else {
						return this.$u.$api.downloadFile + no + '&bx_auth_ticket=' + uni.getStorageSync(
								'bx_auth_ticket') +
							'&thumbnailType=fwsu_100';
					}
				} else {
					return ''
				}
			},
			throttle(fn, delay = 15, mustRun = 30) {
				let t_start = null
				let timer = null
				let context = this
				return function() {
					let t_current = +(new Date())
					let args = Array.prototype.slice.call(arguments)
					clearTimeout(timer)
					if (!t_start) {
						t_start = t_current
					}
					if (t_current - t_start > mustRun) {
						fn.apply(context, args)
						t_start = t_current
					} else {
						timer = setTimeout(() => {
							fn.apply(context, args)
						}, delay)
					}
				}
			},
		},
	}
</script>
<style lang="less" scoped>
	.image-lazy-view {
		height: 100%;
		width: 100% !important;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 30px;
		border: 1px solid #f1f1f1;
		border-radius: 10rpx;
		overflow: hidden;
	}

	.no-load {
		// background: url('/static/img/load.gif') no-repeat center; 
	}
</style>
