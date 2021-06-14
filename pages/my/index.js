const app = getApp()
const WXAPI = require('apifm-wxapi')
const CONFIG = require('../../config.js')
const TOOLS = require('../../utils/tools.js')
const AUTH = require('../../utils/auth')
Page({
	data: {
		balance: 0,
		freeze: 0,
		score: 0,
		score_sign_continuous: 0,
		tabClass: ["", "", "", "", ""],
		userInfo: null,
		token: null,
		version: null,
		noticeList: [],
		loaded: false,//避免首次打开用户中心重复获取数据,
		// 判断有没有用户详细资料
		userInfoStatus: 0 // 0 未读取 1 没有详细信息 2 有详细信息
	},
	onLoad: function() {
		this.getNoticeList();
	},
	onShow() {
		AUTH.checkHasLogined().then( isLogined =>{
			if(isLogined){
				this.getUserApiInfo()
				// this.getUserAmount()
				this.checkScoreSign()
				this.getOrderStatistics()
				this.setData({
					loaded: true
				})
			}else{
				AUTH.authorize().then( res => {
					this.getUserApiInfo()
					this.checkScoreSign()
					this.getOrderStatistics()
					this.setData({
						loaded: true
					})
				})
			}
		})
		this.setData({
			version: CONFIG.version
		})
		//更新订单状态
	},
	// logout(){
	// 	WXAPI.loginout(wx.getStorageSync('token')).then( res => {
	// 		if(res.code == 0){
	// 			wx.removeStorageSync('token')
	// 		}
	// 	})
	// },
	updateUserInfo(e) {
	  wx.getUserProfile({
	    lang: 'zh_CN',
	    desc: '用于完善会员资料',
	    success: res => {
	      this._updateUserInfo(res.userInfo)
	    },
	    fail: err => {
	      wx.showToast({
	        title: err.errMsg,
	        icon: 'none'
	      })
	    }
	  })
	},
	async _updateUserInfo(userInfo) {
	  const postData = {
	    token: wx.getStorageSync('token'),
	    nick: userInfo.nickName,
	    avatarUrl: userInfo.avatarUrl,
	    city: userInfo.city,
	    province: userInfo.province,
	    gender: userInfo.gender,
	  }
	  const res = await WXAPI.modifyUserInfo(postData)
	  if (res.code != 0) {
	    wx.showToast({
	      title: res.msg,
	      icon: 'none'
	    })
	    return
	  }
	  wx.showToast({
	    title: '登陆成功',
	  })
	  this.getUserApiInfo()
	},
	async getUserApiInfo() {
		const res = await WXAPI.userDetail(wx.getStorageSync('token'))
		let _data = {}
		if (res.data.base.nick && res.data.base.avatarUrl) {
		  _data.userInfoStatus = 2
		} else {
		  _data.userInfoStatus = 1
		}
		this.setData(_data)
	},
	getUserAmount: function() {
		WXAPI.userAmount(wx.getStorageSync('token')).then(res => {
			if (res.code == 0) {
				this.setData({
					balance: res.data.balance,
					freeze: res.data.freeze,
					score: res.data.score
				});
			}
		})
	},
	checkScoreSign: function() {
		WXAPI.scoreTodaySignedInfo(wx.getStorageSync('token')).then(res => {
			if (res.code == 0) {
				this.setData({
					score_sign_continuous: res.data.continuous
				});
			}
		})
	},
	getOrderStatistics() {
		WXAPI.orderStatistics(wx.getStorageSync('token')).then(res => {
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
	getNoticeList() {
		WXAPI.noticeList({
			type: 'notice'
		}).then(res => {
			if (res.code == 0) {
				this.setData({
					noticeList: res.data
				});
			}
		})
	},
	score: function() {
		wx.navigateTo({
			url: "/pages/sign/index"
		})
	},
	navigateToPage(e) {
		wx.navigateTo({
			url: e.currentTarget.dataset.url
		})
	}
})
