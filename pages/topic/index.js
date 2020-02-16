const WxParse = require('../../wxParse/wxParse.js');
const app = getApp()
const WXAPI = require('apifm-wxapi')

Page({
	data: {
		relatedGoods:''
	},

	toDetailsTap: function(e) {
		wx.navigateTo({
			url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
		})
	},
	onLoad: function(e) {
		if (app.globalData.iphone == true) {
			this.setData({
				iphone: 'iphone'
			})
		}
		let topictitle = this.data.topictitle;
		WXAPI.cmsArticleDetail(e.id).then( res => {
			if (res.code == 0) {
				this.setData({
					topics: res.data,
					topictitle: res.data.title
				});
				wx.setNavigationBarTitle({
					title:res.data.title
				})
				
				WxParse.wxParse('article', 'html', res.data.content, this, 5);
				
				if(res.data.extInfo && res.data.extInfo.relatedGoods){
					this.setData({
						relatedGoods: res.data.extInfo.relatedGoods
					})
				}
			}
		})
	},
	onShareAppMessage: function(e) {
		return {
			title: this.data.topictitle,
			path: 'pages/topic/topic?id=' + this.data.topid,
			success: function(res) {
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		}
	},


})
