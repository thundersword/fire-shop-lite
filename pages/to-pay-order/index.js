const app = getApp()
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const wxpay = require('../../utils/pay.js')

Page({
	data: {
		wxlogin: true,
		totalScoreToPay: 0,
		goodsList: [],
		isNeedLogistics: 0, // 是否需要物流信息
		allGoodsPrice: 0,
		yunPrice: 0,
		allGoodsAndYunPrice: 0,
		goodsJsonStr: "",
		orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
		pingtuanOpenId: undefined, //拼团的话记录团号

		hasNoCoupons: true,
		coupons: [],
		youhuijine: 0, //优惠券金额
		curCoupon: null, // 当前选择使用的优惠券
		allowSelfCollection: '0', // 是否允许到店自提
		peisongType: 'kd', // 配送方式 kd,zq 分别表示快递/到店自取
		remark: '',
		showModal: false, //是否显示微信支付modal
		payAmount: null,
		payId: null,
	},
	onShow() {
		// AUTH.checkHasLogined().then(isLogined => {
		// 	if (isLogined) {
		// 		this.doneShow()
		// 	} else {
		// 		this.setData({
		// 			wxlogin: isLogined
		// 		})

		// 	}
		// })
	},
	afterAuth() {
		this.setData({
			wxlogin: true
		})
		this.doneShow()
	},
	async doneShow() {
		let allowSelfCollection = wx.getStorageSync('ALLOW_SELF_COLLECTION')
		if (!allowSelfCollection || allowSelfCollection != '1') {
			allowSelfCollection = '0'
			this.data.peisongType = 'kd'
		}
		let shopList = [];
		const token = wx.getStorageSync('token')
		//立即购买下单
		if ("buyNow" == this.data.orderType) {
			var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
			this.data.kjId = buyNowInfoMem.kjId;
			if (buyNowInfoMem && buyNowInfoMem.shopList) {
				shopList = buyNowInfoMem.shopList
			}
		} else {
			//购物车下单
			const res = await WXAPI.shippingCarInfo(token)
			if (res.code == 0) {
				shopList = res.data.items
			}
		}
		this.setData({
			goodsList: shopList,
			allowSelfCollection: allowSelfCollection,
			peisongType: this.data.peisongType
		});
		this.initShippingAddress()
	},
	onPullDownRefresh: function() {
		// 下拉刷新物流地址，workaround添加完地址需要推出页面重新进来，才能出新地址
		this.initShippingAddress()
	},
	onLoad(e) {
		let _data = {
			isNeedLogistics: 1
		}
		if (e.orderType) {
			_data.orderType = e.orderType
		}
		if (e.pingtuanOpenId) {
			_data.pingtuanOpenId = e.pingtuanOpenId
		}
		this.setData(_data);
	},

	getDistrictId: function(obj, aaa) {
		if (!obj) {
			return "";
		}
		if (!aaa) {
			return "";
		}
		return aaa;
	},
	remarkChange(e) {
		this.data.remark = e.detail.value
	},
	goCreateOrder() {
		wx.requestSubscribeMessage({
			tmplIds: ['Z0hQYItP4ct2VbxbWMGp61SH0_4zmDB-52WQpHQ1jco'], 
			//订单状态通知    温馨提示
			// {{thing1.DATA}}
			// 订单编号

			// {{character_string2.DATA}}
			// 订单状态

			// {{phrase5.DATA}}
			success(res) {

			},
			fail(e) {
				console.error(e)
			},
			complete: (e) => {
				this.createOrder(true)
			},
		})
	},
	createOrder: function(e) {
		var that = this;
		var loginToken = wx.getStorageSync('token') // 用户登录 token
		var remark = this.data.remark; // 备注信息

		let postData = {
			token: loginToken,
			goodsJsonStr: that.data.goodsJsonStr,
			remark: remark,
			peisongType: that.data.peisongType
		};
		if (that.data.kjId) {
			postData.kjid = that.data.kjId
		}
		if (that.data.pingtuanOpenId) {
			postData.pingtuanOpenId = that.data.pingtuanOpenId
		}
		if (that.data.isNeedLogistics > 0 && postData.peisongType == 'kd') {
			if (!that.data.curAddressData && loginToken) {
				wx.hideLoading();
				wx.showModal({
					title: '友情提示',
					content: '请先设置您的收货地址！',
					showCancel: false
				})
				return;
			}
			if (postData.peisongType == 'kd') {
				postData.provinceId = that.data.curAddressData.provinceId;
				postData.cityId = that.data.curAddressData.cityId;
				if (that.data.curAddressData.districtId) {
					postData.districtId = that.data.curAddressData.districtId;
				}
				postData.address = that.data.curAddressData.address;
				postData.linkMan = that.data.curAddressData.linkMan;
				postData.mobile = that.data.curAddressData.mobile;
				postData.code = that.data.curAddressData.code;
			}
		}
		if (that.data.curCoupon) {
			postData.couponId = that.data.curCoupon.id;
		}
		if (!e) {
			postData.calculate = "true";
		}

		WXAPI.orderCreate(postData).then(function(res) {
			if (res.code != 0) {
				wx.showModal({
					title: '错误',
					content: res.msg,
					showCancel: false
				})
				return;
			}

			if (e && "buyNow" != that.data.orderType) {
				// 清空购物车数据
				WXAPI.shippingCarInfoRemoveAll(loginToken)
			}
			if (!e) {
				that.setData({
					totalScoreToPay: res.data.score,
					isNeedLogistics: res.data.isNeedLogistics,
					allGoodsPrice: res.data.amountTotle,
					allGoodsAndYunPrice: res.data.amountLogistics + res.data.amountTotle,
					yunPrice: res.data.amountLogistics
				});
				that.getMyCoupons();
				return;
			}
			// 下单成功，跳转到订单管理界面
			that.setData({
				showModal: true,
				payAmount: res.data.amountReal,
				payId: res.data.id
			})
			// wx.redirectTo({
			//   url: "/pages/order-list/index"
			// });
		})
	},
	toPay() {
		if (this.data.totalScoreToPay > 0) {
			WXAPI.userAmount(wx.getStorageSync('token')).then(res => {
				if (res.data.score < this.data.totalScoreToPay) {
					wx.showToast({
						title: '您的积分不足，无法支付',
						icon: 'none'
					})
					return;
				} else {
					wxpay.wxpay('order', this.data.payAmount, this.data.payId,
						"/pages/order-list/index?type=0");
				}
			})
		} else {
			wxpay.wxpay('order', this.data.payAmount, this.data.payId,
				"/pages/order-list/index?type=1");
		}
	},
	hideModal() {
		wx.redirectTo({
			url: "/pages/order-list/index"
		});
	},
	async initShippingAddress() {
		const res = await WXAPI.defaultAddress(wx.getStorageSync('token'))
		if (res.code == 0) {
			this.setData({
				curAddressData: res.data.info
			});
		} else {
			this.setData({
				curAddressData: null
			});
		}
		this.processYunfei();
	},
	processYunfei() {
		var goodsList = this.data.goodsList;
		var goodsJsonStr = "[";
		var isNeedLogistics = 0;
		var allGoodsPrice = 0;


		let inviter_id = 0;
		let inviter_id_storge = wx.getStorageSync('referrer');
		if (inviter_id_storge) {
			inviter_id = inviter_id_storge;
		}
		for (let i = 0; i < goodsList.length; i++) {
			let carShopBean = goodsList[i];
			if (carShopBean.logistics || carShopBean.logisticsId) {
				isNeedLogistics = 1;
			}
			allGoodsPrice += carShopBean.price * carShopBean.number;

			var goodsJsonStrTmp = '';
			if (i > 0) {
				goodsJsonStrTmp = ",";
			}
			if (carShopBean.sku && carShopBean.sku.length > 0) {
				let propertyChildIds = ''
				carShopBean.sku.forEach(option => {
					propertyChildIds = propertyChildIds + ',' + option.optionId + ':' + option.optionValueId
				})
				carShopBean.propertyChildIds = propertyChildIds
			}
			goodsJsonStrTmp += '{"goodsId":' + carShopBean.goodsId + ',"number":' + carShopBean.number +
				',"propertyChildIds":"' + carShopBean.propertyChildIds + '","logisticsType":0, "inviter_id":' + inviter_id + '}';
			goodsJsonStr += goodsJsonStrTmp;


		}
		goodsJsonStr += "]";
		this.setData({
			isNeedLogistics: isNeedLogistics,
			goodsJsonStr: goodsJsonStr
		});
		this.createOrder();
	},
	addAddress: function() {
		wx.navigateTo({
			url: "/pages/address-add/index"
		})
	},
	selectAddress: function() {
		wx.navigateTo({
			url: "/pages/select-address/index"
		})
	},
	getMyCoupons: function() {
		var that = this;
		WXAPI.myCoupons({
			token: wx.getStorageSync('token'),
			status: 0
		}).then(function(res) {
			if (res.code == 0) {
				var coupons = res.data.filter(entity => {
					return entity.moneyHreshold <= that.data.allGoodsAndYunPrice;
				});
				if (coupons.length > 0) {
					that.setData({
						hasNoCoupons: false,
						coupons: coupons
					});
				}
			}
		})
	},
	bindChangeCoupon: function(e) {
		const selIndex = e.detail.value[0] - 1;
		if (selIndex == -1) {
			this.setData({
				youhuijine: 0,
				curCoupon: null
			});
			return;
		}
		//console.log("selIndex:" + selIndex);
		this.setData({
			youhuijine: this.data.coupons[selIndex].money,
			curCoupon: this.data.coupons[selIndex]
		});
	},
	radioChange(e) {
		this.setData({
			peisongType: e.detail.value
		})
		this.processYunfei()
	},
})
