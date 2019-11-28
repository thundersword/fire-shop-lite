//获取应用实例
var app = getApp();
const WXAPI = require('apifm-wxapi')
function countdown(that) {
	var second = that.data.second;
	var home = that.data.home;
	if (home == 0) {
		if (second == 0) {
			wx.switchTab({
				url: '../index/index'
			})
		}
	}
	var time = setTimeout(function() {
		that.setData({
			second: second - 1
		});
		countdown(that);
	}, 1000)

}
Page({
	data: {
		second: 6,
		home: 0
	},

	goHome: function() {
		this.setData({
			home: 1
		});
		wx.switchTab({
			url: '../index/index'
		})
	},
	tapBanner: function(e) {
		if (e.currentTarget.dataset.id != 0) {
			this.setData({
				home: 1
			});
			wx.redirectTo({
				url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id + '&share=1'
			})
		}
	},
	onLoad: function() {
		WXAPI.banners({
			key: 'mallName',
			type: 'start'
		}).then( res => {
			if(res.code == 0){
				this.setData({
					sales:res.data
				})
				countdown(this);
			}else{
				this.goHome()
			}
		})
	}
});
