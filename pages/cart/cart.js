var app = getApp()
const WXAPI = require('apifm-wxapi')
Page({
	data: {
		goodsList: {
			saveHidden: true,
			totalPrice: 0,
			allSelect: true,
			noSelect: false,
			list: [],
		},
		delBtnWidth: 120, //删除按钮宽度单位（rpx）
		isHidden: true, //是否隐藏登录弹窗
		token:null,
	},
	showAuth(){
		this.setData({
			isHidden:false
		})
	},
	/*
	*授权登录成功后回调
	*/
	afterAuth(e){
		this.setData({
			isHidden:true,
			token:e.detail
		})
	},

	//获取元素自适应后的实际宽度
	getEleWidth: function(w) {
		var real = 0;
		try {
			var res = wx.getSystemInfoSync().windowWidth;
			var scale = (750 / 2) / (w / 2); //以宽度750px设计稿做宽度的自适应
			// console.log(scale);
			real = Math.floor(res / scale);
			return real;
		} catch (e) {
			return false;
			// Do something when catch error
		}
	},
	initEleWidth: function() {
		var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
		this.setData({
			delBtnWidth: delBtnWidth
		});
	},
	toDetailsTap: function(e) {
		wx.navigateTo({
			url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
		})
	},
	onLoad: function() {
		const that = this;
		if (app.globalData.iphone == true) {
			that.setData({
				iphone: 'iphone'
			})
		}
		wx.getStorage({
			key:'shopcart',
			success(res){
				let kb = res.data;
				let kbarr = kb.split(',');
				that.setData({
					sales: res.data
				});
				let sales = [];
				for (let i = 0; i < kbarr.length; i++) {
					WXAPI.goodsDetail(kbarr[i]).then( res => {
						if (res.code == 0) {
							sales.push(res.data.basicInfo);
						}
						that.setData({
							sales: sales
						});
					})
				}
			}
		})
		that.initEleWidth();
	},
	onShow: function() {
		const that = this;
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
		
		let shopList = [];
		// 获取购物车数据
		let shopCarInfoMem = wx.getStorageSync('shopCarInfo');
		if (shopCarInfoMem && shopCarInfoMem.shopList) {
			shopList = shopCarInfoMem.shopList
		}
		that.data.goodsList.list = shopList;
		that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), shopList);
	},
	toIndexPage: function() {
		wx.switchTab({
			url: "/pages/index/index"
		});
	},

	touchS: function(e) {
		if (e.touches.length == 1) {
			this.setData({
				startX: e.touches[0].clientX
			});
		}
	},
	touchM: function(e) {
		var index = e.currentTarget.dataset.index;

		if (e.touches.length == 1) {
			var moveX = e.touches[0].clientX;
			var disX = this.data.startX - moveX;
			var delBtnWidth = this.data.delBtnWidth;
			var left = "";
			if (disX == 0 || disX < 0) { //如果移动距离小于等于0，container位置不变
				left = "margin-left:0px";
			} else if (disX > 0) { //移动距离大于0，container left值等于手指移动距离
				left = "margin-left:-" + disX + "px";
				if (disX >= delBtnWidth) {
					left = "left:-" + delBtnWidth + "px";
				}
			}
			var list = this.data.goodsList.list;
			if (index != "" && index != null) {
				list[parseInt(index)].left = left;
				this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
			}
		}
	},

	touchE: function(e) {
		var index = e.currentTarget.dataset.index;
		if (e.changedTouches.length == 1) {
			var endX = e.changedTouches[0].clientX;
			var disX = this.data.startX - endX;
			var delBtnWidth = this.data.delBtnWidth;
			//如果距离小于删除按钮的1/2，不显示删除按钮
			var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
			var list = this.data.goodsList.list;
			if (index !== "" && index != null) {
				list[parseInt(index)].left = left;
				this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);

			}
		}
	},
	delItem: function(e) {
		var index = e.currentTarget.dataset.index;
		var list = this.data.goodsList.list;
		list.splice(index, 1);
		this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
	},
	selectTap: function(e) {
		var index = e.currentTarget.dataset.index;
		var list = this.data.goodsList.list;
		if (index !== "" && index != null) {
			list[parseInt(index)].active = !list[parseInt(index)].active;
			this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
		}
	},
	totalPrice: function() {
		var list = this.data.goodsList.list;
		var total = 0;
		for (var i = 0; i < list.length; i++) {
			var curItem = list[i];
			if (curItem.active) {
				total += parseFloat(curItem.price) * curItem.number;
			}
		}
		total = parseFloat(total.toFixed(2)); //js浮点计算bug，取两位小数精度
		return total;
	},
	allSelect: function() {
		var list = this.data.goodsList.list;
		var allSelect = false;
		for (var i = 0; i < list.length; i++) {
			var curItem = list[i];
			if (curItem.active) {
				allSelect = true;
			} else {
				allSelect = false;
				break;
			}
		}
		return allSelect;
	},
	noSelect: function() {
		var list = this.data.goodsList.list;
		var noSelect = 0;
		for (var i = 0; i < list.length; i++) {
			var curItem = list[i];
			if (!curItem.active) {
				noSelect++;
			}
		}
		if (noSelect == list.length) {
			return true;
		} else {
			return false;
		}
	},
	setGoodsList: function(saveHidden, total, allSelect, noSelect, list) {
		this.setData({
			goodsList: {
				saveHidden: saveHidden,
				totalPrice: total,
				allSelect: allSelect,
				noSelect: noSelect,
				list: list
			}
		});
		var shopCarInfo = {};
		var tempNumber = 0;
		shopCarInfo.shopList = list;
		for (var i = 0; i < list.length; i++) {
			tempNumber = tempNumber + list[i].number
		}
		shopCarInfo.shopNum = tempNumber;
		wx.setStorage({
			key: "shopCarInfo",
			data: shopCarInfo
		})
	},
	bindAllSelect: function() {
		var currentAllSelect = this.data.goodsList.allSelect;
		var list = this.data.goodsList.list;
		if (currentAllSelect) {
			for (var i = 0; i < list.length; i++) {
				var curItem = list[i];
				curItem.active = false;
			}
		} else {
			for (var i = 0; i < list.length; i++) {
				var curItem = list[i];
				curItem.active = true;
			}
		}

		this.setGoodsList(this.getSaveHide(), this.totalPrice(), !currentAllSelect, this.noSelect(), list);
	},
	jiaBtnTap: function(e) {
		var index = e.currentTarget.dataset.index;
		var list = this.data.goodsList.list;
		if (index !== "" && index != null) {
			if (list[parseInt(index)].number < 10) {
				list[parseInt(index)].number++;
				this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
			}
		}
	},
	jianBtnTap: function(e) {
		var index = e.currentTarget.dataset.index;
		var list = this.data.goodsList.list;
		if (index !== "" && index != null) {
			if (list[parseInt(index)].number > 1) {
				list[parseInt(index)].number--;
				this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
			}
		}
	},
	editTap: function() {
		var list = this.data.goodsList.list;
		for (var i = 0; i < list.length; i++) {
			var curItem = list[i];
			curItem.active = false;
		}
		this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
	},
	saveTap: function() {
		var list = this.data.goodsList.list;
		for (var i = 0; i < list.length; i++) {
			var curItem = list[i];
			curItem.active = true;
		}
		this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
	},
	getSaveHide: function() {
		var saveHidden = this.data.goodsList.saveHidden;
		return saveHidden;
	},
	deleteSelected: function() {
		var list = this.data.goodsList.list;
		/*
		 for(let i = 0 ; i < list.length ; i++){
		       let curItem = list[i];
		       if(curItem.active){
		         list.splice(i,1);
		       }
		 }
		 */
		// above codes that remove elements in a for statement may change the length of list dynamically
		list = list.filter(function(curGoods) {
			return !curGoods.active;
		});
		this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
		//更新tabbar购物车数字角标
		app.getShopCartNum()
	},
	toPayOrder: function() {
		wx.showLoading();
		const that = this;
		if (this.data.goodsList.noSelect) {
			wx.hideLoading();
			return;
		}
		// 重新计算价格，判断库存
		let shopList = [];
		let shopCarInfoMem = wx.getStorageSync('shopCarInfo');
		if (shopCarInfoMem && shopCarInfoMem.shopList) {
			// shopList = shopCarInfoMem.shopList
			shopList = shopCarInfoMem.shopList.filter(entity => {
				return entity.active;
			});
		}
		if (shopList.length == 0) {
			wx.hideLoading();
			return;
		}
		let isFail = false;
		let doneNumber = 0;
		let needDoneNUmber = shopList.length;
		for (let i = 0; i < shopList.length; i++) {
			if (isFail) {
				wx.hideLoading();
				return;
			}
			let carShopBean = shopList[i];
			// 获取价格和库存
			if (!carShopBean.propertyChildIds || carShopBean.propertyChildIds == "") {
				WXAPI.goodsDetail(carShopBean.goodsId).then( res => {
					if(res.code == 0){
						doneNumber++;
						const data = res.data
						if (data.properties) {
							wx.showModal({
								title: '提示',
								content: data.basicInfo.name + ' 商品已失效，请重新购买',
								showCancel: false
							})
							isFail = true;
							wx.hideLoading();
							return;
						}
						if (data.basicInfo.stores < carShopBean.number) {
							wx.showModal({
								title: '提示',
								content: data.basicInfo.name + ' 库存不足，请重新购买',
								showCancel: false
							})
							isFail = true;
							wx.hideLoading();
							return;
						}
						if (data.basicInfo.minPrice != carShopBean.price) {
							wx.showModal({
								title: '提示',
								content: data.basicInfo.name + ' 价格有调整，请重新购买',
								showCancel: false
							})
							isFail = true;
							wx.hideLoading();
							return;
						}
						if (needDoneNUmber == doneNumber) {
							that.navigateToPayOrder();
						}
					}
				})
			} else {
				WXAPI.goodsPrice(carShopBean.goodsId,carShopBean.propertyChildIds).then( res => {
					if(res.code == 0){
						doneNumber++;
						const data = res.data;
						if (data.stores < carShopBean.number) {
							wx.showModal({
								title: '提示',
								content: carShopBean.name + ' 库存不足，请重新购买',
								showCancel: false
							})
							isFail = true;
							wx.hideLoading();
							return;
						}
						if (data.price != carShopBean.price) {
							wx.showModal({
								title: '提示',
								content: carShopBean.name + ' 价格有调整，请重新购买',
								showCancel: false
							})
							isFail = true;
							wx.hideLoading();
							return;
						}
						if (needDoneNUmber == doneNumber) {
							that.navigateToPayOrder();
						}
					}
				})
			}

		}
	},
	navigateToPayOrder: function() {
		wx.hideLoading();
		wx.navigateTo({
			url: "/pages/pay-order/pay-order?orderType=cart"
		})
	}
})
