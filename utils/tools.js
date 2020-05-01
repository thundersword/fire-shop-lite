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
// 返回api工厂一样格式的当前时间
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}


module.exports = {
	showTabBarBadge: showTabBarBadge,
	isStrInArray: isStrInArray,
	formatTime: formatTime,
}
