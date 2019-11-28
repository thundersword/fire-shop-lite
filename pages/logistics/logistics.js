//index.js
  //获取应用实例
  const WXAPI = require('apifm-wxapi')
  const app = getApp()
  Page({
  	data: {},
  	onLoad: function(e) {
  		this.getOrderLogistics(e.id)
  	},
  	getOrderLogistics(id) {
  		var that = this;
  		WXAPI.orderDetail(wx.getStorageSync('token'), id).then(function(res) {
  			console.log(res)
  			if (res.code != 0) {
  				wx.showModal({
  					title: '错误',
  					content: res.msg,
  					showCancel: false
  				})
  				return;
  			}
  			that.setData({
  				orderDetail: res.data,
  				logisticsTraces: res.data.logisticsTraces ? res.data.logisticsTraces.reverse() : null
  			});
  		})
  	}
  })
