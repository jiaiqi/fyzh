<template>
	<view class="quiz-respond">
		<!-- 结果 -->
		<view class="chart-box" v-if="calcScole&&calcScole.length>0">
			<radarChart :data="calcScole"></radarChart>
		</view>
		<view class="result-explain" v-if="calcResult&&calcResult.type">
			<view class="sm-title">
				您的体质是
			</view>
			<view class="tizhi-result">
				{{calcResult.type||''}}
			</view>
			<view class="sm-title" v-if="calcResult.likeTizhi">
				兼有
			</view>
			<view class="tizhi-result tizhi-like" v-if="calcResult.likeTizhi">
				{{calcResult.likeTizhi}}
			</view>
			<view class="explain-box">
				<u-collapse>
					<u-collapse-item :title="item.key" v-for="(item, index) in itemList" :key="index">
						{{item.body}}
					</u-collapse-item>
				</u-collapse>
			</view>
		</view>
	</view>
</template>

<script>
	import tizhiDict from '../index/dict.js'
	import radarChart from '../comp/radar.vue'
	export default {
		components: {
			radarChart
		},
		data() {
			return {
				calcResult: {},
				calcScole: []
			}
		},
		computed: {
			itemList() {
				const result = []
				if (this.calcResult?.type) {
					let type = this.calcResult.type
					if (tizhiDict && tizhiDict[type]) {
						const data = tizhiDict[type]
						Object.keys(data).forEach(key => {
							if (data[key]) {
								result.push({
									key,
									body: data[key]
								})
							}
						})
					}
				}
				return result
			},
		},
		methods: {

		},
		onLoad(option) {
			if (option.calcScole) {
				this.calcScole = JSON.parse(option.calcScole)
			}
			if (option.calcResult) {
				this.calcResult = JSON.parse(option.calcResult)
			}
		}
	}
</script>

<style scoped lang="scss">
	:root {
		/* 定义变量 */
		--bgColor: #eaf3fb;
		--whiteShadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
	}

	.quiz-respond {
		background-color: #fff;
		min-height: 100vh;
		width: 100%;
		overflow: hidden;

		.chart-box {
			width: 100%;
			height: 700rpx;
			// background-color: #e5ffff;
			// box-shadow: 20px 20px 60px #a9bed9, -20px -20px 60px #e5ffff;
			border-radius: 50rpx;
			margin: 20rpx 0;
		}

		.result-explain {
			box-shadow: var(--whiteShadow);
			padding: 20rpx;
			border-radius: 20rpx;
			margin: 40rpx 20rpx 100rpx;
		}

		.explain-box {
			// background-color: var(--bgColor);
			padding: 20rpx;
			border-radius: 20rpx;
			margin: 40rpx 0;
		}

		.sm-title {
			font-size: 24rpx;
			color: #555;
			text-align: left;
			padding: 20rpx 0 10rpx;
		}

		.tizhi-result {
			// background-color: rgba($color: #00A2FF, $alpha: 0.3);
			color: #00A2FF;
			font-weight: bold;
			border-bottom: 1px dashed rgba($color: #00A2FF, $alpha: 0.1);
			// border-radius: 10rpx;
			font-size: 32rpx;
			margin-bottom: 20rpx;
			text-align: center;
			padding: 20rpx;
			letter-spacing: 4rpx;

			&.tizhi-like {
				color: #19BE6B;
				// background-color: rgba($color: #19BE6B, $alpha: 0.3);
				border-color: rgba($color: #19BE6B, $alpha: 0.3);
			}
		}

	}
</style>
