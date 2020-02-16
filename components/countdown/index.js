const App = getApp();
import Countdown from '../../utils/wxCountdown.js'

Component({
	options: {
		addGlobalClass: true,
	},
	/**
	 * 组件的对外属性，是属性名到属性设置的映射表
	 */
	properties: {
		date: String,
	},

	/**
	 * 组件的内部数据，和 properties 一同用于组件的模板渲染
	 */
	data: {
		isOver: false
	},
	// 组件数据字段监听器，用于监听 properties 和 data 的变化
	observers: {

	},
	lifetimes: {
		attached: function() {
			const currentTime = new Date()
			const endTime = this.properties.date.replace("-","/")
			console.log(endTime)
			if(currentTime > endTime){
				wx.showToast({
					title:"已结束",
					icon:"none",
					duration:2000
				})
				this.setData({
					isOver: true
				})
			}else{
				Countdown.init(this.properties.date,'dateEnd',this)
			}
			
		},
		detached: function() {
			// 在组件实例被从页面节点树移除时执行
		},
	},
	/**
	 * 组件的方法列表
	 */
	methods: {

	}
})
