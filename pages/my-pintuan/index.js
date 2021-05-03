// pages/my-pintuan/index.js
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
Page({

  /**
   * 页面的初始数据
   */
  data: {
	ptGoodsList:[],
	currentPage:1,
	pageSize: 10,
	loadingHidden: true,
	wxlogin: true
  },
  afterAuth() {
  	this.getPtGoodsList(false)
  },
  closeAuth(){
  	wx.navigateBack()
  },
  getPtGoodsList(append){
	  WXAPI.pingtuanMyJoined({
		  token: wx.getStorageSync('token'),
		  page:this.data.currentPage,
		  pageSize: this.data.pageSize
	  }).then( res => {
		  if (res.code == 404 || res.code == 700) {
		  	let newData = {
		  		loadingHidden: false
		  	}
		  	if (!append) {
		  		newData.ptGoodsList = []
		  	}
		  	this.setData(newData);
		  	return
		  }
		  let goods = []
		  if (append) {
		  	goods = this.data.ptGoodsList
		  }
		  for (let i = 0; i < res.data.result.length; i++) {
		  	goods.push(res.data.result[i]);
		  }
		  this.setData({
		  	loadingHidden: true,
		  	ptGoodsList: goods
		  });
	  })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	// this.getPtGoodsList(false)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
	  AUTH.checkHasLogined().then(isLogined => {
	  	this.setData({
	  		wxlogin: isLogined
	  	})
	  	if(isLogined){
	  		this.afterAuth()
	  	}
	  })

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
	this.setData({
		currentPage: this.data.currentPage + 1
	});
	this.getPtGoodsList(true)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})