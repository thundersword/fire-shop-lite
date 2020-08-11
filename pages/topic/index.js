const WxParse = require('../../wxParse/wxParse.js');
const app = getApp()
const WXAPI = require('apifm-wxapi')

Page({
	data: {
		relatedGoods:'',
		topic:null,
		topicTitle:null
	},

	toDetailsTap: function(e) {
		wx.navigateTo({
			url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
		})
	},
	onLoad: function(e) {
		WXAPI.cmsArticleDetail(e.id).then( res => {
			if (res.code == 0) {
				this.setData({
					topic: res.data,
					topicTitle: res.data.title
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
			title: this.data.topicTitle,
			path: 'pages/topic/index?id=' + this.data.topic.id,
			imageUrl: this.data.topic.pic,
			success: function(res) {
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		}
	},


})
