// pages/search/search.js
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		search: true,
		nonehidden: true,
		searchidden: true,
		recentSearch: [],
		searchValue: '',
	},
	getRecentSearch: function() {
		let recentSearch = wx.getStorageSync('recentSearch');
		this.setData({
			recentSearch
		});
	},
	clearHistory:function(){
		wx.clearStorageSync('recentSearch')
		this.setData({
			recentSearch:[]
		})
	},
	goSearch:function(e){
		this.search(e)
	},
	search: function(e) {
		let that = this
		let keywords;
		e.detail.value? keywords= e.detail.value: keywords = e.currentTarget.dataset.text,
		that.data.searchValue = keywords;
		if (that.data.searchValue) {
			// 记录最近搜索
			let recentSearch = wx.getStorageSync('recentSearch') || [];
			if(!app.isStrInArray(keywords,recentSearch)){
				recentSearch.unshift(that.data.searchValue);
				wx.setStorageSync('recentSearch', recentSearch)
				that.setData({
					recentSearch:recentSearch
				})
			}
		}

		wx.request({
			url: app.globalData.urls + '/shop/goods/list',
			data: {
				nameLike: keywords
			},
			success: function(res) {
				if (res.data.code == 0) {	
					var searchs = [];
					for (var i = 0; i < res.data.data.length; i++) {
						searchs.push(res.data.data[i]);
					}
					that.setData({
						searchs: searchs,
						searchidden: false,
						nonehidden: true
					});
				} else {
					that.setData({
						searchidden: true,
						nonehidden: false
					});
				}
			}
		})

	},
	searchfocus: function() {
		this.setData({
			search: false,
			searchinput: true
		})
	},
	searchclose: function() {
		this.setData({
			search: true,
			searchinput: false
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		this.getRecentSearch();
		console.log(wx.getStorageSync('recentSearch'))
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})
