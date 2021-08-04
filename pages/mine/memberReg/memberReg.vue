<template>
	<view class="join-member">
		<view class="title">
			{{step===1?'基本信息':'健康信息'}}
		</view>
		<view class="u-form-wrap" v-show="step===1">
			<u-form :model="form" ref="uForm" label-position="left" :border-bottom="true" :rules="rules1">
				<u-form-item label="姓名" :border-bottom="false" prop="hy_name" required right-icon="account">
					<u-input v-model="form.hy_name" :border="true" placeholder="请输入姓名" />
				</u-form-item>
				<u-form-item label="性别" :border-bottom="false" prop="sex" required>
					<!-- <u-input v-model="form.sex" :border="true" placeholder="请选择性别" /> -->
					<u-radio-group v-model="form.sex">
						<u-radio name="男">
							男
						</u-radio>
						<u-radio name="女">
							女
						</u-radio>
					</u-radio-group>
				</u-form-item>
				<u-form-item label="电话" :border-bottom="false" prop="phone" required right-icon="phone">
					<u-input v-model="form.phone" :border="true" placeholder="请输入电话号码" />
					<!-- <button type="primary" class="cu-btn sm bg-blue" slot="right" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">授权</button> -->
				</u-form-item>
				<u-form-item label="生日" :border-bottom="false" prop="birth_day" required right-icon="calendar">
					<view class="date-picker">
						<picker mode="date" class="picker" :value="form.birth_day" @change="changeDate">
							<view class="uni-input" v-if="form.birth_day">{{form.birth_day||'点击选择日期'}}</view>
							<view class="place-holder" v-else>点击选择日期</view>
						</picker>
						<!-- <u-icon name="calendar"></u-icon> -->
					</view>
				</u-form-item>
				<u-form-item label="住址" :border-bottom="false" prop="addr" required>
					<view class="date-picker no-border" @click="chooseLocation">
						<u-input v-model="form.addr" class="u-input" :border="true" placeholder="请输入地址" />
						<u-icon name="map" class="u-m-l-10 text-gray" @click="chooseLocation"></u-icon>
					</view>
				</u-form-item>
				<u-form-item label="爱好" :border-bottom="false" right-icon="heart">
					<u-input v-model="form.hobby" :border="true" type="textarea" placeholder="请输入爱好" />
				</u-form-item>
				<u-form-item label="家庭成员" label-width="150" :border-bottom="false" right-icon="man-add">
					<u-input v-model="form.family_history" :border="true" />
				</u-form-item>
			</u-form>
		</view>
		<view class="u-form-wrap" v-show="step===2">
			<u-form :model="form" ref="uForm2" label-position="top" :border-bottom="true" :rules="rules2">
				<u-form-item label="既往病史" :border-bottom="false">
					<u-input v-model="form.medical_history" :border="true" type='textarea' />
				</u-form-item>
				<u-form-item label="家族史" :border-bottom="false">
					<u-input v-model="form.family_history" :border="true" type='textarea' />
				</u-form-item>
				<u-form-item label="易患疾病" :border-bottom="false">
					<u-input v-model="form.liability_disease" :border="true" type='textarea' />
				</u-form-item>
				<u-form-item label="常服药物" :border-bottom="false">
					<u-input v-model="form.regular_medication" :border="true" type='textarea' />
				</u-form-item>
				<u-form-item label="常服保健品" :border-bottom="false">
					<u-input v-model="form.regular_health_care_products" :border="true" type='textarea' />
				</u-form-item>
			</u-form>
		</view>
		<view class="button-box">
			<button type="primary" class="cu-btn bg-blue" @click="nextStep" v-if="step===1">下一步</button>
			<button type="primary" class="cu-btn bg-blue" @click="submit" v-if="step===2">提交信息</button>
		</view>
	</view>
</template>

<script>
	import {
		getMemberInfo
	} from '@/common/api.js'
	export default {
		onReady() {
			this.$refs.uForm.setRules(this.rules1);
			if (this.vuex_loginUser) {
				this.form.hy_user_no = this.vuex_loginUser.user_no
			}
		},
		computed: {
			canNext() {
				return this.hy_name && this.phone && this.birth_day && this.addr
			}
		},
		data() {
			return {
				step: 1,
				form: {
					// 基本信息
					hy_profile_url: "", //头像
					hy_name: "", //会员姓名
					sex: "",
					hy_role: "用户", //会员角色
					phone: "", //电话
					birth_day: "", //生日,
					addr: "", //住址
					address: "", //具体地址
					addr_name: "", //地址名称
					hobby: "", //爱好
					family_member: "", //家庭成员
					// 健康信息
					medical_history: "", //既往病史
					family_history: "", //家族史,
					liability_disease: "", //易患疾病,
					regular_medication: "", //常服药物,
					regular_health_care_products: "", //常服保健品
					hy_user_no: "",
				},
				rules2: {},
				rules1: {
					hy_name: [{
						required: true,
						message: '请输入姓名',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur'],
					}],
					sex: [{
						required: true,
						message: '请选择性别',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur'],
					}],
					phone: [{
							message: '请输入手机号码',
							trigger: 'change'
						},
						{
							trigger: ['change', 'blur'],
							message: "手机号码格式有误",
							validator: (rule, value, callback) => {
								return this.$u.test.mobile(value);
							}
						}
					],
					birth_day: [{
						required: true,
						message: '请选择出生日期',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur'],
					}],
					addr: [{
						required: true,
						message: '请输入居住地址',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['blur'],
					}],
				},
				address: {}
			}
		},
		methods: {
			getPhoneNumber(e) {
				console.log(e.detail.errMsg)
				console.log(e.detail.iv)
				console.log(e.detail.encryptedData)
			},
			chooseLocation() {
				uni.chooseLocation({
					success: (res) => {
						console.log('位置名称：' + res.name);
						console.log('详细地址：' + res.address);
						console.log('纬度：' + res.latitude);
						console.log('经度：' + res.longitude);
						this.form.address = res.address
						this.form.addr = res.address
						this.form.addr_name = res.name
						this.form.latitude = res.latitude
						this.form.longitude = res.longitude
						this.address = res
					}
				});
			},
			changeDate(e) {
				this.form.birth_day = e.target.value
			},
			nextStep(e) {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						console.log('验证通过');
						this.step = 2
					} else {
						console.log('验证失败');
					}
				});
			},
			submit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						let req = [{
							"serviceName": "srvstore_member_mgmt_add",
							"condition": [],
							"data": [this.form]
						}]
						if (!this.form.hy_user_no && this.vuex_loginUser.user_no) {
							req[0].data[0].hy_user_no = this.vuex_loginUser.user_no
						}
						if (this.appLaunchQuery?.add_hy_no) {
							req[0].data[0].add_hy_no = this.appLaunchQuery.add_hy_no
						}
						req[0].data[0].hy_profile_url = this.vuex_loginUser.headimgurl
						let url = '/fyzhmd/operate/srvstore_member_mgmt_add'
						this.$u.post(url, req).then(res => {
							if (res.state === 'SUCCESS') {
								uni.showModal({
									title: '提示',
									content: '会员注册成功',
									showCancel: false,
									confirmText: '返回',
									success() {
										uni.navigateBack({
											animationType: 'zoom-fade-in'
										})
									}
								})
								getMemberInfo(this.vuex_loginUser.user_no)
							} else {
								this.$u.toast(res.resultMessage || '网络错误，请稍后重试')
							}
						})
					} else {
						console.log('验证失败');
					}
				});
			},
		}
	}
</script>

<style scoped lang="scss">
	.join-member {
		padding: 20rpx;
		background-color: #fff;
		min-height: calc(100vh - var(--window-top));

		.u-form-wrap {
			padding: 20rpx;
		}

		.title {
			font-size: 50rpx;
		}

		.button-box {
			text-align: center;
			padding: 20rpx;
		}

		.date-picker {
			width: 100%;
			padding: 0 10px;
			border-color: #dcdfe6;
			text-align: left;
			border-radius: 6rpx;
			border: 1px solid #dcdfe6;
			display: flex;

			&.no-border {
				border: none;
				padding: 0;
			}

			.picker {
				flex: 1;
			}

			.input,
			.u-input {
				flex: 1;
			}

			.place-holder {
				color: #dcdfe6;
				flex: 1;
			}
		}
	}
</style>
