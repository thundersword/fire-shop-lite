const app = getApp();
const WXAPI = require('apifm-wxapi')
Component({
	properties: {
		isHidden: {
			type: Boolean,
			value: true,
		}
	},
	lifetimes:{
		attached(){
			this.checkToken()
			const that = this
			wx.getStorage({
				key:'logo',
				success(res) {
					that.setData({
						logo:res.data
					})
				}
			})
			
		}
	},
	methods: {
		checkToken() {
			const token = wx.getStorageSync('token');
			if (!token) return false
			WXAPI.checkToken(token).then(res => {
				if (res.code != 0) {
					wx.removeStorageSync('token')
					this.login();
				} else {
					// wx.showToast({
					// 	title:'登录成功',
					// 	icon:'success'
					// })
					app.globalData.token = token
					this.triggerEvent('afterAuth',token)
				}
			})
			return true;
		},
		close(){
			this.setData({
				isHidden:true,
			})
		},
		bindGetUserInfo(e) {
			if (!e.detail.userInfo) {
				return;
			}
			if (app.globalData.isConnected) {
				wx.setStorageSync('userInfo', e.detail.userInfo)
				this.login();
			} else {
				wx.showToast({
					title: '当前无网络',
					icon: 'none',
				})
			}
		},
		login() {
			const that = this;
			const token = wx.getStorageSync('token');
			if (token) {
				WXAPI.checkToken(token).then(res => {
					if (res.code != 0) {
						wx.removeStorageSync('token')
						this.login();
					} else {
						wx.showToast({
							title:'登录成功',
							icon:'success'
						})
						app.globalData.token = token
						this.triggerEvent('afterAuth',token)
					}
				})
				return;
			}
			wx.login({
				success(res) {
					WXAPI.login_wx(res.code).then(res => {
						if (res.code == 10000) {
							// 去注册
							that.registerUser();
							return;
						}
						if (res.code != 0) {
							// 登录错误
							wx.hideLoading();
							wx.showModal({
								title: '提示',
								content: '无法登录，请重试',
								showCancel: false
							})
							return;
						}
						wx.showToast({
							title:'登录成功',
							icon:'success'
						})
						wx.setStorageSync('token', res.data.token)
						wx.setStorageSync('uid', res.data.uid)
						// 回到原来的地方放
						app.globalData.token = res.data.token
						that.triggerEvent('afterAuth',res.data.token)
					})
				}
			})
		},
	}
})
