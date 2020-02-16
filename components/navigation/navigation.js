const app = getApp();
Component({
	properties: {
		//小程序页面的表头
		title: {
			type: String,
			value: 'fire-shop-lite'
		},
		//是否展示返回和主页按钮
		showIcon: {
			type: Boolean,
			value: false
		},
		//是否显示标题
		showTitle: {
			type: Boolean,
			value: false
		},
		//是否显示搜索框
		showSearch: {
			type: Boolean,
			value: false
		},
		disableSearchJump:{
			type: Boolean,
			value: false
		}
	},

	data: {
		statusBarHeight: 0,
		titleBarHeight: 0,
	},
	lifetimes: {
		attached: function() {
			// 因为很多地方都需要用到，所有保存到全局对象中
			if (app.globalData && app.globalData.statusBarHeight && app.globalData.titleBarHeight) {
				this.setData({
					statusBarHeight: app.globalData.statusBarHeight,
					titleBarHeight: app.globalData.titleBarHeight
				});
			} else {
				let that = this
				wx.getSystemInfo({
					success: function(res) {
						if (!app.globalData) {
							app.globalData = {}
						}
						if (res.model.indexOf('iPhone') !== -1) {
							app.globalData.titleBarHeight = 44 + res.statusBarHeight
						} else {
							app.globalData.titleBarHeight = 48 + res.statusBarHeight
						}
						app.globalData.statusBarHeight = res.statusBarHeight
						that.setData({
							statusBarHeight: app.globalData.statusBarHeight,
							titleBarHeight: app.globalData.titleBarHeight
						});
					},
					failure() {
						that.setData({
							statusBarHeight: 0,
							titleBarHeight: 0
						});
					}
				})
			}
		},
	},
	ready: function() {

	},

	methods: {
		headerBack() {
			wx.navigateBack({
				delta: 1,
				fail(e) {
					wx.switchTab({
						url: '/pages/index/index'
					})
				}
			})
		},
		headerHome() {
			wx.switchTab({
				url: '/pages/index/index'
			})
		},
		headerSearch() {
			if(this.properties.disableSearchJump) return
			wx.navigateTo({
				url: '/pages/search/index'
			})
		}
	}
})
