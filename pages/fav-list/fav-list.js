//index.js
//获取应用实例
const app = getApp()
const WXAPI = require('apifm-wxapi')
Page({
	data: {},
	afterAuth(e) {
		this.setData({
			token: e.detail
		})
		this.getList()
	},
	toDetailsTap: function(e) {
		wx.navigateTo({
			url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
		})
	},
	home: function() {
		wx.switchTab({
			url: "/pages/index/index"
		})
	},
	getList() {
		WXAPI.goodsFavList({
			token: this.data.token
		}).then(res => {
			if (res.code == 0) {
				this.setData({
					favList: res.data,
					loadingMoreHidden: true
				});
			} else if (res.code == 404) {
				this.setData({
					favList: null,
					loadingMoreHidden: false
				});
			}
		})
	},
	onShow: function() {
		var that = this;
		if (app.globalData.iphone == true) {
			that.setData({
				iphone: 'iphone'
			})
		}
	}



})
