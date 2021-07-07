//index.js
//获取应用实例
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
Page({
	data: {
		wxlogin: true
	},
	afterAuth(e) {
		this.setData({
			wxlogin: true
		})
		this.getList()
	},
	closeAuth(){
		wx.navigateBack()
	},
	getList() {
		WXAPI.goodsFavList({
			token: wx.getStorageSync('token')
		}).then(res => {
			if (res.code == 0) {
				this.setData({
					favList: res.data,
					loadingMoreHidden: true
				});
			} else if (res.code == 404) {
				this.setData({
					favList: null,
					loadingMoreHidden: false
				});
			}
		})
	},
	onShow: function() {
		AUTH.checkHasLogined().then( isLogined =>{
			if(isLogined){
				this.getList()
			}else{
				AUTH.authorize().then( res => {
					this.getList()
				})
			}
		})
	}
})
