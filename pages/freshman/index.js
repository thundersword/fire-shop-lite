// pages/freshman/freshman.js
const app = getApp()
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
Page({
	data: {
		bgPic: null,
		bgColor: null,
		couponsTop: null,
		conponsPic: null,
		couponsId: null,
		hasNoCoupons: true,
		coupons: null,
		wxlogin: true,
		hasGot: false
	},
	afterAuth() {
		this.setData({
			wxlogin: true
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		if(app.globalData.iphone){
			this.setData({
				iphone: 'iphone'
			})
		}
		//获取优惠券背景
		WXAPI.banners({
			key: 'mallName',
			type: 'coupons'
		}).then(res => {
			if (res.code == 0) {
				this.setData({
					bgPic: res.data[0]
				});
			}
		})

		//获取优惠券页面整体背景 距离顶部高度
		WXAPI.queryConfigBatch('couponsBg,couponsTop').then(res => {
			if (res.code == 0) {
				res.data.forEach(config => {
					this.setData({
						[config.key]: config.value
					})
				})
			}
		})
		//获取新人优惠券
		WXAPI.coupons({
			type: 'freshman'
		}).then( res => {
			if (res.code == 0) {
				this.setData({
					hasNoCoupons: false,
					coupons: res.data[0]
				});
			}
		})
	},
	getCoupons: function(e) {
		AUTH.checkHasLogined( isLogined => {
			if(!isLogined){
				this.setData({
					wxlogin: false
				})
				return
			}
		})
		WXAPI.fetchCoupons({
			id: e.currentTarget.dataset.id,
			token: wx.getStorageSync('token')
		}).then( res => {
			if (res.code == 20001 || res.code == 20002) {
				wx.showModal({
					title: '哎呦',
					content: '礼券已经领完了',
					showCancel: false
				})
				this.disableBtn()
				return;
			}
			if (res.code == 20003) {
				wx.showModal({
					title: '哎呦',
					content: '您已经领过了',
					showCancel: false
				})
				this.disableBtn()
				return;
			}
			if (res.code == 30001) {
				wx.showModal({
					title: '哎呦',
					content: '您的积分不足',
					showCancel: false
				})
				this.disableBtn()
				return;
			}
			if (res.code == 20004) {
				wx.showModal({
					title: '哎呦',
					content: '礼券已经过期',
					showCancel: false
				})
				this.disableBtn()
				return;
			}
			if (res.code == 0) {
				wx.showToast({
					title: '礼券领取成功',
					icon: 'success',
					duration: 2000
				})
				this.disableBtn()
			} else {
				wx.showModal({
					title: '错误',
					content: res.msg,
					showCancel: false
				})
			}
		})
	},
	disableBtn(){
		this.setData({
			hasGot: true
		})
		console.log(this.data.hasGot)
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})
