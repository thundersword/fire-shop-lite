// components/share/index.js
import Poster from 'wxa-plugin-canvas/poster/poster';
const WXAPI = require('apifm-wxapi');
const AUTH = require('../../utils/auth')
var posterConfig = {
	width: 750,
	height: 1334,
	backgroundColor: '#fff',
	debug: false,
	pixelRatio: 1,
	blocks: [{
			width: 690,
			height: 808,
			x: 30,
			y: 183,
			borderWidth: 2,
			borderColor: '#f0c2a0',
			borderRadius: 20,
		},
		{
			width: 634,
			height: 74,
			x: 59,
			y: 770,
			backgroundColor: '#fff',
			opacity: 0.5,
			zIndex: 100,
		},
	],
	texts: [{
			x: 113,
			y: 61,
			baseLine: 'middle',
			text: '伟仔',
			fontSize: 32,
			color: '#8d8d8d',
		},
		{
			x: 30,
			y: 113,
			baseLine: 'top',
			text: '发现一个好物，推荐给你呀',
			fontSize: 38,
			color: '#080808',
		},
		{
			x: 92,
			y: 810,
			fontSize: 38,
			baseLine: 'middle',
			text: '标题标题标题标题标题标题标题标题标题',
			width: 570,
			lineNum: 1,
			color: '#8d8d8d',
			zIndex: 200,
		},
		{
			x: 59,
			y: 895,
			baseLine: 'middle',
			text: [{
					text: '2人拼',
					fontSize: 28,
					color: '#ec1731',
				},
				{
					text: '¥99',
					fontSize: 36,
					color: '#ec1731',
					marginLeft: 30,
				}
			]
		},
		{
			x: 522,
			y: 895,
			baseLine: 'middle',
			text: '已拼2件',
			fontSize: 28,
			color: '#929292',
		},
		{
			x: 59,
			y: 945,
			baseLine: 'middle',
			fontSize: 28,
			color:'#929292',
			text: '错过再等一年'
		},
		{
			x: 360,
			y: 1065,
			baseLine: 'top',
			text: '长按识别小程序码',
			fontSize: 38,
			color: '#080808',
		},
		{
			x: 360,
			y: 1123,
			baseLine: 'top',
			text: '超值好货一起拼',
			fontSize: 28,
			color: '#929292',
		},
	],
	images: [{
			width: 62,
			height: 62,
			x: 30,
			y: 30,
			borderRadius: 62,
			url: '',
		},
		{
			width: 634,
			height: 634,
			x: 59,
			y: 210,
			url: '',
		},
		{
			width: 220,
			height: 220,
			x: 92,
			y: 1020,
			url: '',
		},
		{
			width: 750,
			height: 90,
			x: 0,
			y: 1244,
			url: '',
		}
	]
}
Component({
	options: {
		addGlobalClass: true
	},
	/**
	 * 组件的属性列表
	 */
	properties: {
		icon: {
			type: String,
			value: "../../images/share.png"
		},
		zIndex: {
			type: Number,
			value: 999999
		},
		goodsInfo:{
			type:Object,
			value:{}
		},
		footerImage: {
			type: String,
			value: "https://dcdn.it120.cc/2020/02/13/7eded213-ec31-4acf-8574-59cc5f188f4e.jpg"
		}
	},
	/**
	 * 组件的初始数据
	 */
	data: {
		show: false,
		posterConfig: {
			debug: false
		},
		showPic: false,
		dialogWidth: 550,
		dialogHeight: 0,//todo:是否可以高度充满屏幕,宽度自适应,避免底部按钮被遮盖?
	},
	lifetimes: {
		attached() {
			const dialogWidth = this.data.dialogWidth;
			const dialogHeight = posterConfig.height/posterConfig.width * dialogWidth
			this.setData({
				dialogHeight:dialogHeight
			})
		}
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		switchShow() {
			this.setData({
				show: !this.data.show
			})
		},
		hidePicModal(){
			this.setData({
				showPic: false
			})
		},
		saveToAlbum(){
			const that = this
			wx.saveImageToPhotosAlbum({
				filePath:this.data.poster,
				success() {
					wx.showToast({
						title:"保存成功",
						icon:"success"
					})
					that.setData({
						showPic: false
					})
				}
			})
		},
		async onCreatePoster() {
			AUTH.checkHasLogined( isLogined => {
				if(!isLogined){
					wx.showToast({
						title:"请先登录",
						icon:"none"
					})
					return
				}
			})
			const userInfoRes = await WXAPI.userDetail(wx.getStorageSync('token'));
			const userInfo = userInfoRes.data;
			posterConfig.images[0].url = userInfo.base.avatarUrl
			posterConfig.images[1].url = this.properties.goodsInfo.pic
			posterConfig.images[3].url = this.properties.footerImage
			posterConfig.texts[0].text = userInfo.base.nick
			posterConfig.texts[2].text = this.properties.goodsInfo.name
			if(this.properties.goodsInfo.pingtuan){
				posterConfig.texts[3].text[0].text = "拼团价"
				posterConfig.texts[3].text[1].text = "¥" + this.properties.goodsInfo.pingtuanPrice
			}else if(this.properties.goodsInfo.kanjia){
				posterConfig.texts[3].text[0].text = "砍价底价"
				posterConfig.texts[3].text[1].text = "¥" + this.properties.goodsInfo.kanjiaPrice
			}else{
				posterConfig.texts[3].text[0].text = "特惠价"
				posterConfig.texts[3].text[1].text = "¥" + this.properties.goodsInfo.minPrice
			}
			posterConfig.texts[4].text = "已售" + this.properties.goodsInfo.numberOrders + "件"
			posterConfig.texts[5].text = this.properties.goodsInfo.characteristic?this.properties.goodsInfo.characteristic:"手慢无"
			
			const qrcodeRes = await WXAPI.wxaQrcode({
				scene: this.properties.goodsInfo.id + ',' + wx.getStorageSync('uid'),
				page: 'pages/goods-details/index', //注意:如果已上线的小程序,如果此处路径在线上版本不存在的话也无法获取二维码
				is_hyaline: false,
				expireHours: 1
			})
			if (qrcodeRes.code != 0) {
				wx.showModal({
					title: '错误',
					content: '无法获取小程序码',
					showCancel: false,
				})
				return
			}
			posterConfig.images[2].url = qrcodeRes.data
			this.setData({
				posterConfig: posterConfig
			}, () => {
				Poster.create(true, this)
			})

		},
		onPosterSuccess(e) {
			const {
				detail
			} = e;
			
			this.setData({
				poster: detail,
				showPic: true,
				show: false
			})//未解之谜:为什么在这里set dialogHeight不生效???
		},
		onPosterFail(e) {
			console.log(e)
		}
	}
})
