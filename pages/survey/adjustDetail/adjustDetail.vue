<template>
	<view v-if="detail" class="detail-wrap">
		<view class="content-area">
			<view class="cu-bar  ">
				<view class="action sub-title">
					<text class="text-xl text-bold text-green">饮食</text>
					<text class="bg-green" style="width:2rem"></text>
				</view>
			</view>
			<view class="rich-text">
				<u-parse :html="detail.diet_advice" v-if="detail.diet_advice"></u-parse>
				<view class="" v-else>
					暂无内容
				</view>
			</view>
		</view>
		<view class="content-area">
			<view class="cu-bar   ">
				<view class="action sub-title">
					<text class="text-xl text-bold text-green">运动</text>
					<text class="bg-green" style="width:2rem"></text>
				</view>
			</view>
			<view class="rich-text">
				<u-parse :html="detail.sports_advice" v-if="detail.sports_advice"></u-parse>
				<view class="" v-else>
					暂无内容
				</view>
			</view>
		</view>
		<view class="content-area">
			<view class="cu-bar   ">
				<view class="action sub-title">
					<text class="text-xl text-bold text-green">心态</text>
					<text class="bg-green" style="width:2rem"></text>
				</view>
			</view>
			<view class="rich-text">
				<u-parse :html="detail.mental_advice" v-if="detail.mental_advice"></u-parse>
				<view class="" v-else>
					暂无内容
				</view>
			</view>
		</view>
		<view class="content-area">
			<view class="cu-bar   ">
				<view class="action sub-title">
					<text class="text-xl text-bold text-green">产品</text>
					<text class="bg-green" style="width:2rem"></text>
				</view>
			</view>
			<view class="goods-list">
				<goods-list image="gd_img" price="gd_price" name="gd_name" desc="gd_desc" ref="goodsList"
					:list="goodsList" :defaultLayout="layout"></goods-list>
				<u-loadmore :status="loadStatus" :load-text="loadText" />
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: null,
				detail: null,
				goodsList: [],
				layout: 'double',
				loadText: {
					loadmore: '点击或上拉加载更多',
					loading: '努力加载中',
					nomore: '没有更多了'
				},
				page: {
					rownumber: 10,
					pageNo: 1
				},
				loadStatus: "nomore", //loading / nomore
			}
		},
		methods: {
			getDetail() {
				let url = '/fyzhmd/select/srvstore_health_body_solution_set_select'
				let req = {
					"serviceName": "srvstore_health_body_solution_set_select",
					"colNames": ["*"],
					"condition": [{
						colName: 'id',
						ruleType: 'eq',
						value: this.id
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 20
					},
				}
				this.$u.post(url, req).then(res => {
					if (res.state === 'SUCCESS' && res.data.length > 0) {
						this.detail = res.data[0]
						uni.setNavigationBarTitle({
							title: res.data[0].tz_name
						})
						this.getGoods()
					}
				})
			},
			getGoods() {
				if (!this.detail?.tz_no) {
					return
				}
				const req = {
					"serviceName": "srvstore_health_body_solution_goods_select",
					"colNames": ["*"],
					"condition": [{
						"colName": "tz_no",
						"ruleType": "eq",
						"value": this.detail.tz_no
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 100
					}
				}
				const url = '/fyzhmd/select/srvstore_health_body_solution_goods_select'

				this.$u.post(url, req).then(res => {
					if (res.state === "SUCCESS") {
						this.goodsList = res.data
					}
				})
			},
		},
		onLoad(option) {
			if (option.id) {
				this.id = option.id;
				this.getDetail()
			}
		}
	}
</script>

<style scoped lang="scss">
	.detail-wrap {
		min-height: calc(100vh - var(--window-top));
		// background-color: #fff;
		// padding: 20rpx 0;
		display: flex;
		flex-direction: column;
		.content-area {
			background-color: #fff;
			// border-radius: 10rpx;
			margin-bottom: 2rpx;
			overflow: hidden;
			// box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
			&:last-child{
				flex: 1;
			}
		}

		.rich-text,
		.goods-list {
			padding: 0 40rpx 20rpx;
			min-height: 100rpx;
		}

	}
</style>
