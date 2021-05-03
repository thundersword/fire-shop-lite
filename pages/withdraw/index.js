const app = getApp()
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		balance: 0,
		wxlogin: true, //是否隐藏登录弹窗
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function() {
		
	},
	
	getUserBalance() {
		WXAPI.userAmount(wx.getStorageSync('token')).then(res => {
			if (res.code == 0) {
				this.setData({
					balance: res.data.balance,
					freeze: res.data.freeze
				});
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
		AUTH.checkHasLogined().then(isLogined => {
			this.setData({
				wxlogin: isLogined
			})
			if(isLogined){
				this.getUserBalance()
			}
		})
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

	},
	bindCancel: function() {
		wx.navigateBack({})
	},
	bindSave: function(e) {
		
		var that = this;
		var amount = e.detail.value.amount;

		if (amount == "" || amount * 1 < 100) {
			wx.showModal({
				title: '错误',
				content: '请填写正确的提现金额',
				showCancel: false
			})
			return
		}
		WXAPI.withDrawApply(wx.getStorageSync('token'), amount).then(res => {
			if (res.code == 0) {
				wx.showModal({
					title: '成功',
					content: '您的提现申请已提交，等待财务打款',
					showCancel: false,
					success: function(res) {
						if (res.confirm) {
							that.bindCancel();
						}
					}
				})
			} else {
				wx.showModal({
					title: '错误',
					content: res.msg,
					showCancel: false
				})
			}
		})
	}
})
