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
			<view class="sm-title" v-if="calcResult.likeTizhi&&calcResult.type!=='平和质'">
				兼有
			</view>
			<view class="tizhi-result tizhi-like" v-if="calcResult.likeTizhi">
				{{calcResult.likeTizhi}}
			</view>
			<!-- 		<view class="explain-box">
				<u-collapse>
					<u-collapse-item :title="item.key" v-for="(item, index) in itemList" :key="index">
						{{item.body}}
					</u-collapse-item>
				</u-collapse>
			</view> -->
		</view>
		<view class="button-box"
			v-if="calcResult&&calcResult.type&&calcResult.type!=='平和质'&&examResult&&examResult.survey_no">
			<button class="cu-btn bg-blue" @click="zzpg">症状评估</button>
		</view>
	</view>
</template>

<script>
	import tizhiDict from '../index/dict.js'
	import radarChart from '../comp/radar.vue'
	const questionArr = [{
			type: '气虚质',
			no: '20210712115013000003',
			col: 'score_qix_qdc'
		},
		{
			type: '阳虚质',
			no: '20210719104925000011',
			col: 'score_yangx_yadc'
		},
		{
			type: '痰湿质',
			no: '20210719105859000012',
			col: 'score_tans_pdc'
		},
		{
			type: '气郁质',
			no: '20210719110309000013',
			col: 'score_qiy_qsc'
		},
		{
			type: '血瘀质',
			no: '20210719111030000014',
			col: 'score_xuey_bsc'
		},
		{
			type: '血虚质',
			no: '20210719111941000015',
			col: ''
		},
		{
			type: '阴虚质',
			no: '20210719112440000016',
			col: 'score_yinx_yidc'
		},
		{
			type: '湿热质',
			no: '20210719113744000018',
			col: 'score_shir_dhc'
		},
		{
			type: '特禀质',
			no: '20210719113055000017',
			col: 'score_teb_isc'
		}
	]

	export default {
		components: {
			radarChart
		},
		data() {
			return {
				calcResult: {},
				calcScole: [],
				examResult: null
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
			zzpg() {
				// 跳转到症状评估页面
				const result = this.examResult;
				if (result?.survey_no&&result.id) {
					uni.navigateTo({
						url: `/pages/survey/quest/quest?id=${result.id}`
					})
				}
				// if (result && result.type) {
				// 	const questionMap = questionArr.reduce((res, cur) => {
				// 		if (!res || typeof res !== 'object') {
				// 			res = {}
				// 		}
				// 		res[cur.type] = cur.no
				// 		return res
				// 	}, {})
				// 	if (questionMap && questionMap[result.type]) {
				// 		uni.navigateTo({
				// 			url: `/pages/survey/quest/quest?survey_no=${questionMap[result.type]}`
				// 		})
				// 	}
				// }
			},
			getBodyExam(be_no) {
				const url = '/fyzhmd/select/srvstore_health_body_exam_select'
				const req = {
					"serviceName": "srvstore_health_body_exam_select",
					"colNames": ["*"],
					"condition": [{
						colName: "be_no",
						ruleType: 'eq',
						value: be_no
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 1
					}
				}
				this.$u.post(url, req).then(res => {
					if (res.state === 'SUCCESS' && Array.isArray(res.data) && res.data.length > 0) {
						this.examResult = res.data[0]
					}
				})
			},
			addBodyExam() {
				// 创建体质评测结果
				const result = this.calcResult
				if (result && result.type && result.score && this.vuex_memberInfo?.hy_no) {
					const colMap = questionArr.reduce((res, cur) => {
						if (!res || typeof res !== 'object') {
							res = {}
						}
						res[cur.type] = cur.col
						return res
					}, {})
					if (colMap && colMap[result.type]) {
						const url = '/fyzhmd/operate/srvstore_health_body_exam_add'
						const req = [{
							"serviceName": "srvstore_health_body_exam_add",
							"data": [{
								"hy_no": this.vuex_memberInfo.hy_no,
								[colMap[result.type]]: result.score
							}]
						}]
						this.$u.post(url, req).then(res => {
							if (res.state === 'SUCCESS' && Array.isArray(res.response) && res.response.length >
								0 && Array.isArray(res.response[0].response?.effect_data) && res.response[0]
								.response.effect_data.length > 0) {
								const examResult = res.response[0].response.effect_data[0]
								if (examResult?.be_no) {
									this.getBodyExam(examResult.be_no)
								}
							}
						})
					}
				}

			},


		},
		onLoad(option) {
			if (option.calcScole) {
				this.calcScole = JSON.parse(option.calcScole)
			}
			if (option.calcResult) {
				this.calcResult = JSON.parse(option.calcResult)
				this.addBodyExam()
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
			margin: 40rpx 20rpx 50rpx;
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

		.button-box {
			text-align: center;
			margin-bottom: 50rpx;

			.cu-btn {
				width: 50%;
			}
		}

	}
</style>
