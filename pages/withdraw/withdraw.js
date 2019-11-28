const app = getApp()
const WXAPI = require('apifm-wxapi')
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		balance: 0,
		isHidden: true, //是否隐藏登录弹窗
		token: null,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function() {
		var that = this;
		if (app.globalData.iphone == true) {
			that.setData({
				iphone: 'iphone'
			})
		}
	},
	afterAuth(e) {
		this.setData({
			token: e.detail
		})
		this.getUserBalance()
	},
	showAuth() {
		this.setData({
			isHidden: false
		})
	},
	getUserBalance() {
		if (!this.data.token) return this.showAuth()
		WXAPI.userAmount(this.data.token).then(res => {
			if (res.code == 0) {
				this.setData({
					balance: res.data.balance,
					freeze: res.data.freeze,
					score: res.data.score
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
		if (this.data.token) this.getUserBalance()
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
		if (!this.data.token) return this.showAuth()
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
		WXAPI.withDrawApply(this.data.token, amount).then(res => {
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
