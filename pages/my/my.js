const app = getApp()
const WXAPI = require('apifm-wxapi')
Page({
	data: {
		balance: 0,
		freeze: 0,
		score: 0,
		score_sign_continuous: 0,
		tabClass: ["", "", "", "", ""],
		userInfo: null,
		isHidden: true, //是否隐藏登录弹窗
		token:null,
		version:null,
		noticeList:[],
	},
	onLoad: function() {
		this.getVersion();
		this.getNoticeList();
	},
	onShow() {
		if(this.data.token){
			this.getUserApiInfo()
			this.getUserAmount()
			this.checkScoreSign()
			this.getOrderStatistics()
		}
		//更新订单状态
		var that = this;
		wx.getStorage({
			key: 'shopCarInfo',
			success: function(res) {
				if (res.data) {
					that.data.shopCarInfo = res.data
					if (res.data.shopNum > 0) {
						wx.setTabBarBadge({
							index: 2,
							text: '' + res.data.shopNum + ''
						})
					} else {
						wx.removeTabBarBadge({
							index: 2,
						})
					}
				} else {
					wx.removeTabBarBadge({
						index: 2,
					})
				}
			}
		})
	},
	showAuth(){
		this.setData({
			isHidden:false
		})
	},
	/*
	*授权登录成功后回调
	*/
	afterAuth(e){
		this.setData({
			isHidden:true,
			token:e.detail
		})
		this.getUserApiInfo()
		this.getUserAmount()
		this.checkScoreSign()
		this.getOrderStatistics()
	},
	getUserApiInfo: function() {
		WXAPI.userWxinfo(this.data.token).then( res => {
			if(res.code == 0) this.setData({
				userInfo:res.data
			})
		})
	},
	getUserAmount: function() {
		WXAPI.userAmount(this.data.token).then( res => {
			if (res.code == 0) {
				this.setData({
					balance: res.data.balance,
					freeze: res.data.freeze,
					score: res.data.score
				});
			}
		})
	},
	getVersion(){
		const that = this
		wx.getStorage({
			key:'version',
			success(res) {
				that.setData({
					version:res.data
				})
			}
		})
	},
	checkScoreSign: function() {
		WXAPI.scoreTodaySignedInfo(this.data.token).then( res => {
			if (res.code == 0) {
				this.setData({
					score_sign_continuous: res.data.continuous
				});
			}
		})
	},
	getUserInfo: function(cb) {
		var that = this
		wx.login({
			success: function() {
				wx.getUserInfo({
					success: function(res) {
						that.setData({
							userInfo: res.userInfo
						});
					}
				})
			}
		})
	},
	getOrderStatistics(){
		WXAPI.orderStatistics(this.data.token).then( res => {
			if (res.code == 0) {
				if (res.data.count_id_no_pay > 0) {
					wx.setTabBarBadge({
						index: 3,
						text: '' + res.data.count_id_no_pay + ''
					})
				} else {
					wx.removeTabBarBadge({
						index: 3,
					})
				}
				this.setData({
					noplay: res.data.count_id_no_pay,
					notransfer: res.data.count_id_no_transfer,
					noconfirm: res.data.count_id_no_confirm,
					noreputation: res.data.count_id_no_reputation
				});
			}
		})
	},
	getNoticeList(){
		WXAPI.noticeList({
			type:'notice'
		}).then( res => {
			if (res.code == 0) {
				this.setData({
					noticeList: res.data
				});
			}
		})
	},
	score: function() {
		wx.navigateTo({
			url: "/pages/score/score"
		})
	},
})
