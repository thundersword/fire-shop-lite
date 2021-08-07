const WXAPI = require('apifm-wxapi')
const CONFIG = require('../../config.js')
const TOOLS = require('../../utils/tools.js')

//获取应用实例
var app = getApp()
Page({
	data: {
		inputVal: "", // 搜索框内容
		goodsRecommend: [], // 推荐商品
		kanjiaList: [], //砍价商品列表
		pingtuanList: [], //拼团商品列表
		loadingHidden: false, // loading
		selectCurrent: 0,
		categories: [],
		activeCategoryId: 0,
		goods: [],
		scrollTop: 0,
		loadingMoreHidden: true,
		coupons: [],
		curPage: 1,
		pageSize: 10,
		cateScrollTop: 0,
		dotStyle: "square-dot", //swiper指示点样式可选square-dot round-dot
		navigation: [],
		banners: [],
		disableSearchJump: true,
		aliveRooms: []
	},
	tapNav(e) {
		const url = e.currentTarget.dataset.url
		wx.navigateTo({
			url: url
		})
	},
	tabClick: function(e) {
		wx.navigateTo({
			url: '/pages/goods/list?categoryId=' + e.currentTarget.id,
		})
	},
	toDetailsTap: function(e) {
		wx.navigateTo({
			url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
		})
	},
	tapBanner: function(e) {
		console.log(e)
		wx.navigateTo({
			url: e.currentTarget.dataset.url
		})
		// if (e.currentTarget.dataset.id != 0) {
		// 	wx.navigateTo({
		// 		url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
		// 	})
		// }
	},
	bindTypeTap: function(e) {
		this.setData({
			selectCurrent: e.index
		})
	},
	async wxaMpLiveRooms() {
		const res = await WXAPI.wxaMpLiveRooms()
		if (res.code == 0 && res.data.length > 0) {
			this.setData({
				aliveRooms: res.data
			})
		}
	},
	onLoad: function(e) {
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		})
		// const that = this
		// if (e && e.query && e.query.inviter_id) { 
		//   wx.setStorageSync('referrer', e.query.inviter_id)
		// }
		if (e && e.scene) {
			const scene = decodeURIComponent(e.scene)
			if (scene) {
				wx.setStorageSync('referrer', scene.substring(11))
			}
		}

		this.initPage()
		// this.categories()
		// that.getCoupons()
		// that.getNotice()
		this.wxaMpLiveRooms()
	},
	async initPage() {
		wx.showLoading();
		//获取轮播
		const bannerRes = await WXAPI.banners({
			type: 'home'
		})
		if (bannerRes.code == 700) {
			console.log('请在后台添加 banner 轮播图片，自定义类型填写 index')
		} else {
			this.setData({
				banners: bannerRes.data
			});
		}
		//banner下导航
		const navRes = await WXAPI.banners({
			type: 'navigation'
		})
		if (navRes.code == 700) {
			console.log('请在后台banner管理中导航图标，自定义类型填写 navigation')
		} else {
			this.setData({
				navigation: navRes.data
			});
		}
		const hotRes = await WXAPI.banners({
			type: 'hot'
		})
		if (hotRes.code == 700) {
			console.log('请在后台banner管理中导航图标，自定义类型填写 navigation')
		} else {
			this.setData({
				hot: hotRes.data
			});
		}

		const configRes = await WXAPI.queryConfigValue('recommendGoodsTitle')
		if (configRes.code == 700) {
			console.log('请在后台系统参数设置中设置推荐商品标题,参数值为前端显示的标题')
		} else {
			this.setData({
				recommendGoodsTitle: configRes.data
			});
		}
		this.kanjiaGoods()
		this.pingtuanGoods()
		this.getRecommendGoodsList()
		wx.hideLoading()
	},
	onShow: function(e) {
		app.fadeInOut(this, 'fadeAni', 0);
		// 获取购物车数据，显示TabBarBadge
		TOOLS.showTabBarBadge();
	},
	async categories() {
		const res = await WXAPI.goodsCategory()
		let categories = [];
		if (res.code == 0) {
			const _categories = res.data.filter(ele => {
				return ele.level == 1
			})
			categories = categories.concat(_categories)
		}
		this.setData({
			categories: categories,
			activeCategoryId: 0,
			curPage: 1
		});
		this.getGoodsList(0);
	},
	onPageScroll(e) {
		let scrollTop = this.data.scrollTop
		this.setData({
			scrollTop: e.scrollTop
		})
		if (e.scrollTop >= 180) {
			wx.setNavigationBarColor({
				frontColor: '#000000',
				backgroundColor: '#ffffff'
			})
			app.fadeInOut(this, 'fadeAni', 1)
			this.setData({
				disableSearchJump: false
			})
		} else {
			wx.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#ffffff'
			})
			app.fadeInOut(this, 'fadeAni', 0)
			this.setData({
				disableSearchJump: true //隐藏自定义导航栏时点击到搜索框区域时不跳转搜索页面
			})
		}
	},

	async getRecommendGoodsList(append) {
		const res = await WXAPI.goods({
			recommendStatus: 1,
			pageSize: this.data.pageSize,
			page: this.data.curPage
		})
		if (res.code == 404 || res.code == 700) {
			let newData = {
				loadingMoreHidden: false
			}
			if (!append) {
				newData.goodsRecommend = []
			}
			this.setData(newData);
			return
		}
		let goods = []
		if (append) {
			goods = this.data.goodsRecommend
		}
		for (let i = 0; i < res.data.length; i++) {
			goods.push(res.data[i]);
		}
		this.setData({
			loadingMoreHidden: true,
			goodsRecommend: goods
		});
	},
	async getGoodsList(categoryId, append) {
		if (categoryId == 0) {
			categoryId = "";
		}
		wx.showLoading({
			"mask": true
		})
		const res = await WXAPI.goods({
			categoryId: categoryId,
			nameLike: this.data.inputVal,
			page: this.data.curPage,
			pageSize: this.data.pageSize
		})
		wx.hideLoading()
		if (res.code == 404 || res.code == 700) {
			let newData = {
				loadingMoreHidden: false
			}
			if (!append) {
				newData.goods = []
			}
			this.setData(newData);
			return
		}
		let goods = [];
		if (append) {
			goods = this.data.goods
		}
		for (var i = 0; i < res.data.length; i++) {
			goods.push(res.data[i]);
		}
		this.setData({
			loadingMoreHidden: true,
			goods: goods,
		});
	},
	getCoupons: function() {
		var that = this;
		WXAPI.coupons().then(function(res) {
			if (res.code == 0) {
				that.setData({
					coupons: res.data
				});
			}
		})
	},
	onShareAppMessage: function() {
		return {
			title: '"' + wx.getStorageSync('mallName') + '" ' + CONFIG.shareProfile,
			path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
		}
	},
	//转发到朋友圈
	onShareTimeline: function() {
		return {
			title: '"' + wx.getStorageSync('mallName') + '" ' + CONFIG.shareProfile,
			query: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
		}
	},
	getNotice: function() {
		var that = this;
		WXAPI.noticeList({
			pageSize: 5
		}).then(function(res) {
			if (res.code == 0) {
				that.setData({
					noticeList: res.data
				});
			}
		})
	},
	onReachBottom: function() {
		this.setData({
			curPage: this.data.curPage + 1
		});
		this.getRecommendGoodsList(true)
	},
	onPullDownRefresh: function() {
		this.setData({
			curPage: 1
		});
		this.initPage()
		wx.stopPullDownRefresh()
	},
	// 获取砍价商品
	async kanjiaGoods() {
		const res = await WXAPI.goods({
			kanjia: true
		});
		if (res.code == 0) {
			this.setData({
				kanjiaList: res.data
			})
		}
	},
	goCoupons: function(e) {
		wx.navigateTo({
			url: "/pages/coupons/index"
		})
	},
	pingtuanGoods() { // 获取团购商品列表
		const _this = this
		WXAPI.goods({
			pingtuan: true
		}).then(res => {
			if (res.code === 0) {
				_this.setData({
					pingtuanList: res.data
				})
			}
		})
	},
	bindinput(e) {
		this.setData({
			inputVal: e.detail.value
		})
	},
	bindconfirm(e) {
		this.setData({
			inputVal: e.detail.value
		})
		wx.navigateTo({
			url: '/pages/goods/list?name=' + this.data.inputVal,
		})
	},
	onShareAppMessage: function() {
		return {
			title: '"' + wx.getStorageSync('mallName') + '" ' + CONFIG.shareProfile,
			path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
		}
	},
})
