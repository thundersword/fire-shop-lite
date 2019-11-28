const app = getApp()
const WXAPI = require('apifm-wxapi')
Page({
	data: {

	},
	tapContents: function(e) {
		wx.navigateTo({
			url: "/pages/topic/topic?id=" + e.currentTarget.dataset.id
		})
	},
	onLoad: function() {
		if (app.globalData.iphone == true) {
			this.setData({
				iphone: 'iphone'
			})
		}
		WXAPI.cmsCategories().then(res => {
			//console.log(res.data.data[0].id)
			let topic = []
			if (res.code == 0) {
				for (let i = 0; i < res.data.length; i++) {
					topic.push(res.data[i]);
				}
				this.setData({
					topics: topic,
					activecmsid: res.data[0].id
				});

			}
			this.gettapList(res.data[0].id)
		})

	},
	tapTopic: function(e) {
		this.setData({
			activecmsid: e.currentTarget.dataset.id
		});
		this.gettapList(this.data.activecmsid);
	},
	gettapList: function(cmsid) {
		WXAPI.cmsArticles().then(res => {
			let content = [];
			if (res.code == 0) {
				for (let i = 0; i < res.data.length; i++) {
					if (res.data[i].categoryId == cmsid) {
						content.push(res.data[i]);
					}
				}
			}
			this.setData({
				contents: content
			});
		})
	}

})
