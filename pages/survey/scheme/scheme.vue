<template>
	<view v-if="detail" class="scheme-wrap">
		<view class="content-item">
			<view class="cu-bar  bg-white">
				<view class="action sub-title">
					<text class="text-xl text-bold text-green">会员姓名</text>
					<text class="bg-green" style="width:2rem"></text>
				</view>
				<view class="value">
					{{detail.hy_name||''}}
				</view>
			</view>
		</view>
		<view class="content-item">
			<view class="cu-bar  bg-white">
				<view class="action sub-title">
					<text class="text-xl text-bold text-green">最偏体质</text>
					<text class="bg-green" style="width:2rem"></text>
				</view>
				<view class="value">
					{{detail.max_tz_name||''}}
				</view>
			</view>

		</view>
		<view class="content-item">
			<view class="cu-bar  bg-white">
				<view class="action sub-title">
					<text class="text-xl text-bold text-green">症状自测评分</text>
					<text class="bg-green" style="width:2rem"></text>
				</view>
				<view class="value">
					{{detail.symptom_test_score||''}}
				</view>
			</view>
		</view>
		<view class="content-item">
			<view class="cu-bar  bg-white">
				<view class="action sub-title">
					<text class="text-xl text-bold text-green">易患疾病</text>
					<text class="bg-green" style="width:2rem"></text>
				</view>
			</view>
			<view class="content">
				{{detail.disease||''}}
			</view>
		</view>
		<view class="content-item">
			<view class="cu-bar  bg-white">
				<view class="action sub-title">
					<text class="text-xl text-bold text-green">药食养生</text>
					<text class="bg-green" style="width:2rem"></text>
				</view>
			</view>
			<view class="content">
				<u-parse :html="detail.med_diet_care"></u-parse>
			</view>
		</view>
		<view class="content-item">
			<view class="cu-bar  bg-white">
				<view class="action sub-title">
					<text class="text-xl text-bold text-green">日常调理</text>
					<text class="bg-green" style="width:2rem"></text>
				</view>
			</view>
			<view class="content">
				<u-parse :html="detail.daily_care"></u-parse>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				be_no: "",
				detail: null
			}
		},
		methods: {
			getDetail() {
				if (!this.be_no) {
					return
				}
				const serviceName = "srvstore_health_body_exam_personal_program_select"
				const url = `/fyzhmd/select/${serviceName}`
				const req = {
					"serviceName": serviceName,
					"colNames": ["*"],
					"condition": [{
						"colName": "be_no",
						"value": this.be_no,
						"ruleType": "eq"
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 1
					}
				}
				this.$u.post(url, req).then(res => {
					if (res.state === 'SUCCESS' && Array.isArray(res.data) && res.data.length > 0) {
						this.detail = res.data[0]
					}
				})
			}
		},
		onLoad(option) {
			if (option.be_no) {
				this.be_no = option.be_no
				this.getDetail()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.scheme-wrap {
		min-height: 100vh;
		background-color: #fff;
		padding-bottom: 100rpx;
	}

	.content-item {
		.value {
			font-size: 40rpx;
			font-weight: bold;
			padding: 0 40rpx;
			color: #000;
		}

		.content {
			padding: 0 40rpx;
		}
	}
</style>
