const toPreviewImage = (urls) => {
	if (!urls) {
		return;
	}
	if (typeof urls === 'string') {
		urls = [urls];
	}
	urls = urls.map(url => {
		//若图片地址携带压缩图参数则预览时去掉此参数
		return url.replace(/&thumbnailType=fwsu_100/gi, '');
	});
	uni.previewImage({
		urls: urls,
		longPressActions: {
			itemList: ['发送给朋友', '保存图片', '收藏'],
			success: function(data) {
				console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
			}
		}
	});
}

const getVideoInfo = (url) => {
	return new Promise((resolve, reject) => {
		// #ifdef MP-WEIXIN
		uni.getVideoInfo({
			src: url,
			success(res) {
				resolve(res)
			},
			fail(error) {
				reject(error)
			}
		})
		// #endif
	})
}
/**
 * @description 获取图片信息
 */
const getImageInfo = (item) => {
	return new Promise((resolve, reject) => {
		wx.getImageInfo({
			src: item.url,
			success: (res) => {
				resolve({
					name: item.name,
					src: res.path,
					height: res.height,
					h: res.height,
					w: res.width,
					width: res.width
				})
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}

const treeReform = function(e, pidcol, idcol) {
	// 
	let data = uni.$u.deepClone(e)
	let to1Data = e.filter((item, index) => {
		return item[pidcol] === null || item[pidcol] === ""
	})
	let to2Data = e.filter((item, index) => {
		return item[pidcol] !== null || item[pidcol] === ""
	})
	let reform = function(allData, pd, id, data) {
		// 根据顶级节点组装数有子节点
		let datas = uni.$u.deepClone(data) // 当前级别
		let aDatas = uni.$u.deepClone(allData) // 剩余data
		for (let i = 0; i < datas.length; i++) {
			let child = []
			for (let j = 0; j < aDatas.length; j++) {
				// console.log("slice==="+j,datas[i][id],aDatas[j][pd])
				if (datas[i][id] === aDatas[j][pd]) {
					child.push(aDatas[j])
					aDatas.slice(j, 1)
					// console.log("slice==="+j,aDatas,aDatas[j],j)
				}
			}
			if (child.length > 0) {
				datas[i]["_childNode"] = reform(aDatas, pd, id, child)
			} else {
				datas[i]["_childNode"] = child
			}
		}
		return datas
	}
	to1Data = reform(to2Data, pidcol, idcol, to1Data)
	return to1Data
}
export {
	getVideoInfo,
	getImageInfo,
	toPreviewImage,
	treeReform
}
