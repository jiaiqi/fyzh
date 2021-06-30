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

export {
	getVideoInfo,
	getImageInfo,
	toPreviewImage
}
