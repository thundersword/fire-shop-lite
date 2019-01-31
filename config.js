var config = {
	 //链接源，一般不需要修改
	'url': 'https://api.it120.cc/',
	
	//这里填写你自己的工厂个性域名，工厂后台首页可以看到
	'subDomain': 'fireshop',
	
	//版本标识，这里不需要修改
	'version': '1.0.0',
	//订单自动关闭时间，默认60分钟，以分为单位，填0则不自动关闭订单
	'closeorder': '60', 
	//关闭订单模版ID，这里填写你自己的模版消息ID
	'closeorderkey': 'ihjZ2LiMQUH-G9UR9B2TDI0xQWRb0m4IT5_8s1nbZS0',
	
	//发货提醒模版ID，这里填写你自己的模版消息ID
	'deliveryorderkey': 'HXtRlV3djH9MFVOm_kjMQv4GLXC4q7EdyUc9XUzOEgk',
	
	//评价模版提醒ID，这里填写你自己的模版消息ID
	'assessorderkey': 'SbpRcF3FQnK9qIieYTHpQYYvuar6xOqVfs_6bNuxtlw',
	
	//已评价模版提醒ID，这里填写你自己的模版消息ID
	'successorderkey': 'uySaxE9mAJYTvsshRibxSLCxFA1beXXf-USc7ftD_pA'
}
module.exports = config