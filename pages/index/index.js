//index.js
//获取应用实例
const app = getApp()

Page({
	data: {
		indicatorDots: true,
		autoplay: true,
		interval: 6000,
		duration: 800,
		swiperCurrent: 0,
		iphone:false,
		loadingHidden: false, // loading
		wxlogin: true,
		loadingMoreHidden: true,
		showSearch: true,
	},
	onShow(){
		var that = this
		// app.fadeInOut(this,'fadeAni',0)
		setTimeout(function () {
		  if (app.globalData.usinfo == 0) {
		    that.setData({
		      wxlogin: false
		    })
		    wx.hideTabBar();
		  }
		}, 800)
		//获取购物车商品数量
		app.getShopCartNum()
	},
	onLoad: function() {
		var that = this;
		app.fadeInOut(this,'fadeAni',0)
		if (app.globalData.iphone == true) {
			that.setData({
				iphone: true
			})
		}
		//首页顶部Logo
		wx.request({
			url: app.globalData.urls + '/banner/list',
			data: {
				type: 'toplogo'
			},
			success: function(res) {
				if (res.data.code == 0) {
					that.setData({
						toplogo: res.data.data[0].picUrl,
						topname: wx.getStorageSync('mallName')
					});
				}
			}
		})
		//首页幻灯片
		wx.request({
			url: app.globalData.urls + '/banner/list',
			data: {
				type: 'home'
			},
			success: function(res) {
				if (res.data.code == 0) {
					that.setData({
						banners: res.data.data
					});
				}
			}
		})
		//4个功能展示位
		wx.request({
		  url: app.globalData.urls + '/banner/list',
		  data: {
		    key: 'mallName',
		    type: 'sale'
		  },
		  success: function (res) {
		    if (res.data.code == 0) {
		      that.setData({
		        sales: res.data.data
		      });
		    }
		  }
		})
		//4个热销广告位
		wx.request({
		  url: app.globalData.urls + '/banner/list',
		  data: {
		    type: 'hot'
		  },
		  success: function (res) {
		    if (res.data.code == 0) {
		      that.setData({
		        hot: res.data.data
		      });
		    }
		  }
		})
		//获取推荐商品信息
		wx.request({
		  url: app.globalData.urls + '/config/get-value',
		  data: {
		    key: 'topgoods'
		  },
		  success: function (res) {
		    if (res.data.code == 0) {
		      that.setData({
		        topgoods: res.data.data
		      });
		      wx.request({
		        url: app.globalData.urls + '/shop/goods/list',
		        data: {
		          recommendStatus: 1,
		          pageSize: 10
		        },
		        success: function (res) {
		          that.setData({
		            goods: [],
		            loadingMoreHidden: true
		          });
		          var goods = [];
		          if (res.data.code != 0 || res.data.data.length == 0) {
		            that.setData({
		              loadingMoreHidden: false,
		            });
		            return;
		          }
		          for (var i = 0; i < res.data.data.length; i++) {
		            goods.push(res.data.data[i]);
		          }
		          that.setData({
		            goods: goods,
		          });
		        }
		      })
		    }
		  }
		})
	},
	swiperchange: function(e) {
		this.setData({
			swiperCurrent: e.detail.current
		})
	},
	toDetailsTap: function(e) {
		wx.navigateTo({
			url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
		})
	},
	tapBanner: function(e) {
		if (e.currentTarget.dataset.id != 0) {
			wx.navigateTo({
				url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
			})
		}
	},
	tapSales: function (e) {
	  if (e.currentTarget.dataset.id != 0) {
	    wx.navigateTo({
	      url: e.currentTarget.dataset.id
	    })
	  }
	},
	userlogin: function (e) {
	  var that = this;
	  var iv = e.detail.iv;
	  var encryptedData = e.detail.encryptedData;
	  wx.login({
	    success: function (wxs) {
	      wx.request({
	        url: app.globalData.urls + '/user/wxapp/register/complex',
	        data: {
	          code: wxs.code,
	          encryptedData: encryptedData,
	          iv: iv
	        },
	        success: function (res) {
	          if (res.data.code != 0) {
	            wx.showModal({
	              title: '温馨提示',
	              content: '需要您的授权，才能正常使用哦～',
	              showCancel: false,
	              success: function (res) { }
	            })
	          } else {
	            that.setData({ wxlogin: true })
	            app.login();
	            wx.showToast({
	              title: '授权成功',
	              duration: 2000
	            })
	            app.globalData.usinfo = 1;
	            wx.showTabBar();
	          }
	        }
	      })
	    }
	  })
	},
	onPageScroll: function(t) {
		if(t.scrollTop >= 180){
			wx.setNavigationBarColor({
				frontColor: '#000000',
				backgroundColor: '#ffffff'
			})
			app.fadeInOut(this,'fadeAni',1)
		}else{
			wx.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#ffffff'
			})
			app.fadeInOut(this,'fadeAni',0)
		}
	}
})
