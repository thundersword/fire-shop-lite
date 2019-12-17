//index.js
const app = getApp()
const WXAPI = require('apifm-wxapi')
Page({
	data: {
		indicatorDots: true,
		autoplay: true,
		interval: 6000,
		duration: 800,
		swiperCurrent: 0,
		iphone: false,
		loadingHidden: false, // loading
		wxlogin: true,
		loadingMoreHidden: true,
		showSearch: true,
		banners: [],
		sales: [],
		hot: []
	},
	//事件处理函数
	onShow() {
		app.fadeInOut(this, 'fadeAni', 0)
		app.setShopCartBadge()
	},
	onLoad: function() {
		//首页幻灯片
		WXAPI.banners({
			type: 'home'
		}).then(res => {
			if (res.code == 0) {
				this.setData({
					banners: res.data
				})
			}
		})
		//4个功能展示位
		WXAPI.banners({
			key: 'mallName',
			type: 'sale'
		}).then(res => {
			if (res.code == 0) {
				this.setData({
					sales: res.data
				})
			}
		})
		//4个热销广告位
		WXAPI.banners({
			type: 'hot'
		}).then(res => {
			if (res.code == 0) {
				this.setData({
					hot: res.data
				})
			}
		})
		////获取推荐商品信息
		WXAPI.queryConfigValue('topgoods').then(res => {
			if (res.code == 0) {
				this.setData({
					topgoods: res.data
				});
				WXAPI.goods({
					recommendStatus: 1,
					pageSize: 10
				}).then(res => {
					this.setData({
						goods: [],
						loadingMoreHidden: true
					});
					var goods = [];
					if (res.code != 0 || res.data.length == 0) {
						this.setData({
							loadingMoreHidden: false,
						});
						return;
					}
					for (var i = 0; i < res.data.length; i++) {
						goods.push(res.data[i]);
					}
					this.setData({
						goods: goods,
					});
				})
			}
		})
	},
	swiperchange: function(e) {
		this.setData({
			swiperCurrent: e.detail.current
		})
	},
	onPageScroll: function(t) {
		if (t.scrollTop >= 180) {
			wx.setNavigationBarColor({
				frontColor: '#000000',
				backgroundColor: '#ffffff'
			})
			app.fadeInOut(this, 'fadeAni', 1)
		} else {
			wx.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#ffffff'
			})
			app.fadeInOut(this, 'fadeAni', 0)
		}
	},
	tapBanner: function(e) {
		if (e.currentTarget.dataset.id != 0) {
			wx.navigateTo({
				url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
			})
		}
	},
	tapSales: function(e) {
		if (e.currentTarget.dataset.id != 0) {
			wx.navigateTo({
				url: e.currentTarget.dataset.id
			})
		}
	},
})
