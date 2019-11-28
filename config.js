module.exports = {
  version: "1.1.0",
  note: '使用api工厂小程序sdk',
  subDomain: "fireshop", // https://admin.it120.cc 登录后台首页的专属域名
  appid: "wx20828d207755dfc8", // 您的小程序的appid，购物单功能需要使用
  shareProfile: '百款精品商品，总有一款适合您', // 首页转发的时候话术
  requireBindMobile: false, // 是否强制绑定手机号码才能使用
  // kanjiaRequirePlayAd: true // 是否必须要观看视频广告后才可以砍价
  orderExpireTime:60,
  //关闭订单模版ID，这里填写你自己的模版消息ID
  closeOrderkey: 'ihjZ2LiMQUH-G9UR9B2TDI0xQWRb0m4IT5_8s1nbZS0',
  
  //发货提醒模版ID，这里填写你自己的模版消息ID
  deliveryOrderkey: 'HXtRlV3djH9MFVOm_kjMQv4GLXC4q7EdyUc9XUzOEgk',
  
  //评价模版提醒ID，这里填写你自己的模版消息ID
  assessOrderkey: 'SbpRcF3FQnK9qIieYTHpQYYvuar6xOqVfs_6bNuxtlw',
  
  //已评价模版提醒ID，这里填写你自己的模版消息ID
  successOrderkey: 'uySaxE9mAJYTvsshRibxSLCxFA1beXXf-USc7ftD_pA'
}