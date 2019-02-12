var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
  },

  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
    })
  },
  onLoad: function (e) {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    var topictitle = that.data.topictitle;
    wx.request({
      url: app.globalData.urls + '/cms/news/detail',
      data: {
        id: e.id
      },
      success: function (res) {
        if (res.data.code == 0) {
          var kb = res.data.data.keywords;
          var kbarr = kb.split(',');
          that.setData({
            topics: res.data.data,
            topictitle: res.data.data.title
          });
          var goods = [];
          for (var i = 0; i < kbarr.length; i++) {
            wx.request({
              url: app.globalData.urls + '/shop/goods/detail',
              data: {
                id: kbarr[i]
              },
              success: function (res) {
                if (res.data.code == 0) {
                  goods.push(res.data.data.basicInfo);
                }
                that.setData({
                  goods: goods,
                  topid: e.id
                });
              }
            })
          }
          WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
          
        }
      }
    })

  },
  onShareAppMessage: function (e) {
    return {
      title: this.data.topictitle,
      path: 'pages/topic/topic?id=' + this.data.topid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },


})