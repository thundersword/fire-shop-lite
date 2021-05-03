const AUTH = require('../../utils/auth')
const WXAPI = require('apifm-wxapi')
const CONFIG = require('../../config.js')
Page({
	data: {
		tabArr: {
			curHdIndex: 0,
			curBdIndex: 0
		},
		kjGoodsList: [],
		kjhelp: [],
		pics: {},
		helps: {},
		wxlogin: true
	},
	onShow(){
		AUTH.checkHasLogined().then(isLogined => {
			this.setData({
				wxlogin: isLogined
			})
			if(isLogined){
				this.doneShow()
			}
		})
	},
	doneShow() {
		var that = this;
		wx.request({
			url: 'https://api.it120.cc/' + CONFIG.subDomain + '/shop/goods/kanjia/list',
			success: function(res) {
				console.log(res)
				if (res.data.code == 0 && res.data.data.result.length > 0) {
					var kanjiaid = []
					var goodsid = []
					for (var i = 0; i < res.data.data.result.length; i++) {
						kanjiaid.push(res.data.data.result[i].id);
						goodsid.push(res.data.data.result[i].goodsId)
						that.getgoods(res.data.data.result[i].goodsId)
					}
					that.mykanjia(kanjiaid)
					that.kjhelp(kanjiaid)
				}
			}
		})
	},
	mykanjia: function(e) {
		var that = this;
		var kjGoodsList = [];
		for (var i = 0; i < e.length; i++) {
			var id = e[i]
			WXAPI.kanjiaMyJoinInfo(wx.getStorageSync('token'),id).then(res => {
				console.log(res)
				if (res.code == 0) {
					kjGoodsList.push(res.data)
					that.setData({
						kjGoodsList: kjGoodsList
					});
				}
			})
			// wx.request({
			//   url: app.globalData.urls + '/shop/goods/kanjia/my',
			//   data: {
			//     kjid: id,
			//     token: app.globalData.token
			//   },
			//   success: function (res) {

			//     if (res.data.code == 0) {
			//       kjgoods.push(res.data.data)
			//       that.setData({
			//         kjgoods: kjgoods
			//       });
			//     }
			//   }
			// })
		}
	},
	kjhelp: function(e) {
		var that = this;
		console.log(wx.getStorageSync('token'))
		for (var i = 0; i < e.length; i++) {
			var id = e[i]
			WXAPI.kanjiaHelpDetail(wx.getStorageSync('token'),id,wx.getStorageSync('uid')).then( res => {
				console.log(res)
				if (res.code == 0) {
					that.gethelpkj(id)
					that.gethelpid(res.data.goodsId)
				}
			})
			// wx.request({
			// 	url: app.globalData.urls + '/shop/goods/kanjia/myHelp',
			// 	data: {
			// 		kjid: id,
			// 		token: app.globalData.token,
			// 		joinerUser: app.globalData.uid
			// 	},
			// 	success: function(res) {
			// 		if (res.data.code == 0) {
			// 			that.gethelpkj(id)
			// 			that.gethelpid(res.data.data.goodsId)
			// 		}
			// 	}
			// });
		}
	},
	gethelpkj: function(id) {
		var that = this
		var kjhelp = [];
		WXAPI.kanjiaDetail({
			kjid:id,
			joiner:wx.getStorageSync('uid')
		}).then(res =>{
			if (res.code == 0) {
				kjhelp.push(res.data.kanjiaInfo)
				that.setData({
					kjhelp: kjhelp
				});
			}
		})
		// wx.request({
		// 	url: app.globalData.urls + '/shop/goods/kanjia/info',
		// 	data: {
		// 		kjid: id,
		// 		joiner: app.globalData.uid
		// 	},
		// 	success: function(res) {
		// 		if (res.data.code == 0) {
		// 			kjhelp.push(res.data.data.kanjiaInfo)
		// 			that.setData({
		// 				kjhelp: kjhelp
		// 			});
		// 		}
		// 	}
		// })
	},
	getgoods: function(id) {
		var that = this;
		var pics = that.data.pics;
		WXAPI.goodsDetail(id).then( res => {
			if (res.code == 0) {
				pics[id] = res.data.basicInfo
				that.setData({
					pics: pics,
				});
			}
		})
		// wx.request({
		// 	url: app.globalData.urls + '/shop/goods/detail',
		// 	data: {
		// 		id: id
		// 	},
		// 	success: function(res) {
		// 		if (res.data.code == 0) {
		// 			pics[id] = res.data.data.basicInfo
		// 			that.setData({
		// 				pics: pics,
		// 			});
		// 		}
		// 	}
		// })
	},
	gethelpid: function(id) {

		var that = this;
		var helps = that.data.helps;
		WXAPI.goodsDetail(id).then(res => {
			if (res.code == 0) {
				helps[id] = res.data.basicInfo
				that.setData({
					helps: helps,
				});
			}
		})
		// wx.request({
		// 	url: app.globalData.urls + '/shop/goods/detail',
		// 	data: {
		// 		id: id
		// 	},
		// 	success: function(res) {
		// 		if (res.data.code == 0) {
		// 			helps[id] = res.data.data.basicInfo
		// 			that.setData({
		// 				helps: helps,
		// 			});
		// 		}
		// 	}
		// })
	},
	gokj: function(e) {
		var id = e.currentTarget.dataset.id
		WXAPI.kanjiaJoin({
			kjid:id,
			token:wx.getStorageSync('token')
		}).then( res => {
			if (res.code == 0) {
				wx.navigateTo({
					url: "/pages/goods-details/index?id=" + res.data.goodsId
			
				})
			} else {
				wx.showModal({
					title: '错误',
					content: res.msg,
					showCancel: false
				})
			}
		})
		// wx.request({
		// 	url: app.globalData.urls + '/shop/goods/kanjia/join',
		// 	data: {
		// 		kjid: id,
		// 		token: app.globalData.token
		// 	},
		// 	success: function(res) {
		// 		if (res.data.code == 0) {
		// 			wx.navigateTo({
		// 				url: "/pages/kanjia/index?kjId=" + res.data.data.kjId + "&joiner=" + res.data.data.uid + "&id=" + res.data
		// 					.data.goodsId

		// 			})
		// 		} else {
		// 			wx.showModal({
		// 				title: '错误',
		// 				content: res.data.msg,
		// 				showCancel: false
		// 			})
		// 		}
		// 	}
		// })
	},
	tabFun: function(e) {
		var _datasetId = e.target.dataset.id;
		var _obj = {};
		_obj.curHdIndex = _datasetId;
		_obj.curBdIndex = _datasetId;
		this.setData({
			tabArr: _obj
		});
	}

})
