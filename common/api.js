import config from '@/common/config.js'
import Vue from 'vue'
/**
 * 微信静默登录
 */
const wxLogin = () => {
	return new Promise(resolve => {
		wx.login({
			success(result) {
				if (result.code) {
					let url = '/wx/operate/srvwx_app_login_verify'
					let req = [{
						data: [{
							code: result.code,
							app_no: config.appNo.wxmp
						}],
						serviceName: 'srvwx_app_login_verify'
					}]
					uni.$u.post(url, req).then(res => {
						if (res.data.resultCode === 'SUCCESS') {
							// 登录成功
							let resData = res.data.response[0].response;
							if (store.state.app.isLogin) {
								resolve(true)
							}
							if (resData && resData.bx_open_code) {
								// 后端未获取到unionid 需要通过开放登录接口给后端发送wx.getUserInfo获取到的数据
								resolve(wxOpenLogin(resData.bx_open_code))
							}
							uni.setStorageSync('isLogin', true);
							store.commit('SET_LOGIN_STATE', true)
							store.commit('SET_TICKET', resData.bx_auth_ticket)
							uni.setStorageSync('bx_auth_ticket', resData
								.bx_auth_ticket);

							if (resData && resData.login_user_info.user_no) {
								uni.setStorageSync('login_user_info', resData
									.login_user_info);
								store.commit('SET_LOGIN_USER', resData.login_user_info)
							}
							if (resData && resData.login_user_info.data) {
								uni.setStorageSync('visiter_user_info', resData
									.login_user_info.data[0]);
							}
							resolve(true)
						}
					})
				}
			}
		})
	})
}

const getPageItem = async () => {
	const url = '/daq/select/srvdaq_website_page_item_select'
	const req = {
		"serviceName": "srvdaq_website_page_item_select",
		"colNames": ["*"],
		"condition": [{
			"colName": "page_no",
			"ruleType": "eq",
			"value": config?.page_no || "BX202106291053190001"
		}],
	}
	return await uni.$u.post(url, req)
}

/**
 * @description 根据file_no查找文件列表
 * @param {String} file_no - 文件编号
 */
const getFilePath = async function(file_no) {
	let url = Vue.prototype.getServiceUrl('file', 'srvfile_attachment_select', 'select')
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
		if (response.data.state === 'SUCCESS' && response.data.data.length > 0) {
			return response.data.data
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
	getPageItem,
	getFilePath,
	getItemDetail,
	getImagePath
}
