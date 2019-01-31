var app = getApp()
Page({
  data: {
    score: 0,//积分
    score_sign_continuous: 0,//连续签到次数
    ci: 0 //今天是否已签到
  },

  onShow() {
    this.checkScoreSign();
  },
  //签到按钮
  scoresign: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/score/sign',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.onLoad();
          that.checkScoreSign();
        }
        wx.showToast({
          title: '签到成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  checkScoreSign: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/score/today-signed',
      data: {
        token: app.globalData.token
      },
      success: function (res) {

        if (res.data.code == 0) {
          that.setData({
            ci: 1
          });
        }
        wx.request({
          url: app.globalData.urls + '/score/sign/logs',
          data: {
            token: app.globalData.token,
          },
          success: function (res) {
            if (res.data.code == 0) {
              that.setData({
                score_sign_continuous: res.data.data.result[0].continuous
              });
            }
          }
        })
      }
    })

  },
  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    that.checkScoreSign();
    //获取积分
    wx.request({
      url: app.globalData.urls + '/user/amount',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            balance: res.data.data.balance,
            freeze: res.data.data.freeze,
            score: res.data.data.score
          });
        }
      }
    })
    //获取签到规则
    wx.request({
      url: app.globalData.urls + '/score/sign/rules',
      data: {
      },
      success: function (res) {

        if (res.data.code == 0) {
          that.setData({
            rules: res.data.data
          });
        }
      }
    })
    //获取签到记录

    /*wx.request({
      url: app.siteInfo.url + app.siteInfo.subDomain + '/score/sign/logs',
      data: {
        token:app.globalData.token,
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            score_sign_continuous: res.data.data.result[0].continuous
          });
        }
      }
    })*/
  },
  score: function () {
    wx.navigateTo({
      url: "/pages/coupons/coupons"
    })
  },
  home: function () {
    wx.switchTab({
      url: '../index/index'
    })
  }

})