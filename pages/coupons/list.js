//index.js
//获取应用实例
const app = getApp()
const WXAPI = require('apifm-wxapi')
Page({
	data: {
		coupons: '',
		busid: 0,
		isHidden: true,
		token: null,
	},
	afterAuth(e) {
		this.setData({
			token: e.detail
		})
	},
	onCouponsInput: function(e) {
		this.data.coupons = e.detail.value;
		this.data.id = e.currentTarget.dataset.id;
	},
	onExchange: function() {
		WXAPI.exchangeCoupons(this.data.token, 1, this.data.coupons).then(res => {
			if (res.code == 0) {
				wx.showToast({
					title: '礼券兑换成功',
					icon: 'success',
					duration: 2000
				})
			} else {
				wx.showModal({
					title: '兑换失败',
					content: res.msg,
					showCancel: false
				})
				return;
			}
		})
	},
	onLoad: function() {
		var that = this
		if (app.globalData.iphone == true) {
			that.setData({
				iphone: 'iphone'
			})
		}
		that.getCoupons();
		WXAPI.banners({
			key: 'mallName',
			type: 'duihuan'
		}).then(res => {
			if (res.code == 0 && app.globalData.system != 'key') {
				that.setData({
					banners: res.data,
					busid: res.data[0].businessId
				});
			}
		})
	},
	getCoupons: function() {
		WXAPI.coupons({
			type: 'shop'
		}).then(res => {
			if (res.code == 0) {
				this.setData({
					hasNoCoupons: false,
					coupons: res.data
				});
			}
		})
		var that = this;
	},
	gitCoupon: function(e) {
		var that = this;
		WXAPI.fetchCoupons({
			id: e.currentTarget.dataset.id,
			token: this.data.token
		}).then(res => {
			if (res.code == 0) {
				wx.showToast({
					title: '礼券领取成功',
					icon: 'success',
					duration: 2000
				})
			} else {
				wx.showModal({
					title: '提示',
					content: res.msg,
					showCancel: false
				})
			}
		})
	}
})
