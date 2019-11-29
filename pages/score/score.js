const app = getApp()
const WXAPI = require('apifm-wxapi')
Page({
	data: {
		score: 0, //积分
		score_sign_continuous: 0, //连续签到次数
		ci: 0, //今天是否已签到
		isHidden: true, //是否隐藏登录弹窗
		token: null,
	},

	onShow() {
		if (this.data.token) {
			this.checkScoreSign();
			this.getUserScore();
		}

	},
	showAuth() {
		this.setData({
			isHidden: false
		})
	},
	afterAuth(e) {
		this.setData({
			isHidden: true,
			token: e.detail
		})
		this.checkScoreSign();
		this.getUserScore();
	},
	//签到按钮
	scoresign: function() {
		if (!this.data.token) return this.showAuth()
		WXAPI.scoreSign(this.data.token).then(res => {
			if (res.code == 0) {
				this.onLoad();
				this.checkScoreSign();
				this.getUserScore();
			}
			wx.showToast({
				title: '签到成功',
				icon: 'success',
				duration: 2000
			})
		})
	},
	checkScoreSign: function() {
		WXAPI.scoreTodaySignedInfo(this.data.token).then(res => {
			console.log(res)
			if (res.code == 0) {
				this.setData({
					ci: 1,
					score_sign_continuous: res.data.continuous
				});
			}
		})
	},
	getUserScore() {
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
	onLoad: function() {
		var that = this;
		if (app.globalData.iphone == true) {
			that.setData({
				iphone: 'iphone'
			})
		}
		//获取积分

		//获取签到规则
		WXAPI.scoreSignRules().then(res => {
			if (res.code == 0) {
				that.setData({
					rules: res.data
				});
			}
		})
	},
	score: function() {
		wx.navigateTo({
			url: "/pages/coupons/coupons"
		})
	},
	home: function() {
		wx.switchTab({
			url: '../index/index'
		})
	}

})
