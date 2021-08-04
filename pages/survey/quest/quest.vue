<template>
	<view class="page-wrap">
		<view class="content" style="padding:30upx 30upx 0;" v-if="formData.remark">
			<view class="desc" style="text-align: justify;">
				<view class="text-content-text text-black">
					<view v-html="JSON.parse(JSON.stringify(formData.remark).replace(/\<img/gi, '<img width=100%  '))">
					</view>
				</view>
			</view>
		</view>
		<view class="content form-wrap" style="box-sizing: border-box;">
			<bx-form ref="bxform" labelPosition="top" optionMode="normal" :BxformType="formType" :fields="configCols"
				pageType="add" @value-blur="saveValue">
			</bx-form>
		</view>
		<view class="content" style="padding:30upx;" v-if="formData.end_remark">
			<view class="desc">
				<view class="text-content-text">
					<view
						v-html="JSON.parse(JSON.stringify(formData.end_remark).replace(/\<img/gi, '<img width=100%'))">
					</view>
				</view>
			</view>
		</view>
		<!-- <view class="button-box" v-else><button class="cu-btn bg-blue" @click="back()">返回</button> </view> -->
		<view class="button-box" v-if="detail.symptom_test_score&&detail.max_tz_name">
			<button class="cu-btn bg-orange light" @click="next1">病症趋势</button>
			<button class="cu-btn bg-blue light" @click="next2">个性方案</button>
		</view>
		<view class="button-box" v-else-if="formType!=='detail'&&activity_no"><button class="cu-btn bg-blue"
				@click="submit()">提交</button>
		</view>
	</view>
</template>

<script>
	const tizhiArr = [{
			label: '平和质',
			colName: "score_pingh_bc",
			questNo: "", //问卷编号
			value: 0
		},
		{
			label: '气虚质',
			colName: "score_qix_qdc",
			questNo: "20210712115013000003", //问卷编号
			value: 0
		},
		{
			label: '气郁质',
			colName: "score_qiy_qsc",
			value: 0
		},
		{
			label: '湿热质',
			colName: "score_shir_dhc",
			value: 0
		},
		{
			label: '痰湿质',
			colName: "score_tans_pdc",
			value: 0
		},
		{
			label: '特禀质',
			colName: "score_teb_isc",
			value: 0
		},
		{
			label: '血瘀质',
			colName: "score_xuey_bsc",
			value: 0
		},
		{
			label: '阳虚质',
			colName: "score_yangx_yadc",
			value: 0
		},
		{
			label: '阴虚质',
			colName: "score_yinx_yidc",
			value: 0
		}
	]
	export default {
		data() {
			return {
				id: "",
				detail: null,
				maxScore: {},
				formData: {},
				configCols: [],
				formType: 'add',
				activity_no: "",
				fill_batch_no: ""
			}
		},
		methods: {
			back() {
				uni.navigateBack()
			},
			next1() {
				// 疾病趋势
				const serviceName = "srvstore_health_body_disease_estimate_select"
				const condition = [{
						colName: "tz_name",
						value: this.detail.max_tz_name,
						ruleType: "eq"
					},
					{
						colName: "input_score",
						value: this.detail.symptom_test_score,
						ruleType: "eq"
					}
				]
				const url =
					`/pages/public/list/list?pageType=list&serviceName=${serviceName}&cond=${JSON.stringify(condition)}`
				uni.navigateTo({
					url
				})
			},
			next2() {
				// 个性方案
				const serviceName = "srvstore_health_body_exam_personal_program_select"
				const condition = {
					"colName": "be_no",
					"value": this.detail?.be_no,
					"ruleType": "eq"
				}
				if (!this.detail?.be_no) {
					return
				}
				uni.navigateTo({
					url: `/pages/survey/scheme/scheme?be_no=${this.detail.be_no}`
				})
			},
			async selectScore(no) {
				// let url = this.getServiceUrl('daq', 'srvdaq_record_reply_select', 'select');
				const url = '/daq/select/srvdaq_record_reply_select'
				let req = {
					"serviceName": "srvdaq_record_reply_select",
					"condition": [{
						"colName": "fill_batch_no",
						"ruleType": "eq",
						"value": no
					}],
					"colNames": ["id", "activity_no", "fill_batch_no", "user_no", "user_type", "state",
						"headimgurl",
						"nickname", "start_time", "end_time", "biz_path", "score"
					]
				}
				if (no) {
					let res = await this.$u.post(url, req)
					if (res.state === 'SUCCESS' && Array.isArray(res.data) && res.data.length > 0) {
						return res.data[0]
					}
				}
			},
			submit() {
				const self = this
				let itemData = this.$refs.bxform.getFieldModel();
				if (itemData !== false) {
					uni.showModal({
						title: '提示',
						content: '确认提交问卷?',
						success: function(res) {
							if (res.confirm) {
								console.log('itemData', itemData);
								let resultData = [];
								Object.keys(itemData).forEach(item => {
									let obj = {
										item_no: item,
										option_data: [itemData[item]]
									};
									if (Array.isArray(itemData[item])) {
										obj.option_data = itemData[item].filter(i => i && i);
									}
									if (itemData[item]) {
										resultData.push(obj);
									}
								});
								let serviceName = 'srvdaq_activity_result_submit';
								// const url = self.getServiceUrl('daq', serviceName, 'operate');
								const url = `/daq/operate/${serviceName}`
								let req = [{
									serviceName: serviceName,
									data: [{
										fill_batch_no: self.fill_batch_no,
										activity_no: self.activity_no,
										item_data: resultData
									}]
								}];
								if (self.fill_batch_no) {
									req[0].data[0].fill_batch_no = self.fill_batch_no
								}
								console.log('resultData', resultData);
								self.$u.post(url, req).then(res => {
									if (res.state === 'SUCCESS') {
										if (res.resultCode === 'SUCCESS') {
											uni.showToast({
												title: '提交成功',
												icon: 'none'
											});
											debugger
											if (Array.isArray(res.response) && res.response
												.length > 0 && res.response[0].response
												?.fill_batch_no) {
												self.fill_batch_no = res.response[0].response
													.fill_batch_no
												self.update(res.response[0].response
													.fill_batch_no)
											}
											self.formType = 'detail';

											self.initQuest(self.formData);
										}
									} else {
										// if (res.resultCode === 'FAILURE') {
										uni.showToast({
											title: res.resultMessage,
											icon: 'none'
										});
									}
									console.log(res);
									// }
								});
							} else if (res.cancel) {
								console.log('用户点击取消');
							}
						}
					});
				}
			},
			saveValue(e) {},
			async update(no) {
				let scoreResult = null
				if (no) {
					scoreResult = await this.selectScore(no)
				}
				// let url = this.getServiceUrl('fyzhmd', 'srvstore_health_body_exam_update', 'operate');
				const url = '/fyzhmd/operate/srvstore_health_body_exam_update'
				let req = [{
					"serviceName": "srvstore_health_body_exam_update",
					"condition": [{
						"colName": "id",
						"ruleType": "eq",
						"value": this.id
					}],
					"data": [{
						"symptom_test_no": no
					}]
				}]
				if (scoreResult && scoreResult.id) {
					req[0].data[0]['symptom_test_score'] = scoreResult.score
				}
				let res = await this.$u.post(url, req)
				if (res.state === 'SUCCESS') {
					if (Array.isArray(res.response) && res.response.length >
						0 && Array.isArray(res.response[0].response?.effect_data) && res.response[0]
						.response.effect_data.length > 0) {
						this.detail = res.response[0].response.effect_data[0]
					}
				} else {
					uni.showToast({
						title: res.resultMessage,
						icon: 'none',
						duration: 3000,
						mask: true
					})
				}
			},
			getMax() {
				if (!this.detail || typeof this.detail !== 'object') {
					return
				}

				Object.keys(this.detail).forEach(key => {
					tizhiArr.forEach(item => {
						if (item.colName === key) {
							item.value = this.detail[key]
						}
					})
				})
				return tizhiArr.reduce((res, cur) => {
					if (!res.value || cur.value > res.value) {
						res = cur
					}
					return res
				}, {})
			},
			async getDetail() {
				// 查找体制评测详情
				// let url = this.getServiceUrl('fyzhmd', 'srvstore_health_body_exam_select', 'select');
				const url = '/fyzhmd/select/srvstore_health_body_exam_select'
				let req = {
					"serviceName": "srvstore_health_body_exam_select",
					"colNames": ["*"],
					"condition": [{
						colName: 'id',
						ruleType: 'eq',
						value: this.id
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 1
					}
				}
				let res = await this.$u.post(url, req)
				if (res.state === 'SUCCESS' && Array.isArray(res.data) && res.data.length > 0) {
					this.detail = res.data[0]
					if (this.detail.survey_no) {
						this.activity_no = this.detail.survey_no
						this.initQuest()
					} else {
						uni.showToast({
							title: '没有配置问卷编号！',
							icon: 'none',
							duration: 3000
						})
					}
					// let max = this.getMax()
					// if (max && max.questNo) {
					// 	this.maxScore = max
					// 	this.activity_no = max.questNo
					// 	this.initQuest()
					// }
				}
			},
			initQuest(questionData) {
				// 获取问卷数据
				let that = this;
				const serviceName = 'srvdaq_init_view_select';
				// const url = this.getServiceUrl('daq', serviceName, 'select');
				const url = `/daq/select/${serviceName}`
				const req = {
					serviceName: serviceName,
					colNames: ['*'],
					order: [{
						colName: 'item_seq',
						orderType: 'asc'
					}],
					condition: [{
							colName: 'activity_no',
							ruleType: 'eq',
							value: this.activity_no
						},
						{
							colName: 'type', // 查看视图初始化
							ruleType: 'eq',
							value: 'use'
						}
					]
				};
				if (this.status === '未开始') {
					req.condition = [{
							colName: 'activity_no',
							ruleType: 'eq',
							value: activity_no
						},
						{
							colName: 'biz_type',
							ruleType: 'eq',
							value: 'cfg'
						}
					];
				}
				if (questionData && questionData.fill_batch_no) {
					req.condition = [{
							colName: 'activity_no',
							ruleType: 'eq',
							value: questionData.activity_no
						},
						{
							colName: 'type',
							ruleType: 'eq',
							value: 'use'
						},
						{
							colName: 'fill_batch_no',
							ruleType: 'eq',
							value: questionData.fill_batch_no
						}
					];
				}
				if (this.activity_no && this.fill_batch_no) {
					req.condition = [{
							colName: 'activity_no',
							ruleType: 'eq',
							value: this.activity_no
						},
						{
							colName: 'type',
							ruleType: 'eq',
							value: 'use'
						},
						{
							colName: 'fill_batch_no',
							ruleType: 'eq',
							value: this.fill_batch_no
						}
					];
				}
				this.$u.post(url, req).then(res => {
					if (res.state === 'SUCCESS') {
						const data = res.data[0];
						this.activity_no = data.activity_no;
						let configCols = [];
						data.item_data.forEach(item => {
							configCols.push(this.getConfig(item));
						});
						if (data.logo) {
							this.getPicture(data.logo).then(url => {
								this.$set(this.formData, 'fileUrl', url);
							});
						}
						if (data.user_data) {
							configCols.forEach(item => {
								if (this.formType === 'detail') {
									item.disabled = true;
								}
								item.options = item.options.map(op => {
									op.checked = false
									return op
								})
								data.user_data.forEach(items => {
									if (item.column === items.item_no) {
										if (item.item_type_attr && item.item_type_attr
											.radioType === 'multi') {
											item.value = items.option_data ? items.option_data
												.toString() : '';
											item.options = item.options.map(op => {
												if (item.value.indexOf(op.value) !== -
													1) {
													op.checked = true
												}
												return op
											})
										} else {
											item.value = items.option_data[0];
										}
									}
								});
							});
						}
						this.formData = data;
						if (data.title) {
							uni.setNavigationBarTitle({
								title: data.title
							});
						}
						// if (data.user_state === '完成' && data.answer_times !== '多次') {
						// 	this.formType = 'detail';
						// }
						configCols.forEach((item, index) => {
							item.iconSize = 28;
							item.itemIndex = index + 1;
							if (item.label && item.label.slice(0, 1) != (index + 1).toString() && item
								.label.slice(0, 2) != (index + 1).toString()) {
								item.label = (index + 1).toString() + '.' + item.label;
							}
							if (item.type === 'digit' && item.item_type_attr.decimal && item.value) {
								item.value = Number(item.value).toFixed(item.item_type_attr.decimal);
							} else if (item.type === 'digit' && !item.item_type_attr.decimal && item
								.value) {
								item.value = Number(item.value).toFixed(1);
							} else if (item.type === 'number' && item.value) {
								item.value = parseInt(item.value).toString() !== 'NaN' ? parseInt(item
									.value) : 0;
							}
						});
						this.configCols = configCols;
					} else if (res.resultCode === '0011') {
						uni.showToast({
							title: '未登录',
							icon: 'none'
						});
					} else if (res.resultCode === 'FAILURE') {
						uni.showToast({
							title: res.resultMessage,
							icon: 'none'
						});
						if (res.resultMessage === '活动已结束') {
							debugger
						}
					}
				});
			},
			getConfig(e) {
				let config = {
					label: e.item_title,
					column: e.item_no,
					srvInfo: {
						serviceName: 'srvdaq_activity_result_submit',
						appNo: this.appName ? this.appName : 'daq'
					},
					value: e.value,
					type: e.item_type,
					isRequire: e.is_require === '是' ? true : false,
					isShowExp: [],
					options: [],
					item_type_attr: e.item_type_attr,
					display: true,
					points: e.points,
					answer: e.answer,
					option_img_explain: e.option_img_explain,
					_rawData: e,
					option_list_v2: e.option_list_v2
				};
				if (this.formType === 'detail') {
					config.disabled = true;
				}
				switch (e.item_type) {
					case '文本':
						// config.type = e.item_type_attr['view_model'] === 'textarea' ? 'textarea' : 'input';
						config.type = e.item_type_attr['view_model'] === 'textarea' ? 'textarea' : 'text';
						break;
					case '图片':
						config.type = 'images';
						config['fileNum'] = e.item_type_attr['fileNum'];
						break;
					case '选项':
						config.type = e.item_type_attr.radioType && e.item_type_attr.radioType === 'multi' ? 'checkboxFk' :
							'radioFk';
						config.options = e.option_data.map((item, optIndex) => {
							item.color = '#0bc99d';
							item.value = item.option_value;
							item.showimg = false;
							item.checked = false
							item.label = item.option_value;
							if (item.option_view_no) {
								item.serialChar = item.option_view_no;
							} else if (item.option_seq) {
								item.serialChar = item.option_seq;
							} else {
								item.serialChar = optIndex;
							}
							return item;
						});
						break;
					case '时间日期':
						config.type = e.item_type_attr.dateType ? e.item_type_attr.dateType : 'date';
						// config.type = e.item_type_attr.dateType ? e.item_type_attr.dateType : 'dateTime';
						break;
					case '数字':
						config.type = e.item_type_attr.numberType ? e.item_type_attr.numberType : 'number';
						break;
					case '地址':
						config.type = 'cascader';
						config.srvInfo = {
							serviceName: 'srvconfig_area_adj_select',
							appNo: 'config',
							isTree: true,
							column: 'no',
							showCol: 'path_name' //要展示的字段
						};
						break;
					case '引用':
						config.type = 'Selector';
						// config.type = 'treeSelector';
						config.option_list_v2 = {
							refed_col: e.item_type_attr.refed_col,
							srv_app: e.item_type_attr.srv_app,
							serviceName: e.item_type_attr.serviceName,
							key_disp_col: e.item_type_attr.key_disp_col
						};
						break;
					default:
						config.type = e.item_type;
						break;
				}
				return config;
			},
			async getPicture(file_no) {
				const serviceName = 'srvfile_attachment_select';
				// const url = this.getServiceUrl('file', serviceName, 'select');
				const url = `/file/select/${serviceName}`
				const req = {
					serviceName: serviceName,
					colNames: ['*'],
					condition: [{
						colName: 'file_no',
						value: file_no,
						ruleType: 'eq'
					}]
				};
				if (file_no !== null && file_no !== '' && file_no !== undefined) {
					let res = await this.$u.post(url, req);
					if (res.state === 'SUCCESS') {
						const data = res.data[0];
						if (data) {
							const fileurl = this.$u.$api.srvHost + '/file/download?filePath=' + data.fileurl;
							return fileurl;
						}
					}
				}
			},
		},
		onLoad(option) {
			if (option.id) {
				this.id = option.id;
				this.getDetail()
			}
			// if (option.survey_no) {
			// 	this.activity_no = option.survey_no
			// 	this.initQuest()
			// }
		}
	}
</script>

<style scoped lang="scss">
	.page-wrap {
		background-color: #fff;
		font-size: 40rpx;
	}

	.desc {
		padding: 20rpx;
		background-color: #f8f8f8;
		border-radius: 20rpx;
	}

	.button-box {
		text-align: center;
		padding: 20rpx 0 40rpx;

		.cu-btn {
			width: 40%;
			margin-right: 20rpx;
		}
	}
</style>
