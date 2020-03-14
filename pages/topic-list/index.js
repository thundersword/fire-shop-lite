const app = getApp()
const WXAPI = require('apifm-wxapi')
Page({
	data: {

	},
	tapContents: function(e) {
		wx.navigateTo({
			url: "/pages/topic/index?id=" + e.currentTarget.dataset.id
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
					activecategoryId: res.data[0].id
				});

			}
			this.gettapList(res.data[0].id)
		})

	},
	tapTopic: function(e) {
		this.setData({
			activecategoryId: e.currentTarget.dataset.id
		});
		this.gettapList(this.data.activecategoryId);
	},
	gettapList: function(categoryId) {
		WXAPI.cmsArticles({
			categoryId: categoryId
		}).then(res => {
			let content = [];
			if (res.code == 0) {
				for (let i = 0; i < res.data.length; i++) {
					if (res.data[i].categoryId == categoryId) {
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
