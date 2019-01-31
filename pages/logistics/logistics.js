  //index.js
//获取应用实例
var app = getApp()
Page({
  data: {},
  onLoad: function (e) {
    var that = this;
    var orderId = e.id;
    var numberId = e.number;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) };
    if(app.siteInfo.wuliukey){
      wx.request({
        url: 'https://it120.maliapi.com/api/1?viewid=home&part=get_wuliu',
        method: 'POST',
        data: {
          domain_name: app.globalData.urls,
          mapkey: app.siteInfo.wuliukey,
          num: numberId,
          viewid: 'home',
          part: 'get_wuliu'
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
					console.log(res)
          if(res.data.code == 0){
            var wuliujson = JSON.parse(res.data.data);
            that.setData({
              orderDetailName: wuliujson.showapi_res_body.expTextName,
              orderDetailNumber: wuliujson.showapi_res_body.mailNo,
              maliwiliuList: wuliujson.showapi_res_body.data
            });
          }else{
            that.setData({
              nonemaliWuliu: true
            });
          }
        }
      });
    }else{
      wx.request({
        url: app.globalData.urls + '/order/detail',
        data: {
          token: app.globalData.token,
          id: orderId
        },
        success: function (res) {
					console.log(res)
          if(res.data.code == 0){
            if(res.data.data.logisticsTraces){
              that.setData({
                orderDetailName: res.data.data.logistics.shipperName,
                orderDetailNumber: res.data.data.logistics.trackingNumber,
                apiwiliuList: res.data.data.logisticsTraces
              });
            }else{
              that.setData({
                noneapiWuliu: true
              });
            }
          }
        }
      });
    }
  },
})
