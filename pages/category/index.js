//index.js
const app = getApp();
const WXAPI = require('apifm-wxapi');
const CONFIG = require('../../config.js');
const AUTH = require('../../utils/auth.js');
const TOOLS = require('../../utils/tools.js')
Page({
	data: {
		indicatorDots: true,
		autoplay: true,
		interval: 8000,
		duration: 800,
		swiperCurrent: 0,
		selectCurrent: 0,
		activeCategoryId: 0,
		activeCategoryIndex: 0,
		loadingMoreHidden: true,
		search: true,
		nonehidden: true,
		searchidden: true,
		categoryLevel: 2,
		rightList: {},
		skuCurGoods: undefined
	},

	tabClick: function(e) {
		this.setData({
			activeCategoryId: e.currentTarget.id,
			activeCategoryIndex:e.currentTarget.dataset.index
		});
		this.getRightList(this.data.activeCategoryId)
	},
	getRightList(pid) {
		if (this.data.categoryLevel == 1) {
			this.getGoodsList()
		} else {
			this.getSubCate(pid)
		}
	},
	async getSubCate(pid) {
		wx.showLoading()
		const cateRes = await WXAPI.goodsCategory();
		let cateData = {}
		let cateIndex = 0
		if (cateRes.code == 0) {
			const data = cateRes.data;
			//获取一级分类
			data.forEach((item, index) => {

				let parentCateName, id

				if ((item.level == 1 && item.pid == pid) || (pid != 0 && item.id == pid && item.level == 1)) {
					parentCateName = item.name,
						id = item.id
					let list = []
					for (let i = 0; i < data.length; i++) {
						if (data[i].pid == item.id) {
							list.push(data[i])
						}
					}
					cateData[cateIndex] = {
						parentCateName: parentCateName,
						id: pid,
						list: list
					}

					cateIndex++;
				}
			})

			this.setData({
				rightList: cateData
			})

		}
		wx.hideLoading()
	},
	levelClick: function(e) {
		wx.navigateTo({
			url: "/pages/goods/list?categoryId=" + e.currentTarget.dataset.id
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

		this.setData({
			categoryLevel:wx.getStorageSync('categoryLevel')
		})
		//获取轮播
		WXAPI.banners({
			key: 'mallName',
			type: 'goods'
		}).then(res => {
			if (res.code == 0) {
				this.setData({
					banners: res.data
				});
			}
		})
		WXAPI.goodsCategory().then(res => {
			let categories = []
			if (this.data.categoryLevel == 2) {
				categories.push({
					id: 0,
					name: "所有分类"
				})
			}

			if (res.code == 0) {
				for (let i = 0; i < res.data.length; i++) {
					if (res.data[i].level == 1) {
						categories.push(res.data[i]);
					}
				}
			} //
			this.setData({
				categories: categories,
				activeCategoryId: categories[0].id
			});
			this.getRightList(this.data.activeCategoryId)
		})
	},
	async getGoodsList() {
		wx.showLoading({
			title: '加载中',
		})
		
		//是否启用tags分类
		const categoryByTags = wx.getStorageSync('CATEGORY_BY_TAGS');
		
		let res = {}
		if(categoryByTags == 1){
			res = await WXAPI.goods({
				tagsLike:this.data.categories[this.data.activeCategoryIndex].name,
				page:1,
				pageSize: 100000
			})
		}else{
			res = await WXAPI.goods({
				categoryId: this.data.activeCategoryId,
				page: 1,
				pageSize: 100000
			})
		}
		
		
		wx.hideLoading()
		if (res.code == 700) {
			this.setData({
				currentGoods: null
			});
			return
		}
		this.setData({
			currentGoods: res.data
		});
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
	async addShopCar(e) {
		const curGood = this.data.currentGoods.find(ele => {
			return ele.id == e.currentTarget.dataset.id
		})
		if (!curGood) {
			return
		}
		if (curGood.stores <= 0) {
			wx.showToast({
				title: '已售罄~',
				icon: 'none'
			})
			return
		}
		this.addShopCarCheck({
			goodsId: curGood.id,
			buyNumber: 1,
			sku: []
		})
	},
	async addShopCarCheck(options) {
		AUTH.checkHasLogined().then(isLogined => {
			this.setData({
				wxlogin: isLogined
			})
			if (isLogined) {
				// 处理加入购物车的业务逻辑
				this.addShopCarDone(options)
			}
		})
	},
	async addShopCarDone(options) {
		const res = await WXAPI.shippingCarInfoAddItem(wx.getStorageSync('token'), options.goodsId, options.buyNumber,
			options.sku)
		if (res.code == 30002) {
			// 需要选择规格尺寸
			const skuCurGoodsRes = await WXAPI.goodsDetail(options.goodsId)
			if (skuCurGoodsRes.code != 0) {
				wx.showToast({
					title: skuCurGoodsRes.msg,
					icon: 'none'
				})
				return
			}
			wx.hideTabBar()
			const skuCurGoods = skuCurGoodsRes.data
			skuCurGoods.basicInfo.storesBuy = 1
			this.setData({
				skuCurGoods
			})
			return
		}
		if (res.code != 0) {
			wx.showToast({
				title: res.msg,
				icon: 'none'
			})
			return
		}
		wx.showToast({
			title: '加入成功',
			icon: 'success'
		})
		this.setData({
			skuCurGoods: null
		})
		wx.showTabBar()
		TOOLS.showTabBarBadge() // 获取购物车数据，显示TabBarBadge
	},
	storesJia() {
		const skuCurGoods = this.data.skuCurGoods
		if (skuCurGoods.basicInfo.storesBuy < skuCurGoods.basicInfo.stores) {
			skuCurGoods.basicInfo.storesBuy++
			this.setData({
				skuCurGoods
			})
		}
	},
	storesJian() {
		const skuCurGoods = this.data.skuCurGoods
		if (skuCurGoods.basicInfo.storesBuy > 1) {
			skuCurGoods.basicInfo.storesBuy--
			this.setData({
				skuCurGoods
			})
		}
	},
	closeSku() {
		this.setData({
			skuCurGoods: null
		})
		wx.showTabBar()
	},
	skuSelect(e) {
		const pid = e.currentTarget.dataset.pid
		const id = e.currentTarget.dataset.id
		// 处理选中
		const skuCurGoods = this.data.skuCurGoods
		const property = skuCurGoods.properties.find(ele => {
			return ele.id == pid
		})
		property.childsCurGoods.forEach(ele => {
			if (ele.id == id) {
				ele.active = true
			} else {
				ele.active = false
			}
		})
		this.setData({
			skuCurGoods
		})
	},
	addCarSku() {
		const skuCurGoods = this.data.skuCurGoods
		const propertySize = skuCurGoods.properties.length // 有几组SKU
		const sku = []
		skuCurGoods.properties.forEach(p => {
			const o = p.childsCurGoods.find(ele => {
				return ele.active
			})
			if (!o) {
				return
			}
			sku.push({
				optionId: o.propertyId,
				optionValueId: o.id
			})
		})
		if (sku.length != propertySize) {
			wx.showToast({
				title: '请选择规格',
				icon: 'none'
			})
			return
		}
		const options = {
			goodsId: skuCurGoods.basicInfo.id,
			buyNumber: skuCurGoods.basicInfo.storesBuy,
			sku
		}
		this.addShopCarDone(options)
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
