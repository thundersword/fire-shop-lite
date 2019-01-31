var wxpay = require('../../utils/pay.js');
var app = getApp();
Page({
  data: {
  },
  onLoad: function (e) {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    if (e) {
      that.setData({
        money: e.money,
        order: e.order,
        id: e.id
      });
    }
    wx.request({
      url: app.globalData.urls + '/user/shipping-address/default',
      data: {
        token: app.globalData.token
      },
      success: (res) => {
        if (res.data.code == 0) {
          that.setData({
            curAddressData: res.data.data
          });
        }
      }
    })
  },
  toPayTap: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    wx.request({
      url: app.globalData.urls + '/user/amount',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          // res.data.data.balance
          money = money - res.data.data.balance;
          if (money <= 0) {
            // 直接使用余额支付
            wx.request({
              url: app.globalData.urls + '/order/pay',
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              data: {
                token: app.globalData.token,
                orderId: orderId
              },
              success: function (res2) {
                wx.redirectTo({
                  url: "/pages/order-list/order-list?currentType=1&share=1"
                });
              }
            })
          } else {
            wxpay.wxpay(app, money, orderId, "/pages/order-list/order-list?currentType=1&share=1");
          }
        } else {
          wx.showModal({
            title: '错误',
            content: '无法获取用户资金信息',
            showCancel: false
          })
        }
      }
    })
  },
  closeOreder: function () {
    wx.showModal({
      title: '',
      content: '优惠不等人，商品一旦错过就不存在了哦～',
      cancelText: '忍痛放弃',
      cancelColor: '#999999',
      confirmText: '我在想想',
      confirmColor: '#b5272d',
      success: function (res) {
        if (res.cancel) {
          wx.redirectTo({
            url: "/pages/order-list/order-list?currentType=0&share=1"
          });
        }
      }
    })
  }

})