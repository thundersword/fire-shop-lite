//index.js
//获取应用实例
const app = getApp()
const WXAPI = require('apifm-wxapi')
Page({
	data: {
		coupons: []
	},
	onLoad: function() {
		var that = this;
		if (app.globalData.iphone == true) {
			that.setData({
				iphone: 'iphone'
			})
		}
	},
	onShow: function() {
		this.getMyCoupons();
	},
	getMyCoupons: function() {
		WXAPI.myCoupons({
			token: wx.getStorageSync('token'),
			status: 0
		}).then(res => {
			if (res.code == 0) {
				let coupons = res.data;
				if (coupons.length > 0) {
					this.setData({
						coupons: coupons,
						loadingMoreHidden: true
					});
				}
			} else {
				this.setData({
					loadingMoreHidden: false
				});
			}
		})
	},
	goBuy: function() {
		wx.navigateTo({
			url: '/pages/coupons/coupons'
		})
	},
	gohome: function() {
		wx.switchTab({
			url: "/pages/index/index"
		})
	}

})
