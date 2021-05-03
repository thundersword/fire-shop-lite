const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')

const app = getApp()
Page({
	data: {
		addressList: [],
		wxlogin: true
	},

	selectTap: function(e) {
		var id = e.currentTarget.dataset.id;
		WXAPI.updateAddress({
			token: wx.getStorageSync('token'),
			id: id,
			isDefault: 'true'
		}).then(function(res) {
			wx.navigateBack({})
		})
	},

	addAddess: function() {
		wx.navigateTo({
			url: "/pages/address-add/index"
		})
	},

	editAddess: function(e) {
		wx.navigateTo({
			url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id
		})
	},

	onLoad: function() {},
	afterAuth() {
		this.setData({
			wxlogin: true
		})
		this.initShippingAddress()
	},
	closeAuth() {
		wx.navigateBack()
	},
	onShow: function() {
		AUTH.checkHasLogined().then(isLogined => {
			this.setData({
				wxlogin: isLogined
			})
			if(isLogined){
				this.initShippingAddress()
			}
		})
	},
	initShippingAddress: function() {
		var that = this;
		WXAPI.queryAddress(wx.getStorageSync('token')).then(function(res) {
			if (res.code == 0) {
				that.setData({
					addressList: res.data
				});
			} else if (res.code == 700) {
				that.setData({
					addressList: null
				});
			}
		})
	}

})
