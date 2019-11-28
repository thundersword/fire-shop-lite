//app.js
const WXAPI = require('apifm-wxapi')
const CONFIG = require('config.js')
App({
	onLaunch: function() {
		WXAPI.init(CONFIG.subDomain) // 从根目录的 config.js 文件中读取
		/**
		 * 获取机型信息
		 */
		const that = this
		wx.getSystemInfo({
			success: function(res) {
				if (res.model.search("iPhone X") != -1) {
					that.globalData.iphone = true;
				}
				if (res.model.search("MI 8") != -1) {
					that.globalData.iphone = true;
				}
			}
		});
		/**
		 * 监听网络状态变化
		 * 可根据业务需求进行调整
		 */
		wx.onNetworkStatusChange(function(res) {
			if (!res.isConnected) {
				that.globalData.isConnected = false
				wx.showToast({
					title: '网络已断开',
					icon: 'loading',
					duration: 2000,
					complete: function() {
						that.goStartIndexPage()
					}
				})
			} else {
				that.globalData.isConnected = true
				wx.hideToast()
			}
		});
		//  获取商城名称
		WXAPI.queryConfigBatch('mallName,version,shopcart').then(
			res => {
				if (res.code == 0) {
					res.data.forEach(config => {
						wx.setStorageSync(config.key, config.value);
						if (config.key === 'recharge_amount_min') {
							that.globalData.recharge_amount_min = res.data.value;
						}
					})

				}
			})
		//获取logo
		WXAPI.banners({
			type: 'topLogo'
		}).then(res => {
			if (res.code == 0) {
				wx.setStorageSync('logo', res.data[0].picUrl)
			}
		})
	},
	fadeInOut: function(that, param, opacity) {
		const animation = wx.createAnimation({
			//持续时间800ms
			duration: 300,
			timingFunction: 'ease',
		})
		animation.opacity(opacity).step()
		let json = '{"' + param + '":""}'
		json = JSON.parse(json);
		json[param] = animation.export()
		that.setData(json)
	},
	isStrInArray: function(item, arr) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] == item) {
				return true;
			}
		}
		return false;
	},
	getShopCartNum: function() {
		const that = this
		wx.getStorage({
			key: 'shopCarInfo',
			success: function(res) {
				if (res.data) {
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
	sendTempleMsg: function(orderId, trigger, template_id, form_id, page, postJsonString) {
		var that = this;
		wx.request({
			url: that.globalData.urls + "/template-msg/put",
			method: "POST",
			header: {
				"content-type": "application/x-www-form-urlencoded"
			},
			data: {
				token: that.globalData.token,
				type: 0,
				module: "order",
				business_id: orderId,
				trigger: trigger,
				template_id: template_id,
				form_id: form_id,
				url: page,
				postJsonString: postJsonString
			}
		});
	},
	sendTempleMsgImmediately: function(template_id, form_id, page, postJsonString) {
		var that = this;
		wx.request({
			url: that.globalData.urls + "/template-msg/put",
			method: "POST",
			header: {
				"content-type": "application/x-www-form-urlencoded"
			},
			data: {
				token: that.globalData.token,
				type: 0,
				module: "immediately",
				template_id: template_id,
				form_id: form_id,
				url: page,
				postJsonString: postJsonString
			}
		});
	},
	globalData: {
		userInfo: null,
		isConnected: true,
		iphone: false,
		orderExpireTime: CONFIG.orderExpireTime,
	}
})
