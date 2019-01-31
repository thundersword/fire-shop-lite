// pages/freshman/freshman.js
var app = getApp()
Page({
	data: {
		bgPic: null,
		bgColor: null,
		couponsTop: null,
		conponsPic: null,
		couponsId: null,
		hasNoCoupons: true,
		coupons: null
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var that = this
		//获取优惠券背景
		wx.request({
			url: app.globalData.urls + '/banner/list',
			data: {
				key: 'mallName',
				type: 'coupons'
			},
			success: function(res) {
				console.log(res)
				if (res.data.code == 0 && app.globalData.system != 'key') {
					that.setData({
						bgPic: res.data.data[0]
					});
				}
			}
		})
		//获取优惠券页面整体背景
		wx.request({
			url: app.globalData.urls + '/config/get-value',
			data: {
				key: 'couponsBg'
			},
			success: function(res) {
				if (res.data.code == 0) {
					that.setData({
						bgColor: res.data.data.value
					});
				}
			}
		})
		//获取优惠券距离顶部高度
		wx.request({
			url: app.globalData.urls + '/config/get-value',
			data: {
				key: 'couponsTop'
			},
			success: function(res) {
				if (res.data.code == 0) {
					that.setData({
						couponsTop: res.data.data.value
					});
				}
			}
		})
		wx.request({
			url: app.globalData.urls + '/discounts/coupons',
			data: {
				type: 'freshman'
			},
			success: function(res) {
				console.log(res)
				if (res.data.code == 0) {
					that.setData({
						hasNoCoupons: false,
						coupons: res.data.data[0]
					});
				}
			}
		})
	},
	getCoupons: function(e) {
		var that = this;
		wx.request({
			url: app.globalData.urls + '/discounts/fetch',
			data: {
				id: e.currentTarget.dataset.id,
				token: app.globalData.token
			},
			success: function(res) {
				if (res.data.code == 20001 || res.data.code == 20002) {
					wx.showModal({
						title: '哎呦',
						content: '礼券已经领完了',
						showCancel: false
					})
					return;
				}
				if (res.data.code == 20003) {
					wx.showModal({
						title: '哎呦',
						content: '您已经领过了',
						showCancel: false
					})
					return;
				}
				if (res.data.code == 30001) {
					wx.showModal({
						title: '哎呦',
						content: '您的积分不足',
						showCancel: false
					})
					return;
				}
				if (res.data.code == 20004) {
					wx.showModal({
						title: '哎呦',
						content: '礼券已经过期',
						showCancel: false
					})
					return;
				}
				if (res.data.code == 0) {
					wx.showToast({
						title: '礼券领取成功',
						icon: 'success',
						duration: 2000
					})
				} else {
					wx.showModal({
						title: '错误',
						content: res.data.msg,
						showCancel: false
					})
				}
			}
		})
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
