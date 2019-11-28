//index.js
//获取应用实例
const app = getApp()
const WXAPI = require('apifm-wxapi')
Page({
	data: {
		addressList: [],
		isHidden: true,
		token: null,
	},
	afterAuth(e) {
		this.setData({
			token: e.detail
		})
		this.initShippingAddress()
	},
	selectTap: function(e) {
		var id = e.currentTarget.dataset.id;
		WXAPI.updateAddress({
			token: this.data.token,
			id: id,
			isDefault: 'true'
		}).then(res => {
			wx.navigateBack()
		})
	},

	addAddess: function() {
		wx.navigateTo({
			url: "/pages/address-add/address-add"
		})
	},

	editAddess: function(e) {
		wx.navigateTo({
			url: "/pages/address-add/address-add?id=" + e.currentTarget.dataset.id
		})
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
		if(this.data.token) this.initShippingAddress()
	},
	initShippingAddress: function() {
		WXAPI.queryAddress(this.data.token).then(res => {
			console.log(res)
			if (res.code == 0) {
				this.setData({
					addressList: res.data,
					loadingMoreHidden: true
				});
			} else if (res.code == 700) {
				this.setData({
					addressList: null,
					loadingMoreHidden: false
				});
			}
		})
	}

})
