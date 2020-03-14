module.exports = {
  version: "2.0.0",
  note: '增加拼团砍价和分销,优化UI', // 这个为版本描述，无需修改
  subDomain: "fireshop", // 根据教程 https://www.yuque.com/apifm/doc/qr6l4m 查看你自己的 subDomain
  shareProfile: '百款精品商品，总有一款适合您', // 首页转发的时候话术
  goodsDetailSkuShowType: 0, // 0 为点击立即购买按钮后出现规格尺寸、数量的选择； 1为直接在商品详情页面显示规格尺寸、数量的选择，而不弹框
  cateLevel:2//商品分类级别，可选值为1和2，默认二级分类
}