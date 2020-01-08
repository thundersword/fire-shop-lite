const wxpay = require('../../utils/pay.js')
const app = getApp()
const WXAPI = require('apifm-wxapi')
const CONFIG = require('../../config.js')
Page({
	data: {
		statusType: ["待付款", "待发货", "待收货", "待评价", "已完成"],
		currentType: 0,
		tabClass: ["", "", "", "", ""],
		bodyHeight: null,
		isHidden: true,
		token: null,
		orderList: []
	},
	afterAuth(e) {
		this.setData({
			isHidden: true,
			token: e.detail
		})
		this.getOrderList()
	},
	getOrderList() {
		// 获取订单列表
		wx.showLoading()
		let postData = {
			token: this.data.token
		};
		postData.status = this.data.currentType;
		this.getOrderStatistics();
		WXAPI.orderList(postData).then(res => {
			console.log(res)
			wx.hideLoading()
			if (res.code == 0) {
				this.setData({
					orderList: res.data.orderList,
					logisticsMap: res.data.logisticsMap,
					goodsMap: res.data.goodsMap
				});
			} else {
				this.setData({
					orderList: [],
					logisticsMap: {},
					goodsMap: {}
				});
			}
		}).catch(e => {
			console.log('失败')
		})
	},
	statusTap: function(e) {
		// const curType = e.currentType ? e.currentType : e.currentTarget.dataset.index;
		const curType = e.currentTarget.dataset.index;
		this.data.currentType = curType
		this.setData({
			currentType: curType
		});
		this.getOrderList();
	},
	orderDetail: function(e) {
		var orderId = e.currentTarget.dataset.id;
		wx.navigateTo({
			url: "/pages/order-detail/order-detail?id=" + orderId + '&share=1'
		})
	},
	cancelOrderTap: function(e) {
		const that = this;
		const orderId = e.currentTarget.dataset.id;
		wx.showModal({
			title: '确定要取消该订单吗？',
			content: '',
			success: function(res) {
				if (res.confirm) {
					WXAPI.orderClose(wx.getStorageSync('token'), orderId).then(function(res) {
						if (res.code == 0) {
							that.getOrderList();
						}
					})
				}
			}
		})
	},
	toPayTap: function(e) {
		if (this.data.payButtonClicked) {
			wx.showToast({
				title: '休息一下~',
				icon: 'none'
			})
			return
		}
		this.data.payButtonClicked = true
		setTimeout(() => {
			this.data.payButtonClicked = false
		}, 3000) // 可自行修改时间间隔（目前是3秒内只能点击一次支付按钮）
		// 防止连续点击--结束
		const that = this;
		const orderId = e.currentTarget.dataset.id;
		let money = e.currentTarget.dataset.money;
		const needScore = e.currentTarget.dataset.score;
		WXAPI.userAmount(wx.getStorageSync('token')).then(function(res) {
			if (res.code == 0) {
				// 增加提示框
				if (res.data.score < needScore) {
					wx.showToast({
						title: '您的积分不足，无法支付',
						icon: 'none'
					})
					return;
				}
				let _msg = '订单金额: ' + money + ' 元'
				if (res.data.balance > 0) {
					_msg += ',可用余额为 ' + res.data.balance + ' 元'
					if (money - res.data.balance > 0) {
						_msg += ',仍需微信支付 ' + (money - res.data.balance) + ' 元'
					}
				}
				if (needScore > 0) {
					_msg += ',并扣除 ' + money + ' 积分'
				}
				money = money - res.data.balance
				wx.showModal({
					title: '请确认支付',
					content: _msg,
					confirmText: "确认支付",
					cancelText: "取消支付",
					success: function(res) {
						console.log(res);
						if (res.confirm) {
							that._toPayTap(orderId, money)
						} else {
							console.log('用户点击取消支付')
						}
					}
				});
			} else {
				wx.showModal({
					title: '错误',
					content: '无法获取用户资金信息',
					showCancel: false
				})
			}
		})
	},
	_toPayTap: function(orderId, money) {
		const _this = this
		if (money <= 0) {
			// 直接使用余额支付
			WXAPI.orderPay(this.data.token, orderId).then(function(res) {
				_this.getOrderList();
			})
		} else {
			wxpay.wxpay('order', money, orderId, "/pages/order-list/order-list");
		}
	},
	onLoad: function(e) {
		if (e.share) {
			this.setData({
				share: e.share
			});
		}
		if (app.globalData.iphone == true) {
			this.setData({
				iphone: 'iphone'
			})
		}
		const currentType = e.currentType;
		this.data.currentType = currentType;
		if (currentType) {
			this.setData({
				currentType: currentType
			});
		}
		// this.statusTap(e);
	},
	onReady: function() {
		// 生命周期函数--监听页面初次渲染完成

	},
	getOrderStatistics: function() {
		WXAPI.orderStatistics(wx.getStorageSync('token')).then(res => {
			if (res.code == 0) {
				var tabClass = this.data.tabClass;
				if (res.data.count_id_no_pay > 0) {
					tabClass[0] = "red-dot"
				} else {
					tabClass[0] = ""
				}
				if (res.data.count_id_no_transfer > 0) {
					tabClass[1] = "red-dot"
				} else {
					tabClass[1] = ""
				}
				if (res.data.count_id_no_confirm > 0) {
					tabClass[2] = "red-dot"
				} else {
					tabClass[2] = ""
				}
				if (res.data.count_id_no_reputation > 0) {
					tabClass[3] = "red-dot"
				} else {
					tabClass[3] = ""
				}
				if (res.data.count_id_success > 0) {
					//tabClass[4] = "red-dot"
				} else {
					//tabClass[4] = ""
				}

				this.setData({
					tabClass: tabClass,
				});
			}
		})
	},
	toConfirmTap: function(e) {
		let that = this;
		let orderId = e.currentTarget.dataset.id;
		let orderNumber = e.currentTarget.dataset.number
		let formId = e.detail.formId;
		wx.showModal({
			title: '确认您已收到商品？',
			content: '',
			success: function(res) {
				if (res.confirm) {
					wx.showLoading();
					WXAPI.orderDelivery(app.globalData.token,orderId).then( result => {
						if (result.code == 0) {
							wx.hideLoading();
							that.getOrderList();
						}
					})
				}
			}
		})
	},
	onShow: function(e) {
		const that = this
		let winInfo = wx.getSystemInfo({
			success: function(res) {
				let windowHeight = res.windowHeight;
				let statusBarHeight = res.statusBarHeight;
				let titleBarHeight = 0
				if (res.model.indexOf('iPhone') !== -1) {
					titleBarHeight = 44
				} else {
					titleBarHeight = 48
				}
				let query = wx.createSelectorQuery();
				query.select('.status-box').boundingClientRect()
				query.exec((res) => {
					let listHeight = res[0].height; // 获取list高度
					that.setData({
						bodyHeight: windowHeight - statusBarHeight - titleBarHeight - listHeight
					});
				})


			}
		});
	},
	onHide: function() {
		// 生命周期函数--监听页面隐藏

	},
	onUnload: function() {
		// 生命周期函数--监听页面卸载

	},
	onPullDownRefresh: function() {
		// 页面相关事件处理函数--监听用户下拉动作

	},
	onReachBottom: function() {
		// 页面上拉触底事件的处理函数

	}
})
