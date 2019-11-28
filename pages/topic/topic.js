const WxParse = require('../../wxParse/wxParse.js');
const app = getApp()
const WXAPI = require('apifm-wxapi')

Page({
	data: {},

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
				let kb = res.data.keywords;
				let kbarr = kb.split(',');
				this.setData({
					topics: res.data,
					topictitle: res.data.title
				});
				let goods = [];
				for (let i = 0; i < kbarr.length; i++) {
					WXAPI.goodsDetail(kbarr[i]).then( res => {
						if (res.code == 0) {
							goods.push(res.data.basicInfo);
						}
						this.setData({
							goods: goods,
							topid: e.id
						});
					})
				}
				WxParse.wxParse('article', 'html', res.data.content, this, 5);
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
