<template>
	<view class="menu-list" :style="[calcStyle]">
		<swiper class="swiper" :class="{
        'rectangle-dot': pageItem.button_style !== 'grid',
        'grid-style': pageItem.button_style === 'grid',
      }" :style="{ height: swiperHeight + 'px' }" indicator-active-color="#00aaff" indicator-color="#ccc"
			:indicator-dots="indicatorDots" :autoplay="false" v-if="menuList.length > 1">
			<swiper-item v-for="(swiperItem, swiperIndex) in menuList" :key="swiperIndex">
				<view class="swiper-item">
					<view class="menu-item" :class="{ 'grid-style': pageItem.button_style === 'grid' }"
						@click="toPages(item)" v-for="(item, index) in swiperItem" :key="index">
						<image class="icon image" :src="item.icon" mode="aspectFit">
							<text :class="item.icon" style="font-size: 30px; color: #00aaff"
								v-if="item.iconType === 'font'"></text>
							<text class="title">{{ item.label }}</text>
						</image>
					</view>
				</view>
			</swiper-item>
		</swiper>
		<view class="swiper-item single-layout" v-else-if="menuList.length === 1">
			<view class="menu-item" :class="{
          'grid-style': pageItem.button_style === 'grid',
          'last-row': isLastRow(menuList[0], index),
        }" @click="toPages(item)" v-for="(item, index) in menuList[0]" :key="index">
				<!-- 		<u-icon :name="item.icon" size="60" color="#00aaff"
					v-if="item.iconType === 'uicon' && !item.custonIcon">
				</u-icon>
				<u-icon custom-prefix="custom-icon" :name="item.icon" size="60" color="#00aaff"
					v-else-if="item.iconType === 'uicon' && item.custonIcon">
				</u-icon> -->
				<image class="icon image" :src="item.icon" mode="aspectFit">
					<text :class="item.icon" style="font-size: 30px; color: #00aaff"
						v-if="item.iconType === 'font'"></text>
					<text class="title">{{ item.label }}</text>
				</image>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			userInfo: {
				type: Object,
			},
			pageItem: {
				type: Object,
			},
		},
		watch: {
			pageItem: {
				immediate: true,
				handler(newValue, oldValue) {
					if (newValue && newValue.id) {
						this.$u.api.getItemDetail(newValue).then(data => {
							this.buttons = data
						})
					}
				}
			}
		},
		data() {
			return {
				groupList: [],
				buttons: []
			};
		},
		computed: {
			calcStyle() {
				if (
					this.pageItem &&
					(this.pageItem.margin || this.pageItem.margin == 0)
				) {
					return {
						margin: this.pageItem.margin,
					};
				}
			},
			indicatorDots() {
				if (this.pageItem) {
					if (this.menuList.length > 1) {
						return true;
					}
				}
			},
			swiperHeight() {
				if (this.pageItem) {
					let num = this.pageItem.row_number || 1;
					if (this.pageItem.button_style === "grid") {
						return num * 65 + 20;
					} else {
						return num * 85 + 20;
					}
				}
			},
			menuList() {
				let list = [];
				if (Array.isArray(this.buttons) && this.buttons.length > 0) {
					list = this.buttons
				}
				let rownumber = this.pageItem.row_number || 1;
				if (Array.isArray(list)) {
					return list.reduce((pre, item) => {
						if (pre.length === 0) {
							pre = [
								[item]
							];
						} else if (pre[pre.length - 1].length >= rownumber * 4) {
							pre.push([item]);
						} else {
							pre[pre.length - 1].push(item);
						}
						return pre;
					}, []);
				}
			},
		},
		methods: {
			isLastRow(list, index) {
				let row_number = Math.ceil(list.length / 4);
				if (row_number === 1) {
					return true;
				} else {
					// return false
					if (Math.ceil(list.length / 4) === Math.ceil((index + 1) / 4)) {
						return true;
					} else {
						return false;
					}
				}
			},
			getButtons() {
				let req = {
					serviceName: "srvdaq_page_item_buttons_select",
					colNames: ["*"],
					condition: [{
						colName: "item_no",
						ruleType: "eq",
						value: this.pageItem.component_no,
					}, ],
					page: {
						pageNo: 1,
						rownumber: 99,
					},
				};
				const url = `/daq/select/srvdaq_page_item_buttons_select`
				this.$u.post(
					url, req
				).then((res) => {
					if (res.success) {
						this.buttons = res.data.filter(
							(item) => item.display !== "否" && item.display !== "隐藏"
						);
					}
				});
			},
			toPages(e) {
				if (e.$orig) {
					e = e.$orig;
				}
				let url = "";
				if (e.dest_page) {
					url = e.dest_page
				}
			
				// if (e.url) {
				// 	try {
				// 		// const data = this;
				// 		// e.url = this.renderStr(e.url, data);
				// 		e.url = e.url.trim();
				// 	} catch (e) {
				// 		//TODO handle the exception
				// 	}
				// }
				// let navType = "navigateTo";
				// if (e.navType) {
				// 	navType = e.navType;
				// }
				if (url) {
					uni.navigateTo({
						url: url,
						fail(err) {
							uni.switchTab({
								url: url,
							});
						},
					});
				}else{
					this.$u.toast('开发中,暂不可访问')
				}
			},
		},
	};
</script>

<style scoped lang="scss">
	.menu-list {
		display: flex;
		flex-wrap: wrap;
		background-color: #fff;
		margin-bottom: 20rpx;

		.swiper {
			width: 100%;
			height: 110px;

			&.grid-style {
				::v-deep.uni-swiper-dot {
					transition: all 0.5s;
				}

				::v-deep.uni-swiper-dot-active {
					width: 35rpx;
					border-radius: 10rpx;
					height: 15rpx;
				}

				.menu-item {
					box-shadow: none;
				}
			}
		}

		.swiper-item {
			width: 100%;
			display: flex;
			padding: 20rpx 20rpx 0;
			flex-wrap: wrap;

			&.single-layout {
				padding: 20rpx;

				.menu-item.last-row {
					margin-bottom: 0;
				}
			}
		}

		.menu-item {
			width: calc(25% - 15px / 4);
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			background-color: #fcfcfc;
			border-radius: 5px;
			margin-left: 5px;
			padding: 20rpx;
			margin-bottom: 15px;
			position: relative;
			// box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);

			&:nth-child(4n + 1) {
				margin-left: 0;
			}

			.badge {
				top: 10px;
				right: 10px;
			}

			.badge-left {
				position: absolute;
				background-color: #f37b1d;
				border-radius: 100px;
				top: 10px;
				left: 10px;
				font-size: 10px;
				padding: 0px 5px;
				height: 14px;
				color: #ffffff;
			}

			&.grid-style {
				background-color: #fff;
				padding: 0;
				box-shadow: none;
				// padding-top: 20rpx;
			}

			.icon {
				width: 100rpx;
				height: 100rpx;
				font-size: 30px;
				text-align: center;
				line-height: 100rpx;
			}

			.title,
			.label {
				// display: flex;
				// align-items: flex-end;
				text-align: center;
				// min-height: 70rpx;
				margin-top: 20rpx;
				font-size: 14px;
			}
		}
	}
</style>
