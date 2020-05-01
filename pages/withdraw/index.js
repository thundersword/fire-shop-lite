const app = getApp()
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
Page({
	data: {
		balance: 0,
		wxlogin: true, //是否隐藏登录弹窗
        minWithdrawAmount: 100, //最低提现金额
	},

	onLoad: function() {
        const that = this;
        WXAPI.queryConfigValue('minWithdrawAmount').then(res=>{
            if(res.code == 0) {
                that.setData({
                    minWithdrawAmount: res.data,
                })
            }
        })

	},
	afterAuth() {
		this.setData({
			wxlogin: true
		})
		this.getUserBalance()
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
	onShow: function() {
		AUTH.checkHasLogined( isLogined => {
			if(!isLogined){
				this.setData({
					wxlogin: false
				})
			}
		})
	},
	bindCancel: function() {
		wx.navigateBack({})
	},
	bindSave: function(e) {

		var that = this;
		var amount = e.detail.value.amount;

		if (amount == "") {
			wx.showModal({
				title: '错误',
				content: '提现金额不能为空',
				showCancel: false
			})
			return
		}
        console.log("最低提现金额", that.data.minWithdrawAmount)

        if (amount * 1 < that.data.minWithdrawAmount) {
            var msg = "低于" + that.data.minWithdrawAmount + "无法提现";
			wx.showModal({
				title: '错误',
				content: msg,
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
