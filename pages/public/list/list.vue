<template>
	<view>
		<view class="search-bar" v-if="showSearchBar">
			<view class="cu-bar search bg-white ">
				<view class="search-form round">
					<text class="cuIcon-search"></text>
					<input @focus="searchBarFocus" @blur="serachBarBlur" :adjust-position="false" type="text"
						v-model="searchVal" :placeholder="placeholder" confirm-type="search" />
				</view>
				<view class="action" v-if="searchVal">
					<button class="cu-btn bg-blue shadow-blur round margin-right-xs" @click="toSearch">搜索</button>
				</view>
				<view class="action" v-else>
					<button class="cu-btn bg-blue shadow-blur round margin-right-xs" v-if="showAdd"
						@click="clickAddButton">添加</button>
					<button class="cu-btn bg-blue shadow-blur round" @click="$refs.bxList.onRefresh()"><text
							class="cuIcon-refresh"></text></button>
				</view>
			</view>
			<!-- <view style="height: 100upx;width: 100%;"></view> -->
		</view>
		<bx-list ref="bxList" :serviceName="serviceName" :condition="condition" :relation_condition="relation_condition"
			:pageType="pageType" :listType="'list'"
			:rowButtons="listConfig && listConfig.rowButton ? listConfig.rowButton : []" :showTab="false"
			:viewTemp="viewTemp" :listConfig="listConfig" :showButton="showRowButton" :fixed="true" :top="listTop"
			:searchWords="searchVal" :searchColumn="keyColumn" :tempWord="tempWord" :rownumber="10"
			:showFootBtn="showFootBtn" @click-list-item="clickItem" @list-change="listChange"
			@clickFootBtn="clickFootBtn" @loadEnd="loadEnd" v-if="listConfig&&listConfig.srv_cols"></bx-list>
	</view>
</template>

<script>
	import bxList from '../components/bx-list/bx-list.vue';
	export default {
		components: {
			bxList
		},
		data() {
			return {
				serviceName: '',
				pageType: '',
				placeholder: '输入搜索关键词',
				listConfig: {},
				srv_cols: [],
				condition: [],
				relation_condition: null,
				pattern: {
					color: '#7A7E83',
					backgroundColor: '#fff',
					selectedColor: '#007AFF',
					buttonColor: '#007AFF'
				},
				fabContent: [],
				fabHorizontal: 'left',
				fabVertical: 'bottom',
				fabDirection: 'horizontal',
				listTop: 100,
				showRowButton: 'true',
				viewTemp: {
					// title: 'name',
					// tip: 'desc',
					// img: 'img',
					// price: 'current_price',
					// footer: 'shop_name'
				},
				publicButton: [],
				searchVal: '',
				keyColumn: '',
				showAdd: false,
				noData: false,
				showSearchBar: true,
				showFootBtn: true,
				tempWord: {},
				queryParams: {},
				queryOption: {},
				navigationBarTitle: null,
				showNavBack: false
			};
		},
		onReachBottom() {
			if (!this.noData) {
				this.$refs.bxList.loadData();
				// this.$refs.bxList.getListData().then(data => {});
			}
		},
		onPullDownRefresh() {
			if (this.serviceName && this.$refs.bxList) {
				// this.getListV2();
				this.$refs.bxList.onRefresh();
			}
			setTimeout(() => {
				uni.stopPullDownRefresh()
			}, 200)
		},
		onShow() {
			if (this.serviceName && this.$refs.bxList) {
				// this.getListV2();
				this.$refs.bxList.onRefresh();
			}
		},

		onLoad(option) {
			uni.setStorageSync('activeApp','fyzhmd')
			let query = {};
			// #ifdef H5
			this.listTop = 100;
			if (option.query) {
				query = JSON.parse(decodeURIComponent(option.query));
			} else {
				query = option;
			}
			// #endif
			// #ifdef MP-WEIXIN
			if (option.serviceName) {
				query = option;
			} else {
				query = JSON.parse(decodeURIComponent(option.query));
			}
			if (option.navigationBarTitle) {
				this.navigationBarTitle = option.navigationBarTitle;
				uni.setNavigationBarTitle({
					title: option.navigationBarTitle
				});
			}
			// #endif
			// #ifdef APP-PLUS
			query = option
			// #endif
			if (option.hasOwnProperty('showAdd')) {
				this.queryOption = option;
			}
			if (query.viewTemp) {
				// let viewTemp = this.getDecodeUrl(option.viewTemp);
				this.viewTemp = JSON.parse(query.viewTemp);
				if (this.viewTemp.title) {
					this.keyColumn = this.viewTemp.title;
				}
				if (query.destApp) {
					uni.setStorageSync('activeApp', query.destApp);
				}
			}
			this.showNavBack = query.showNavBack || false
			if (query.cond) {
				try {
					let cond = JSON.parse(decodeURIComponent(query.cond));
					if (Array.isArray(cond)) {
						cond.forEach(item => {
							if ((item.colName === 'create_user' || item.colName === 'openid' || item.colName ===
									'glry') && item.value === 'user_no') {
								item.value = uni.getStorageSync('login_user_info').user_no;
							}
						});
						this.condition = cond;
					}
				} catch (e) {
					console.log(e);
					//TODO handle the exception
				}
				// this.condition = JSON.parse(this.getDecodeUrl(option.cond));
			}
			if (query.relation_condition) {
				try {
					let cond = JSON.parse(decodeURIComponent(query.relation_condition));
					if (Array.isArray(cond.data)) {
						cond.data.forEach(item => {
							if ((item.colName === 'create_user' || item.colName === 'openid' || item.colName ===
									'glry') && item.value === 'user_no') {
								item.value = uni.getStorageSync('login_user_info').user_no;
							}
						});
						this.relation_condition = cond;
					}
				} catch (e) {
					console.log(e);
					//TODO handle the exception
				}
			}

			if (query.tempWord) {
				this.tempWord = JSON.parse(query.tempWord);
			}
			if (query.showRowButton) {
				this.showRowButton = query.showRowButton;
			}
			if (query.serviceName && query.pageType) {
				this.serviceName = query.serviceName;
				this.pageType = query.pageType;
				if (query.params) {
					let params = {};
					if (typeof query.params === 'string') {
						try {
							params = JSON.parse(query.params);
							this.queryParams = params;
						} catch (e) {
							//TODO handle the exception
						}
					}
				}
				this.getListV2();
			} else {
				// uni.showToast({
				// 	title:"无效页面",
				// 	icon:"Error"
				// })
				// setTimeout(()=>{
				// 	uni.hideToast()
				// 	uni.navigateBack()
				// },2000)
			}
		},
		methods: {
			toSearch() {
				this.$refs.bxList.toSearch();
			},
			loadEnd(e) {
				this.noData = true;
			},
			clickAddButton() {
				if (this.pageType === 'proc') {
					this.publicButton.map(item => {
						if (item.button_type === 'add' || item.button_type === 'apply') {
							uni.navigateTo({
								url: '/pages/public/proc/apply/apply?serviceName=' + item.service_name +
									'&cond=' + decodeURIComponent(JSON.stringify(this.condition))
							});
						}
					});
				} else {
					this.publicButton.map(item => {
						if (item.button_type === 'add') {
							const params = {
								type: 'add',
								condition: [],
								serviceName: item.service_name,
								service_view_name: item.service_view_name
							};
							uni.navigateTo({
								url: '../formPage/formPage?serviceName=' + item.service_name +
									'&type=add&cond=' + decodeURIComponent(JSON.stringify(this.condition))
							});
						} else if (item.button_type === 'customize') {}
					});
				}
			},
			searchBarFocus(e) {
				console.log('searchBarFocus:', e);
			},
			serachBarBlur(e) {
				console.log('serachBarBlur:', e);
			},
			listChange(e) {
				console.log('listChange:', e);
			},
			clickItem(e) {
				if (this.pageType === 'proc') {
					uni.navigateTo({
						url: '/pages/public/proc/procDetail/procDetail?proc_instance_no=' + e.proc_instance_no
					});
				} else {
					let req = {
						button: {
							button_name: '详情',
							button_type: 'detail',
							service_name: this.serviceName
						},
						row: e
					};
					uni.navigateTo({
						url: `/pages/public/detail/detail?id=${e.id}&serviceName=${this.serviceName}`
					})
					try {
						// this.onButtonToUrl(req)
					} catch (e) {
						//TODO handle the exception
					}
				}
				console.log('click-list-item:', e);
			},
			async clickFootBtn(data) {
				let buttonInfo = this.$u.deepClone(data.button);
				let rowData = this.$u.deepClone(data.row);
				if (buttonInfo.operate_params && typeof buttonInfo.operate_params === 'string') {
					try {
						buttonInfo.operate_params = JSON.parse(buttonInfo.operate_params);
						if (Array.isArray(buttonInfo.operate_params.condition) && buttonInfo.operate_params.condition
							.length > 0) {
							buttonInfo.operate_params.condition.forEach(cond => {
								if (typeof cond.value === 'object' && cond.value.value_type === 'rowData') {
									cond.value = data.row[cond.value.value_key];
								} else if (typeof cond.value === 'object' && cond.value.value_type ===
									'constant') {
									cond.value = cond.value.value;
								}
							});
						}
						if (buttonInfo && buttonInfo.operate_params && buttonInfo.operate_params.data && Array.isArray(
								buttonInfo.operate_params.data) && buttonInfo.operate_params.data.length >
							0) {
							buttonInfo.operate_params.data.forEach(data => {
								if (typeof data === 'object') {
									Object.keys(data).forEach(item => {
										if (typeof data[item] === 'object' && data[item].value_type ===
											'rowData') {
											data[item] = rowData[data[item].value_key];
										} else if (typeof data[item] === 'object' && data[item]
											.value_type === 'constant') {
											data[item] = data[item].value;
										}
									});
								}
							});
						}
						if (buttonInfo.operate_type === '操作' && buttonInfo.operate_mode === '静默操作') {
							let req = [{
								serviceName: buttonInfo.operate_service,
								condition: buttonInfo.operate_params.condition,
								data: buttonInfo.operate_params.data
							}];
							let app = uni.getStorageSync('activeApp');
							let url = this.getServiceUrl(buttonInfo.application ? buttonInfo.application : app,
								buttonInfo.operate_service, buttonInfo.servcie_type);
							let res = await this.$http.post(url, req);
							if (res.data.state === 'SUCCESS') {
								this.$refs.bxList.onRefresh();
							}
						} else if (buttonInfo.operate_type === '更新弹出') {
							let params = {
								type: buttonInfo.servcie_type,
								serviceName: buttonInfo.operate_service,
								main_table: buttonInfo.main_table,
								service: buttonInfo.service,
								button_type: buttonInfo.button_type,
							};
							if (Array.isArray(buttonInfo.operate_params.data) && buttonInfo.operate_params.data
								.length > 0) {
								params.defaultVal = buttonInfo.operate_params.data[0]
							}
							uni.navigateTo({
								url: '/pages/public/formPage/formPage?serviceName=' +
									buttonInfo.operate_service +
									'&type=' +
									buttonInfo.servcie_type +
									'&params=' + JSON.stringify(params) +
									'&cond=' +
									decodeURIComponent(JSON.stringify(buttonInfo.operate_params.condition))
							});
						}
					} catch (e) {
						console.error(e);
						//TODO handle the exception
					}
				}

				if (this.pageType === 'proc') {
					if (data.button && data.button.button_type === 'edit' && data.row.proc_instance_no) {
						uni.navigateTo({
							url: '/pages/public/proc/procDetail/procDetail?proc_instance_no=' + data.row
								.proc_instance_no
						});
					}
				} else {
					debugger
					return
					this.onButtonToUrl(data).then(res => {
						if (data.button && data.button.button_type === 'delete') {
							if (res.state === 'SUCCESS') {
								this.$refs.bxList.onRefresh();
							} else {
								uni.showToast({
									title: res.resultMessage,
									icon: 'none'
								})
							}
						}
						if (data.button && data.button.button_type === 'detail') {
							let row = res.row;
							let btn = res.button;
							let params = {
								type: 'detail',
								condition: [{
									colName: 'id',
									ruleType: 'in',
									value: row.id
								}],
								serviceName: btn.service_name,
								// defaultVal: row
							};
							uni.navigateTo({
								url: '/pages/public/formPage/formPage?params=' + JSON.stringify(params)
							});
						} else if (data.button && (data.button.button_type === 'duplicate' || data.button
								.button_type === 'duplicatedeep')) {
							let fieldsCond = []
							if (Array.isArray(self.condition)) {
								self.condition.forEach(item => {
									fieldsCond.push({
										column: item.colName,
										value: item.value,
										display: false
									})
								})
							}

							let params = {
								type: 'add',
								serviceName: res.button.service_name,
								defaultVal: res.row,
								eventOrigin: res.button
							};
							Object.keys(params.defaultVal).forEach(key => {
								if (['id', 'modify_user_disp', 'modify_user', 'modify_time',
										'create_user_disp', 'create_user', 'create_time'
									].includes(key) || !params.defaultVal[key]) {
									delete params.defaultVal[key]
								}
							})
							uni.navigateTo({
								url: '/pages/public/formPage/formPage?params=' + JSON.stringify(
									params)
							});

						} else if (data.button.servcie_type === 'select') {
							let params = {
								type: 'select',
								serviceName: res.button.service_name,
								defaultVal: res.row,
								eventOrigin: res.button
							};
						} else if (data.button.servcie_type === 'add') {
							let params = {
								type: 'add',
								serviceName: res.button.service_name,
								defaultVal: res.row,
								eventOrigin: res.button
							};
							uni.navigateTo({
								url: '/pages/public/formPage/formPage?params=' + JSON.stringify(params)
							});
						} else if (data.button && data.button.operate_type === '流程申请') {
							uni.navigateTo({
								url: '/pages/public/proc/apply/apply?serviceName=' + data.button
									.operate_service
							});
						} else if (data.button && data.button.button_type === 'customize') {
							let moreConfig = data.button.more_config;
							console.log(buttonInfo, rowData)
							if (moreConfig && typeof moreConfig === 'string') {
								try {
									moreConfig = JSON.parse(moreConfig);
								} catch (e) {
									//TODO handle the exception
									console.log(e);
								}
							}
							debugger
							if (data.button?.button_name === '支付码') {
								// 跳转到下单、生成支付码页面
								uni.navigateTo({
									url: `/pages/public/payCode/payCode?id=${data.row.id}`
								})
								return
							} else if (data.button?.button_name === '填写问卷') {
								uni.navigateTo({
									url: `/pages/specific/quest/quest?id=${data.row.id}`
								})
								return
							}
							let params = {
								type: buttonInfo.servcie_type == 'operate' ? 'update' : buttonInfo
									.servcie_type,
								serviceName: buttonInfo.operate_service,
								main_table: buttonInfo.main_table,
								service: buttonInfo.service,
								button_type: buttonInfo.button_type == 'operate' ? 'update' : buttonInfo
									.button_type,
							};
							if (buttonInfo && buttonInfo.operate_params && buttonInfo.operate_params.data &&
								Array.isArray(buttonInfo.operate_params.data) && buttonInfo.operate_params.data
								.length > 0) {
								params.defaultVal = buttonInfo.operate_params.data[0]
							}
							if (buttonInfo && buttonInfo.operate_params && buttonInfo.operate_params
								.condition &&
								Array.isArray(buttonInfo.operate_params.condition) && buttonInfo.operate_params
								.condition
								.length > 0) {
								params.condition = buttonInfo.operate_params.condition
							}
							let url = ''
							switch (buttonInfo.servcie_type) {
								case 'add':
								case 'operate':
									params.service = buttonInfo.operate_service
									url = `/pages/public/formPage/formPage?params=${JSON.stringify(params)}`
									break;
							}
							switch (buttonInfo.operate_type) {
								case '详情跳转':
									params.type = 'detail'
									url = `/pages/public/formPage/formPage?params=${JSON.stringify(params)}`
									break;
								case '列表弹出':
									let cond = buttonInfo.operate_params.condition
									if (Array.isArray(cond)) {
										url =
											`/pages/public/list/list?pageType=list&serviceName=${buttonInfo.operate_service}&cond=${JSON.stringify(cond)}`
									}
									break;
								case 'URL跳转':
									if (buttonInfo.pre_data_handle) {
										// #ifdef H5
										let arr = []
										arr.push(rowData)
										let result = eval("var fun=" + buttonInfo.pre_data_handle +
											"(arr); fun")
										if (result) {
											let url = result.slice(result.indexOf('/pages/'))
											uni.navigateTo({
												url,
												fail: () => {
													window.location.href = result
												}
											})
										}
										// #endif
									}

									return
								case 'operate':

									break;
							}
							if (params && url) {
								debugger
								uni.navigateTo({
									url
								})
							}
						}
					});
				}
				console.log('clickFootBtn:', data);
			},
			async getServiceV2(srv, srvType, pageType, app) {
				// 表单信息 srvType : add | update | list | detail | select
				// use_type: detail | proclist | list | treelist | detaillist | selectlist | addchildlist | updatechildlist | procdetaillist | add | update     
				let self = this
				let appName = app || uni.getStorageSync("activeApp")||'fyzhmd'
				if (srv && pageType) {
					let len = null
					let serviceName = srv
					if (!srvType) {
						serviceName = srv
					} else {
						len = srv.lastIndexOf('_')
						serviceName = srv.slice(0, len) + '_'
						let operate = srv.slice(len + 1)
						if (srvType && srvType === 'list' || srvType === 'detail') {
							serviceName += 'select'
						} else if (!['select', 'update', 'add', 'delete'].includes(operate)) {
							serviceName = srv
						} else {
							serviceName += srvType
						}
					}
					let req = this.selectRequestObjs()
					req.serviceName = 'srvsys_service_columnex_v2_select'
					req.colNames = ['*']
					req.condition = []
					let condObj = {}
					condObj['colName'] = 'service_name'
					condObj['ruleType'] = 'eq'
					condObj['value'] = serviceName
					req.condition[0] = JSON.parse(JSON.stringify(condObj))
					condObj['colName'] = 'use_type'
					condObj['ruleType'] = 'eq'
					condObj['value'] = pageType === 'select' ? 'detail' : pageType
					req.condition[1] = JSON.parse(JSON.stringify(condObj))
					req.order = [{}]
					req.order[0]['colName'] = 'seq'
					req.order[0]['orderType'] = 'asc'
					const url = `/${appName}/select/srvsys_service_columnex_v2_select?colsel_v2=${serviceName}`
					// let url = this.getServiceUrl(appName, "srvsys_service_columnex_v2_select",
					// 	"select")
					// url = url + "?colsel_v2=" + serviceName
					const response = await this.$u.post(url, req)
					// const response = await this.$http.post(url, req)
					if (response.data) {
						// console.log('=====2', response.data)
						response.data.use_type = pageType
						if ('rowButton' in response.data) {
							// response.data._footerBtns = this.getFooterBtns(response.data.rowButton)
						}

						let pageconfig = this.getPageConfig(response.data, pageType)
						return pageconfig
					}

				} else {
					return false
				}
			},
			// 初始化查询
			selectRequestObjs(srv, cond, order) { // 给自定义方法起个名
				let selectRequestObj = {}
				selectRequestObj['serviceName'] = ''
				selectRequestObj['colNames'] = ['*']
				selectRequestObj['condition'] = []
				if (srv) {
					selectRequestObj['serviceName'] = srv
				}
				if (cond) {
					selectRequestObj['condition'] = cond
				}
				if (order) {
					selectRequestObj['order'] = order
				}

				return selectRequestObj
			},
			getPageConfig(v2res, useType) {
				let pageConfigs = v2res || false
				if (pageConfigs) {
					pageConfigs["_fieldInfo"] = this.getFieldInfo(v2res.srv_cols, useType)
					if (useType === 'list') {
						pageConfigs["_buttonInfo"] = this.getButtonInfo(v2res.gridButton)
						pageConfigs["moreConfig"] = v2res.moreConfig ? JSON.parse(v2res.moreConfig) : null
					}
					if (useType === 'treelist') {
						pageConfigs["_rowButtons"] = this.getButtonInfo(v2res.rowButton, useType)
						pageConfigs["_handerButtons"] = this.getButtonInfo(v2res.gridButton, useType)
					} else if (useType === 'update' || useType === 'add' || useType === 'detail') {
						pageConfigs["_formButtons"] = this.getButtonInfo(v2res.formButton, useType)
					}
					return pageConfigs
				} else {
					return false
				}
			},
			getFieldInfo(srvCol, useType) {
				let cols = srvCol
				let fieldInfo = {}
				switch (useType) {
					// 统一根据页面类型 过滤字段显示 === 2 暂不支持
					case "add":
						cols = cols.filter((item, index) => {
							// if (item.in_add !== 0) {
							if (item.in_add === 1) {
								return item
							}
						})
						break;
					case "update":
						cols = cols.filter((item, index) => {
							if (item.in_update === 1) {
								return item
							}
						})
						break;
					case "detail":
						cols = cols.filter((item, index) => {
							// if (item.in_detail !== 0) {
							if (item.in_detail === 1) {
								return item
							}
						})
						break;
					default:
						break;
				}
				cols = cols.map((item, index) => {
					fieldInfo = {
						column: "",
						label: "",
						defaultValue: null,
						isRequire: null,
						type: null,
					}
					fieldInfo.column = item.columns
					fieldInfo.label = item.label
					fieldInfo.seq = item.seq
					if (item.init_expr) {
						item.init_expr = item.init_expr.replace(/\'/g, '')
						fieldInfo.defaultValue = item.init_expr
						fieldInfo.initValue = item.init_expr
					}
					fieldInfo.option_list_v2 = item.option_list_v2
					fieldInfo.x_if = item.x_if
					fieldInfo.col_type = item.col_type
					fieldInfo.section = item.section
					fieldInfo.validators = item.validators
					// col_type 转换 表单组件 type 
					if (item.col_type === "String" || item.col_type === "TelNo" || item.col_type ===
						'BankAccountNo' || item.col_type === "Email") {
						fieldInfo.type = "input"
					} else if (item.col_type === "DateTime" || item.col_type === "Date") {
						fieldInfo.type = "date"
					} else if (item.col_type === "FileList") {
						fieldInfo.type = "file"
						fieldInfo.srvInfo = {
							tableName: item.table_name,
							appNo: item.table_name.substring(item.table_name.indexOf("bx") + 2, item
								.table_name.indexOf("_"))
						}
					} else if (item.col_type === "Image") {
						// } else if (item.col_type === "Image" || item.col_type === "FileList") {
						fieldInfo.type = "images"
						fieldInfo.srvInfo = {
							tableName: item.table_name,
							appNo: item.table_name.substring(item.table_name.indexOf("bx") + 2, item
								.table_name.indexOf("_"))
						}
					} else if (item.col_type === "Enum" || item.col_type === "Dict") {
						fieldInfo.type = "radioFk"
						fieldInfo.options = item.option_list_v2
					} else if (item.col_type === "Set") {
						fieldInfo.type = "checkboxFk"
						fieldInfo.options = item.option_list_v2
					} else if (item.col_type === "MultilineText") {
						fieldInfo.type = "textarea"
					} else if (item.col_type === "Money" || item.col_type === "Float") {
						fieldInfo.type = "digit"
					} else if (item.col_type === "Integer" || item.col_type === "int") {
						fieldInfo.type = "number"
					} else if ((item.bx_col_type === "fk" || item.col_type === 'fk' || item.col_type ===
							'bxsys_dict') || (item.col_type && item.col_type.indexOf('bx') !== -1 && item
							.bx_col_type === 'string' && item.col_type !== "String")) {
						fieldInfo.type = "treeSelector"
						fieldInfo.options = item.option_list_v2
					} else if (item.col_type === "User") {
						fieldInfo.type = "treeSelector"
						fieldInfo.option_list_v2 = {
							"refed_col": "user_no",
							"srv_app": "sso",
							"serviceName": "srvsso_user_select",
							"key_disp_col": "user_disp"
						}
						fieldInfo.srvInfo = {
							serviceName: 'srvsso_user_select',
							appNo: 'sso',
							isTree: false,
							column: 'user_no',
							showCol: 'real_name', //要展示的字段
						}
					} else if (fieldInfo.col_type === 'UserList') {
						fieldInfo.isMulti = true
						fieldInfo.type = "treeSelector"
						fieldInfo.option_list_v2 = {
							serviceName: 'srvsso_user_select',
							srv_app: "sso",
							refed_col: 'user_no',
							key_disp_col: 'user_disp',
							show_as_pair: false,
						}
					} else if (fieldInfo.type === 'id_card') {
						fieldInfo.type = 'idCardPicture'
						fieldInfo.buttons = [{
							name: '拍照',
							type: 'car_no'
						}]
					} else {
						fieldInfo.type = item.col_type
					}

					fieldInfo.disabled = false //字段是否冻结
					switch (useType) {
						case "add":
							fieldInfo.showExp = (item.in_add === 1)
							fieldInfo.display = (item.in_add === 1)
							fieldInfo.in_add = item.in_add

							fieldInfo.disabled = item.updatable === 0 ? true : false //字段是否冻结
							break;
						case "update":
							fieldInfo.showExp = (item.in_update === 1)
							fieldInfo.display = (item.in_update === 1)
							fieldInfo.in_update = item.in_update

							fieldInfo.disabled = item.updatable === 0 ? true : false //字段是否冻结
							break;
						case "list":
							fieldInfo.showExp = (item.in_list === 1)
							fieldInfo.display = (item.in_list === 1)
							break;
						case "detail":
							fieldInfo.showExp = (item.in_detail === 1)
							fieldInfo.display = (item.in_detail === 1)
							break;
						case "proclist":
							fieldInfo.showExp = (item.in_list === 1)
							fieldInfo.display = (item.in_list === 1)
							break;
						case "cond":
							break;
						default:
							break;
					}
					// 处理字段统一属性
					fieldInfo.redundant = item.redundant
					fieldInfo.bx_col_type = item.bx_col_type
					fieldInfo._validators = this.getValidators(item.validators, item
						.validators_message)
					fieldInfo.isRequire = fieldInfo._validators.required
					fieldInfo.value = null //初始化value
					fieldInfo._colDatas = item //保存原始data
					return fieldInfo
				})
				return cols
			},
			getButtonInfo(buttons, pageType) {
				let cols = buttons
				let buttonInfo = {}
				cols = cols.filter((item, index) => {
					switch (pageType) {
						case "treelist":
							if (['addchild', 'edit', 'delete', 'add'].includes(item.button_type) && item
								.permission) {
								return item
							}
							break;
						case "list":
							if (['addchild', 'edit', 'delete', 'add'].includes(item.button_type) && item
								.permission) {
								return item
							}
							break;
						case "add":
							if (['reset', 'submit'].includes(item.button_type) && item
								.permission) {
								return item
							}
							break;
						case "update":
							if (['reset', 'edit'].includes(item.button_type) && item
								.permission) {
								return item
							}
							break;
						case "detail":
							if ((item.button_type === "customize") && item.permission) {
								if (item.operate_params && typeof item.operate_params === 'string') {
									try {
										item.operate_params = JSON.parse(item.operate_params)
									} catch (e) {
										console.log(e)
										//TODO handle the exception
									}
									return item
								}
							} else if (item.button_type === "edit" && item.permission) {
								return item
							}
							break;
						default:
							break;
					}
				})
				return cols
			},
			getValidators(vds, msg) { // 获取校验信息返回组件data
				if (vds !== null && msg !== null) {
					let str = vds
					// console.log('vds', vds)
					let getStr = function(val, state, end) {
						if (val.length > state.length + end.length) {
							let s = val.indexOf(state)
							if (s === -1) {
								return ''
							} else {
								let nval = val.slice(s + state.length, val.length)
								let e = nval.indexOf(end)
								let str = nval.slice(0, e)
								if (e === -1) {
									str = nval.slice(0)
								}
								return str
							}
						} else {
							return ''
						}
					}
					let Validators = {}
					let reg = /required/gi
					Validators['max'] = getStr(str, 'ngMaxlength=', ';').length > 0 ? parseInt(getStr(str,
							'ngMaxlength=', ';')) :
						null
					Validators['min'] = getStr(str, 'ngMinlength=', ';').length > 0 ? parseInt(getStr(str,
							'ngMinlength=', ';')) :
						null
					Validators['reg'] = getStr(str, 'ngPattern=', ';')
					Validators['required'] = reg.test(str)
					Validators['msg'] = getStr(msg, 'ngPattern=', ';')
					Validators['js_validate'] = getStr(str, 'js_validate=', ';')
					Validators['isType'] = function(e) {
						let reg = new RegExp(getStr(str, 'ngPattern=', ';'))
						if (reg.test(e)) {
							let obj = {
								valid: reg.test(e),
								msg: "有效"
							}
							return obj
						} else {
							let msgs = getStr(msg, 'ngPattern=', ';')
							msgs = msgs === '' ? '信息有误' : msgs
							let obj = {
								valid: reg.test(e),
								msg: msgs
							}
							return obj
						}
					}
					return Validators
				} else if (vds && !msg) {
					let reg = /required/gi
					let Validators = {}
					Validators['required'] = reg.test(vds)
					return Validators
				} else {
					return false
				}
			},
			async getListV2() {
				let app = uni.getStorageSync('activeApp');
				let self = this;
				let colVs = await this.getServiceV2(this.serviceName, 'list', this.pageType === 'proc' ? 'proclist' :
					'list', app);
				colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1 || item.in_list === 2);
				if (!this.navigationBarTitle) {
					uni.setNavigationBarTitle({
						title: colVs.service_view_name
					});
				}
				console.log('colVs', colVs);
				if (colVs.more_config) {
					try {
						colVs.moreConfig = JSON.parse(colVs.more_config)
					} catch (e) {
						//TODO handle the exception
					}
				}
				this.listConfig = colVs;
				if (this.pageType === 'proc') {
					this.showFootBtn = false;
				}
				this.publicButton = colVs.gridButton.filter(item => {
					if (item.permission === true) {
						switch (item.button_type) {
							case 'add':
							case 'apply':
								this.showAdd = true;
								return item;
								break;
							case 'select':
								this.showSearchBar = true;
								// #ifdef MP-WEIXIN
								this.listTop = 100;
								// #endif
								return item;
								break;
							case 'customize':
								break;
						}
					}
				});
				return colVs;
			}
		}
	};
</script>

<style lang="scss">
	.add-button {
		position: fixed;
		bottom: 100upx;
		left: calc(50% - 50upx);
		width: 100upx;
		height: 100upx;
		border-radius: 50%;
		background-color: #0bc99d;
		z-index: 100;

		&::before {
			position: absolute;
			width: 8upx;
			height: 60upx;
			left: calc(50% - 4upx);
			top: 20upx;
			content: '';
			background-color: #fff;
		}

		&::after {
			position: absolute;
			width: 60upx;
			height: 8upx;
			content: '';
			top: calc(50% - 4upx);
			left: 20upx;
			background-color: #fff;
		}

		&:active {
			transform: rotate(45deg);
			transition: all 0.2s;
		}
	}

	.search-bar {
		flex: 1;
	}
</style>
