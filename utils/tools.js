const WXAPI = require('apifm-wxapi')

// 显示购物车tabBar的Badge
function showTabBarBadge() {
	const token = wx.getStorageSync('token')
	if (!token) {
		return
	}
	WXAPI.shippingCarInfo(token).then(res => {
		if (res.code == 700) {
			wx.removeTabBarBadge({
				index: 2
			});
		}
		if (res.code == 0) {
			if (res.data.number == 0) {
				wx.removeTabBarBadge({
					index: 2
				});
			} else {
				wx.setTabBarBadge({
					index: 2,
					text: `${res.data.number}`
				});
			}
		}
	})
}
//判断字符串是否在数组中
function isStrInArray(item, arr) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == item) {
			return true;
		}
	}
	return false;
}
module.exports = {
	showTabBarBadge: showTabBarBadge,
	isStrInArray: isStrInArray,
}
