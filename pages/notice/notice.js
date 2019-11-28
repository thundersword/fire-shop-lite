const WxParse = require('../../wxParse/wxParse.js');
const app = getApp()
const WXAPI = require('apifm-wxapi')
Page({
	data: {

	},
	onLoad: function(e) {
		WXAPI.noticeDetail(e.id).then(res => {
			if (res.code == 0) {
				this.setData({
					notice: res.data
				});
				WxParse.wxParse('article', 'html', res.data.content, this, 5);
			}
		})
	}
})
