<template>
	<view style="height: 700rpx">
		<uni-echart ref="chart" :ec="ec"></uni-echart>
	</view>
</template>

<script>
	// import * as echarts from '@/uni_modules/lime-echart/components/lime-echart/echarts';
	// import lEchart from '@/uni_modules/lime-echart/components/lime-echart/';

	import * as echarts from './uni-ec-canvas/echarts.js';
	import uniEchart from './uni-ec-canvas/uni-ec-canvas.vue';

	let indicator = []
	let data = []
	export default {
		components: {
			uniEchart
		},
		props: {
			data: {
				type: Array
			},
		},
		data() {
			return {
				ec: {
					option: {}
				}
			}
		},
		async mounted() {
			data = this.data.map(item => item.score)
			indicator = this.data.map(item => {
				// const max = item.type === '平和质' ? 25 : 20
				const obj = {
					name: item.type,
					max: 20
				}
				return obj
			})

			function innerdata(i) {
				var innerdata = [];
				for (let j = 0; j < data.length; j++) {
					innerdata.push(20 - 4 * i)
				}
				return innerdata
			}
			const option = {
				radar: {
					// shape: 'circle',
					center: ['50%', '50%'],
					radius: '70%',
					indicator,
					nameGap: 10,
					name: {
						color: "#333"
					},
					indicator: indicator,
					splitLine: {
						show: false

					},
					splitArea: {
						show: false
					},
					axisLine: {
						show: false
					}
				},
				series: [{
					type: 'radar',
					symbolSize: 5,
					symbol: "circle",
					areaStyle: {
						color: "#39B2FF",
						opacity: 0.3
					},
					lineStyle: {
						// color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						// 	offset: 0,
							color: '#8fcbff',
						// }, {
						// 	offset: 1,
						// 	color: '#0060FF'
						// }], false),
						width: 2
					},
					itemStyle: {
						color: "#fff ",
						// borderColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						// 	offset: 0,
						// 	color: '#00DEFF'
						// }, {
						// 	offset: 1,
							color: '#1598FF',
						// }], false),
						borderWidth: 5,
						opacity: 1
					},
					label: {
						show: false,
					},
					data: [{
						value: data,
					}],
					z: 100
				}],
			}

			for (let i = 0; i < data.length; i++) {
				option.series.push({
					type: 'radar',
					data: [{
						value: innerdata(i),
					}],
					symbol: 'none',
					lineStyle: {
						width: 0
					},
					itemStyle: {
						color: '#fff'
					},
					areaStyle: {
						color: '#fff',
						shadowColor: 'rgba(14,122,191,0.15)',
						shadowBlur: 30,
						shadowOffsetY: 20
					}
				});
			}
			this.ec = {
				option
			}
			// this.$refs.chart.init(config => {
			// 	const {
			// 		canvas
			// 	} = config;
			// 	const chart = echarts.init(canvas, null, config);
			// 	chart.setOption(option)
			// 	return chart;
			// });
		},
	}
</script>
