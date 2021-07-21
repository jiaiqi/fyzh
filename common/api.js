import config from '@/common/config.js'
import Vue from 'vue'
import store from '@/store/index.js'
/**
 * 微信静默登录
 */
const wxLogin = async () => {
	const result = await wx.login()
	if (result.code) {
		let url = '/wx/operate/srvwx_app_login_verify'
		let req = [{
			data: [{
				code: result.code,
				app_no: config.appNo.wxmp
			}],
			serviceName: 'srvwx_app_login_verify'
		}]
		const res = await uni.$u.post(url, req)
		if (res.resultCode === 'SUCCESS') {
			// 登录成功
			let resData = res.response[0].response;
			if (resData && resData.bx_open_code) {
				uni.$u.vuex('needAuthProfile', true)
				uni.$u.vuex('openCode', resData.bx_open_code)
				// 后端未获取到unionid 需要通过开放登录接口给后端发送wx.getProfile获取到的数据
			} else {
				if (resData && resData?.login_user_info?.user_no) {
					uni.setStorageSync('login_user_info', resData.login_user_info);
					uni.$u.vuex('vuex_loginUser', resData.login_user_info)
					getMemberInfo(resData.login_user_info.user_no)
					getCart(resData.login_user_info.user_no)
				}
				if (resData && resData.login_user_info.data) {
					uni.setStorageSync('visiter_user_info', resData.login_user_info.data[0]);
				}
			}
			uni.$u.vuex('vuex_token', resData.bx_auth_ticket)
			uni.setStorageSync('bx_auth_ticket', resData
				.bx_auth_ticket);
			uni.setStorageSync('isLogin', true);
			uni.$u.vuex('isLogin', true)
		}
	}
}


const getCart = async (user_no) => {
	// 查找购物车数据
	let url = '/fyzhmd/select/srvstore_shop_cart_goods_select'
	let req = {
		"serviceName": "srvstore_shop_cart_goods_select",
		"colNames": ["*"],
		"condition": [{
			"colName": "user_no",
			"ruleType": "eq",
			"value": user_no
		}],
		"page": {
			"pageNo": 1,
			"rownumber": 50
		},
		"order": [{
			colName: 'create_time',
			orderType: 'desc'
		}]
	}
	if (user_no) {
		let res = await uni.$u.post(url, req)
		// then(res => {
		if (res.state == 'SUCCESS') {
			uni.$u.vuex('vuex_cart', res.data)
		}
		return res
		// })
	}
}
// 获取当前登录用户会员信息
const getMemberInfo = async (hy_user_no) => {
	const url = '/fyzhmd/select/srvstore_member_mgmt_select'
	const req = {
		"serviceName": "srvstore_member_mgmt_select",
		"colNames": ["*"],
		"condition": [{
			"colName": "hy_user_no",
			"ruleType": "eq",
			"value": hy_user_no
		}],
		"page": {
			"pageNo": 1,
			"rownumber": 5
		}
	}
	if (!hy_user_no) {
		return
	}
	const res = await uni.$u.post(url, req)
	if (res.state === 'SUCCESS') {
		let memberInfo = res.data
		if (memberInfo.length > 0) {
			uni.$u.vuex('vuex_memberInfo', res.data[0])
		} else {
			uni.$u.vuex('vuex_memberInfo', false)
		}
	}
	// hy_user_no
}

// 小程序开户登录
const wxOpenLogin = async (wxAuthUserInfo) => {
	let openCode = store?.state.openCode
	const {
		userInfo
	} = wxAuthUserInfo
	if (userInfo && openCode) {
		let url = `/wx/operate/srvwx_mini_open_account_login?openCode=${openCode}`
		let data = {
			"app_no": config.appNo.wxmp,
			"avatarUrl": userInfo.avatarUrl,
			"nickname": userInfo.nickName,
			"headimgurl": userInfo.avatarUrl,
			"sex": userInfo.gender,
			"country": userInfo.country,
			"province": userInfo.province,
			"city": userInfo.city,
			"encryptedData": wxAuthUserInfo.encryptedData,
			"cloudID": wxAuthUserInfo.cloudID,
			"rawData": wxAuthUserInfo.rawData,
			"iv": wxAuthUserInfo.iv,
			"signature": wxAuthUserInfo.signature
		}

		Object.keys(data).forEach(key => {
			if (!data[key]) {
				delete data[key]
			}
		})
		let req = [{
			"serviceName": "srvwx_mini_open_account_login",
			"data": [data]
		}]
		let response = await uni.$u.post(url, req)
		if (response.resultCode === 'SUCCESS') {
			// 登录成功
			uni.setStorageSync('isLogin', true);
			uni.$u.vuex('isLogin', true)
			uni.$u.vuex('needAuthProfile', false)
			uni.$u.vuex('openCode', null)
			let resData = response.response[0].response;
			uni.$u.vuex('vuex_token', resData.bx_auth_ticket)
			if (resData.login_user_info.id) {
				uni.setStorageSync('login_user_info', resData.login_user_info);
				uni.$u.vuex('vuex_loginUser', resData.login_user_info)
			}
			uni.setStorageSync('bx_auth_ticket', resData.bx_auth_ticket);
			if (resData.login_user_info.data) {
				uni.setStorageSync('visiter_user_info', resData.login_user_info.data[0]);
			}
			return true
		} else {
			return false
		}
	} else {
		return
	}
}
/**
 * @description 获取微信支付需要的参数（签名等）
 * @param {String} prepay_id - 预支付id  
 * @param {String} wx_mch_id - 商户号  
 */
const getPayParams = async (prepay_id, wx_mch_id = '1611681078') => {
	let url = '/wx/select/srvwx_app_pay_sign_select'
	let req = {
		"serviceName": "srvwx_app_pay_sign_select",
		"colNames": [
			"*"
		],
		"condition": [{
				"colName": "app_no",
				"ruleType": "eq",
				"value": config.appNo.wxmp
			},
			{
				// 商户号
				"colName": "wx_mch_id",
				"ruleType": "eq",
				"value": wx_mch_id
			},
			{
				"colName": "prepay_id",
				"ruleType": "eq",
				"value": prepay_id
			}
		]
	}
	if (prepay_id && wx_mch_id) {
		let res = await uni.$u.post(url, req)
		if (res.state === 'SUCCESS') {
			if (Array.isArray(res.data) && res.data.length > 0) {
				// store.commit('SET_PAY_PARAMS', res.data[0])
				uni.$u.vuex('vuex_payParams', res.data[0])
				return res.data[0]
			} else {
				uni.showModal({
					title: '提示',
					content: JSON.stringify(res),
					showCancel: false
				})
			}
		}
	} else {
		uni.showModal({
			title: '提示',
			content: '请检查wx_mch_id及prepay_id是否正确传入',
			showCancel: false
		})
	}
}
/**
 * @description 统一下单接口
 * @param {Number}  total_fee -金额 单位为分
 * @param {String} login_user_type -用户类型
 * @param {Object} orderData -订单信息
 * @param {String} wx_mch_id -商户号
 */
const toPlaceOrder = async (total_fee, login_user_type, orderData, wx_mch_id = '1611681078') => {
	// 统一下单
	let url = '/wx/operate/srvwx_order'
	let req = [{
		"serviceName": "srvwx_order",
		"data": [{
			"app_no": config.appNo.wxmp,
			"wx_mch_id": wx_mch_id,
			"out_trade_no": orderData ? orderData.order_no : new Date().getTime(),
			"total_fee": total_fee, // 单位是分
			"spbill_create_ip": "192.168.0.21",
			"notify_url": "http://wx2.100xsys.cn/wx/notify/payment",
			"body": "test producet",
			"user_no": store?.state?.vuex_loginUser?.user_no,
			"login_user_type": login_user_type ? login_user_type : "user"
		}]
	}]
	let res = await uni.$u.post(url, req)
	if (res.state === 'SUCCESS') {
		if (Array.isArray(res.response) && res.response.length > 0) {
			let info = res.response[0]
			if (info.response) {
				info = info.response
				uni.$u.vuex('vuex_prepayInfo', info)
				return info
			}
		}
	}
}


// index
const getPageItem = async (page_no = "BX202106291053190001") => {
	const url = '/daq/select/srvdaq_website_page_item_select'
	const req = {
		"serviceName": "srvdaq_website_page_item_select",
		"colNames": ["*"],
		"condition": [{
			"colName": "page_no",
			"ruleType": "eq",
			"value": page_no || config?.page_no
		}],
	}
	return await uni.$u.post(url, req)
}

/**
 * @description 根据file_no查找文件列表
 * @param {String} file_no - 文件编号
 */
const getFilePath = async function(file_no) {
	let url = '/file/select/srvfile_attachment_select'
	let req = {
		"serviceName": "srvfile_attachment_select",
		"colNames": ["*"],
		"condition": [{
			"colName": "file_no",
			"value": file_no,
			"ruleType": "eq",
		}]
	}
	if (file_no) {
		let response = await uni.$u.post(url, req);
		if (response.state === 'SUCCESS' && response.data.length > 0) {
			return response.data.map(item => {
				item.url = config.getFilePath + item.fileurl + '&bx_auth_ticket=' + uni
					.getStorageSync('bx_auth_ticket');
				return item
			})
		}
	}
}

const getItemDetail = async (item) => {
	// 获取页面项详情
	let serviceName = '';
	let app = 'daq'
	switch (item.div_type) {
		case 'buttons':
			serviceName = 'srvdaq_page_item_buttons_select';
			break;
		case 'carousel':
			serviceName = 'srvdaq_page_item_carousel_select';
			break;
		case 'tablist':
			serviceName = 'srvdaq_page_item_tablist_select';
			break;
		case "store_icon":
			//机构主页快捷入口
			serviceName = 'srvhealth_store_mgmt_select';
			app = 'health'
			break;
	}
	if (serviceName && item.item_no) {
		let url = `/${app}/select/${serviceName}`
		let req = {
			serviceName: serviceName,
			colNames: ['*'],
			condition: [{
				colName: 'item_no',
				ruleType: 'in',
				value: item.item_no
			}],
			order: [{
				colName: 'seq',
				orderType: 'asc'
			}]
		};
		if (item.disp_flag === '否') {
			return []
		}
		let res = await uni.$u.post(url, req);
		if (Array.isArray(res.data)) {
			return res.data.map(item => {
				if (item.carousel_image) {
					item.image = getImagePath(item.carousel_image, true)
					item.title = item.carousel_name
				}
				if (item.icon_file_no) {
					item.label = item.dest_menu_no
					item.icon = getImagePath(item.icon_file_no, true)
				}
				return item
			})
		}
	}
}

/**
 * @description 获取图片地址
 * @param {String} no -图片编码
 * @param {Boolean} notThumb -是否原图
 */
const getImagePath = (no, notThumb) => {
	if (no && (no.indexOf('http://') !== -1 || no.indexOf('https://') !== -1)) {
		return no
	} else if (no) {
		if (no.indexOf('&bx_auth_ticket') !== -1) {
			no = no.split('&bx_auth_ticket')[0]
		}
		let ticket = uni.getStorageSync('bx_auth_ticket') || config.ticket
		if (notThumb) {
			return config.downloadFile + no + '&bx_auth_ticket=' + ticket;
		} else {
			return config.downloadFile + no + '&thumbnailType=fwsu_100&bx_auth_ticket=' + ticket;
		}
	} else {
		return ''
	}
}

export {
	wxLogin,
	wxOpenLogin,
	getPageItem,
	getFilePath,
	getItemDetail,
	getImagePath,
	toPlaceOrder,
	getPayParams,
	getCart,
	getMemberInfo
}
