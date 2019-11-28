//index.js
//获取应用实例
const app = getApp()
const WXAPI = require('apifm-wxapi')
Page({
	data: {

	},

	toDetailsTap: function(e) {
		wx.navigateTo({
			url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
		})
	},
	onLoad: function(e) {
		wx.showLoading();
		var that = this;
		if (app.globalData.iphone == true) {
			that.setData({
				iphone: 'iphone'
			})
		}
		WXAPI.goods({
			categoryId: e.id,
			pageSize: 100
		}).then(res => {
			wx.hideLoading()
			that.setData({
				goods: [],
				loadingMoreHidden: true
			});
			let goods = [];
			if (res.code != 0 || res.data.length == 0) {
				that.setData({
					loadingMoreHidden: false,
				});
				return;
			}
			for (let i = 0; i < res.data.length; i++) {
				goods.push(res.data[i]);
			}
			that.setData({
				goods: goods,
			});
		})
	}

})
