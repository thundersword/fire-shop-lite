//index.js
const app = getApp()
const WXAPI = require('apifm-wxapi')
Page({
	data: {
		indicatorDots: true,
		autoplay: true,
		interval: 8000,
		duration: 800,
		swiperCurrent: 0,
		selectCurrent: 0,
		activeCategoryId: 0,
		loadingMoreHidden: true,
		search: true,
		nonehidden: true,
		searchidden: true
	},

	tabClick: function(e) {
		this.setData({
			activeCategoryId: e.currentTarget.id
		});
		this.getGoodsList(this.data.activeCategoryId);
	},
	levelClick: function(e) {
		wx.navigateTo({
			url: "/pages/cate-list/cate-list?id=" + e.currentTarget.dataset.id
		})
	},
	swiperchange: function(e) {
		//console.log(e.detail.current)
		this.setData({
			swiperCurrent: e.detail.current
		})
	},

	searchfocus: function() {
		this.setData({
			search: false,
			searchinput: true
		})
	},
	searchclose: function() {
		this.setData({
			search: true,
			searchinput: false
		})
	},
	onLoad: function() {
		wx.showLoading();
		var that = this;
		wx.getSystemInfo({
			success: function(res) {
				if (res.model.search('iPhone X') != -1) {
					that.setData({
						iphone: "iphoneTop",
						iponesc: "iphonesearch"
					});
				}
			}
		})
		//获取轮播
		WXAPI.banners({
			key: 'mallName',
			type: 'goods'
		}).then(res => {
			if (res.code == 0) {
				that.setData({
					banners: res.data
				});
			}
		})
		WXAPI.goodsCategory().then(res => {
			let categories = [{
				id: 0,
				name: "所有分类"
			}];
			if (res.code == 0) {
				wx.hideLoading();
				for (let i = 0; i < res.data.length; i++) {
					if (res.data[i].level == 1) {
						categories.push(res.data[i]);
					}
				}
			} //
			that.setData({
				categories: categories,
				activeCategoryId: 0
			});
			that.getGoodsList(0);
		})
	},
	getGoodsList: function(categoryId) {
		if (categoryId == 0) {
			categoryId = "";
		}
		const that = this;
		WXAPI.goodsCategory().then(res => {
			let categorieslist = [];
			if (res.code == 0) {
				for (let i = 0; i < res.data.length; i++) {
					if (categoryId != '') {
						if (res.data[i].pid == categoryId) {
							categorieslist.push(res.data[i]);
						}
					} else {
						//categorieslist.push(res.data.data[i]);
						if (res.data[i].pid != 0) {
							categorieslist.push(res.data[i]);
						}
					}
				}
			} //
			that.setData({
				categorieslist: categorieslist,
			});
		})
	},
	toDetailsTap: function(e) {
		wx.navigateTo({
			url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
		})
		this.setData({
			search: true,
			searchinput: false
		})
	},
	onShow: function() {
		var that = this;
		wx.getStorage({
			key: 'shopCarInfo',
			success: function(res) {
				if (res.data) {
					that.data.shopCarInfo = res.data
					if (res.data.shopNum > 0) {
						wx.setTabBarBadge({
							index: 2,
							text: '' + res.data.shopNum + ''
						})
					} else {
						wx.removeTabBarBadge({
							index: 2,
						})
					}
				} else {
					wx.removeTabBarBadge({
						index: 2,
					})
				}
			}
		})
	},

})
