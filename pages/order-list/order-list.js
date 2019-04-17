var wxpay = require('../../utils/pay.js')
var app = getApp()
Page({
  data: {
    statusType: ["待付款", "待发货", "待收货", "待评价", "已完成"],
    currentType: 0,
    tabClass: ["", "", "", "", ""],
		bodyHeight:null
  },

  statusTap: function (e) {
    var obj = e;
    var count = 0;
    for (var key in obj) {
      count++;
    }
    if (count == 0) {
      var curType = 0;
    } else {
      console.log('出现Cannot read property "dataset" of undefined;这样的错误是正常的，不用管！');
      var curType = e.currentTarget.dataset.index;
    }
    this.data.currentType = curType
    this.setData({
      currentType: curType
    });
    this.onShow();
  },
  orderDetail: function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-detail/order-detail?id=" + orderId + '&share=1'
    })
  },
  cancelOrderTap: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading();
          wx.request({
            url: app.siteInfo.url + app.siteInfo.subDomain + '/order/close',
            data: {
              token: app.globalData.token,
              orderId: orderId
            },
            success: (res) => {
              wx.hideLoading();
              if (res.data.code == 0) {
                that.onShow();
              }
            }
          })
        }
      }
    })
  },
  toPayTap: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    wx.request({
      url: app.siteInfo.url + app.siteInfo.subDomain + '/user/amount',
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
              url: app.siteInfo.url + app.siteInfo.subDomain + '/order/pay',
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              data: {
                token: app.globalData.token,
                orderId: orderId
              },
              success: function (res2) {
                wx.reLaunch({
                  url: "/pages/my/my"
                });
              }
            })
          } else {
            wxpay.wxpay(app, money, orderId, "/pages/my/my");
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
  onLoad: function (e) {
    var that = this;
    if (e.share) {
      that.setData({ share: e.share });
    }
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    var currentType = e.currentType;
    this.data.currentType = currentType;
    if (currentType) {
      that.setData({
        currentType: currentType
      });
    }
    that.statusTap(e);
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成

  },
  getOrderStatistics: function () {
    var that = this;
    wx.request({
      url: app.siteInfo.url + app.siteInfo.subDomain + '/order/statistics',
      data: { token: app.globalData.token },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          var tabClass = that.data.tabClass;
          if (res.data.data.count_id_no_pay > 0) {
            tabClass[0] = "red-dot"
          } else {
            tabClass[0] = ""
          }
          if (res.data.data.count_id_no_transfer > 0) {
            tabClass[1] = "red-dot"
          } else {
            tabClass[1] = ""
          }
          if (res.data.data.count_id_no_confirm > 0) {
            tabClass[2] = "red-dot"
          } else {
            tabClass[2] = ""
          }
          if (res.data.data.count_id_no_reputation > 0) {
            tabClass[3] = "red-dot"
          } else {
            tabClass[3] = ""
          }
          if (res.data.data.count_id_success > 0) {
            //tabClass[4] = "red-dot"
          } else {
            //tabClass[4] = ""
          }

          that.setData({
            tabClass: tabClass,
          });
        }
      }
    })
  },
	toConfirmTap:function(e){
	  let that = this;
	  let orderId = e.currentTarget.dataset.id;
	  let formId = e.detail.formId;
	  wx.showModal({
	      title: '确认您已收到商品？',
	      content: '',
	      success: function(res) {
	        if (res.confirm) {
	          wx.showLoading();
	          wx.request({
	            url: app.globalData.urls + '/order/delivery',
	            data: {
	              token: app.globalData.token,
	              orderId: orderId
	            },
	            success: (res) => {
	              if (res.data.code == 0) {
	                that.onShow();
	                // 模板消息，提醒用户进行评价
	                let postJsonString = {};
	                postJsonString.keyword1 = { value: that.data.orderDetail.orderInfo.orderNumber, color: '#173177' }
	                let keywords2 = '您已确认收货，期待您的再次光临！';
	                if (app.globalData.order_reputation_score) {
	                  keywords2 += '立即好评，系统赠送您' + app.globalData.order_reputation_score +'积分奖励。';
	                }
	                postJsonString.keyword2 = { value: keywords2, color: '#173177' }
	                app.sendTempleMsgImmediately(app.siteInfo.assessorderkey , formId,
	                  '/pages/order-detail/order-detail?id=' + orderId, JSON.stringify(postJsonString));
	              }
	            }
	          })
	        }
	      }
	  })
	},
  onShow: function (e) {
    // 获取订单列表
    wx.showLoading();
    var that = this;
    var postData = {
      token: app.globalData.token
    };
    postData.status = that.data.currentType;
    this.getOrderStatistics();
    wx.request({
      url: app.siteInfo.url + app.siteInfo.subDomain + '/order/list',
      data: postData,
      success: (res) => {
				console.log(res)
        wx.hideLoading();
        if (res.data.code == 0) {
          that.setData({
            orderList: res.data.data.orderList,
            logisticsMap: res.data.data.logisticsMap,
            goodsMap: res.data.data.goodsMap
          });
        } else {
          this.setData({
            orderList: null,
            logisticsMap: {},
            goodsMap: {}
          });
        }
      }
    })
		var winInfo = wx.getSystemInfo({
			success: function (res) {
				var windowHeight = res.windowHeight;
				var statusBarHeight = res.statusBarHeight;
				var titleBarHeight = 0
				if (res.model.indexOf('iPhone') !== -1) {
					titleBarHeight = 44
				} else {
					titleBarHeight = 48
				}
				var query = wx.createSelectorQuery();
				query.select('.status-box').boundingClientRect()
				query.exec((res) => {
				  var listHeight = res[0].height; // 获取list高度
					that.setData({ bodyHeight: windowHeight - statusBarHeight - titleBarHeight - listHeight });
				})
				
			
			}
		});
  },
  onHide: function () {
    // 生命周期函数--监听页面隐藏

  },
  onUnload: function () {
    // 生命周期函数--监听页面卸载

  },
  onPullDownRefresh: function () {
    // 页面相关事件处理函数--监听用户下拉动作

  },
  onReachBottom: function () {
    // 页面上拉触底事件的处理函数

  }
})