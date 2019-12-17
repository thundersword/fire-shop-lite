const app = getApp()
const WXAPI = require('apifm-wxapi')
const CONFIG = require('../../config.js')
Page({
	data: {
		orderId: 0,
		goodsList: [],
		yunPrice: "0.00",
		isHidden: true,
		token: null,
	},
	afterAuth(e) {
		this.setData({
			isHidden: true,
			token: e.detail
		})
	},
	onLoad: function(e) {
		var that = this;
		var orderId = e.id;
		if (!e.share) {
			that.setData({
				share: true
			});
		}
		if (app.globalData.iphone == true) {
			that.setData({
				iphone: 'iphone'
			})
		}
		that.data.orderId = orderId;
		that.setData({
			orderId: orderId
		});
	},
	onShow: function() {
		var that = this;
		wx.showLoading();
		WXAPI.orderDetail(wx.getStorageSync('token'), that.data.orderId).then(function(res) {
			wx.hideLoading()
			if (res.code != 0) {
				wx.showModal({
					title: '错误',
					content: res.msg,
					showCancel: false
				})
				return;
			}
			that.setData({
				orderDetail: res.data
			});
		})
		var yunPrice = parseFloat(this.data.yunPrice);
		var allprice = 0;
		var goodsList = this.data.goodsList;
		for (var i = 0; i < goodsList.length; i++) {
			allprice += parseFloat(goodsList[0].price) * goodsList[0].number;
		}
		this.setData({
			allGoodsPrice: allprice,
			yunPrice: yunPrice
		});
	},
	wuliuDetailsTap: function(e) {
		var orderId = e.currentTarget.dataset.id;
		var numberId = e.currentTarget.dataset.number;
		wx.navigateTo({
			url: "/pages/logistics/logistics?id=" + orderId + '&number=' + numberId
		})
	},
	confirmBtnTap: function(e) {
		let that = this;
		let orderId = this.data.orderId;
		let formId = e.detail.formId;
		wx.showModal({
			title: '确认您已收到商品？',
			content: '',
			success: function(res) {
				if (res.confirm) {
					wx.showLoading();
					WXAPI.orderDelivery(app.globalData.token, orderId).then( res => {
						wx.hideLoading();
						if (res.code == 0) {
							that.onShow();
							// 模板消息，提醒用户进行评价
							let postJsonString = {};
							postJsonString.keyword1 = {
								value: that.data.orderDetail.orderInfo.orderNumber,
								color: '#173177'
							}
							let keywords2 = '您已确认收货，期待您的再次光临！';
							if (app.globalData.order_reputation_score) {
								keywords2 += '立即好评，系统赠送您' + app.globalData.order_reputation_score + '积分奖励。';
							}
							postJsonString.keyword2 = {
								value: keywords2,
								color: '#173177'
							}
							app.sendTempleMsgImmediately(CONFIG.assessorderkey, formId,
								'/pages/order-detail/order-detail?id=' + orderId, JSON.stringify(postJsonString));
						}
					})
				}
			}
		})
	},
	submitReputation: function(e) {
		let that = this;
		let formId = e.detail.formId;
		let postJsonString = {};
		postJsonString.token = app.globalData.token;
		postJsonString.orderId = this.data.orderId;
		let reputations = [];
		let i = 0;
		while (e.detail.value["orderGoodsId" + i]) {
			let orderGoodsId = e.detail.value["orderGoodsId" + i];
			let goodReputation = e.detail.value["goodReputation" + i];
			let goodReputationRemark = e.detail.value["goodReputationRemark" + i];

			let reputations_json = {};
			reputations_json.id = orderGoodsId;
			reputations_json.reputation = goodReputation;
			reputations_json.remark = goodReputationRemark;

			reputations.push(reputations_json);
			i++;
		}
		postJsonString.reputations = reputations;
		wx.showLoading();
		WXAPI.orderReputation({
			postJsonString: JSON.stringify(postJsonString)
		}).then( res => {
			console.log(res)
			wx.hideLoading();
			if (res.code == 0) {
				that.onShow();
				// 模板消息，通知用户已评价
				let postJsonString = {};
				postJsonString.keyword1 = {
					value: that.data.orderDetail.orderInfo.orderNumber,
					color: '#173177'
				}
				let keywords2 = '感谢您的评价，期待您的再次光临！';
				if (app.globalData.order_reputation_score) {
					keywords2 += app.globalData.order_reputation_score + '积分奖励已发放至您的账户。';
				}
				postJsonString.keyword2 = {
					value: keywords2,
					color: '#173177'
				}
				app.sendTempleMsgImmediately(CONFIG.successorderkey, formId,
					'/pages/order-detail/order-detail?id=' + that.data.orderId, JSON.stringify(postJsonString));
			}
		})
	}
})
