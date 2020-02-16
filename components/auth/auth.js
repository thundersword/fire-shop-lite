const app = getApp();
const WXAPI = require('apifm-wxapi')
Component({
	options: {
	  addGlobalClass: true
	},
	properties: {
		isHidden: {
			type: Boolean,
			value: true,
		}
	},
	lifetimes: {
		attached() {
			this.checkToken()
			const that = this
			wx.getStorage({
				key: 'logo',
				success(res) {
					that.setData({
						logo: res.data
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
					this.triggerEvent('afterAuth', token)
				}
			})
			return true;
		},
		close() {
			this.setData({
				isHidden: true,
			})
			this.triggerEvent('closeAuth')
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
							title: '登录成功',
							icon: 'success'
						})
						app.globalData.token = token
						this.triggerEvent('afterAuth', token)
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
							title: '登录成功',
							icon: 'success'
						})
						wx.setStorageSync('token', res.data.token)
						wx.setStorageSync('uid', res.data.uid)
						// 回到原来的地方放
						app.globalData.token = res.data.token
						that.triggerEvent('afterAuth', res.data.token)
					})
				}
			})
		},
		registerUser: function() {
			let that = this;
			wx.login({
				success: function(res) {
					let code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
					wx.getUserInfo({
						success: function(res) {
							let iv = res.iv;
							let encryptedData = res.encryptedData;
							let referrer = '' // 推荐人
							let referrer_storge = wx.getStorageSync('referrer');
							if (referrer_storge) {
								referrer = referrer_storge;
							}
							// 下面开始调用注册接口
							WXAPI.register_complex({
								code: code,
								encryptedData: encryptedData,
								iv: iv,
								referrer: referrer
							}).then(function(res) {
								wx.hideLoading();
								that.login();
							})
						}
					})
				}
			})
		}
	}
})
