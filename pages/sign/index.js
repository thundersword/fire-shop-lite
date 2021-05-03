const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
Page({
	data: {
		score: 0, //积分
		scoreSignContinuous: 0, //连续签到次数
		isSigned: false, //今天是否已签到
		wxlogin: true, //是否隐藏登录弹窗
	},

	onShow() {
		AUTH.checkHasLogined().then(isLogined => {
			this.setData({
				wxlogin: isLogined
			})
			if(isLogined){
				this.afterAuth()
			}
		})
	},
	showAuth() {
		this.setData({
			isHidden: false
		})
	},
	afterAuth() {
		this.setData({
			isHidden: true
		})
		this.checkScoreSign();
		this.getUserScore();
		this.doneShow()
	},
	doneShow: function() {
		setTimeout(() => {
			this.calendar.jump()
		}, 1000)
		WXAPI.scoreSignLogs({
			token: wx.getStorageSync('token')
		}).then(res => {
			if (res.code == 0) {
				res.data.result.forEach(ele => {
					const _data = ele.dateAdd.split(" ")[0]
					this.calendar.setTodoLabels({
						pos: 'bottom',
						dotColor: '#40',
						days: [{
							year: parseInt(_data.split("-")[0]),
							month: parseInt(_data.split("-")[1]),
							day: parseInt(_data.split("-")[2]),
							todoText: '已签到'
						}],
					});
				})
			}
		})
	},
	afterTapDay(e) {
		//已签到的直接返回
		if (this.data.isSigned) {
			wx.showToast({
				title: '今天已签到',
				icon: 'none'
			})
			return
		}
		
		// 不是今天，直接 return 
		const myDate = new Date();
		// console.log('y:', myDate.getFullYear())
		// console.log('m:', myDate.getMonth() + 1)
		// console.log('d:', myDate.getDate())
		if (myDate.getFullYear() != e.detail.year ||
			(myDate.getMonth() + 1) != e.detail.month ||
			myDate.getDate() != e.detail.day) {
			return
		}
		if (e.detail.showTodoLabel) {
			wx.showToast({
				title: '今天已签到',
				icon: 'none'
			})
			return
		}
		
		if(this.data.isSigned){
			wx.showToast({
				title: '今天已签到',
				icon: 'none'
			})
			return 
		}
		
		WXAPI.scoreSign(wx.getStorageSync('token')).then(r => {
			wx.showToast({
				title: '签到成功',
				icon: 'none'
			})
			this.setData({
				isSigned:true
			})
			this.calendar.setTodoLabels({
				pos: 'bottom',
				dotColor: '#40',
				days: [{
					year: e.detail.year,
					month: e.detail.month,
					day: e.detail.day,
					todoText: '已签到'
				}],
			});
		})
	},
	//签到按钮
	scoreSign: function() {
		WXAPI.scoreSign(wx.getStorageSync('token')).then(res => {
			if (res.code == 0) {
				//设置签到标签
				// this.onLoad();
				this.checkScoreSign();
				this.getUserScore();
				this.doneShow()
			}
			wx.showToast({
				title: '签到成功',
				icon: 'success',
				duration: 2000
			})
		})
	},
	checkScoreSign: function() {
		WXAPI.scoreTodaySignedInfo(wx.getStorageSync('token')).then(res => {
			console.log(res)
			if (res.code == 0) {
				this.setData({
					isSigned: true,
					scoreSignContinuous: res.data.continuous
				});
			}
		})
	},
	getUserScore() {
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
	onLoad: function() {
		//获取签到规则
		WXAPI.scoreSignRules().then(res => {
			if (res.code == 0) {
				this.setData({
					rules: res.data
				});
			}
		})
	},
})
