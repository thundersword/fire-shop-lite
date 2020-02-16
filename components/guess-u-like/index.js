// components/guess-u-like/index.js
const WXAPI = require('apifm-wxapi')
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		title: {
			type: String,
			value: "猜你喜欢"
		},
		// 排序规则：priceUp 价格升序，priceDown 价格倒序，ordersUp 销量升序，ordersDown 销量降序，addedUp 发布时间升序，addedDown 发布时间倒序 
		orderBy: {
			type: String,
			value: "ordersDown"
		},
		count: {
			type: Number,
			value: 4
		},
		show: {
			type: Boolean,
			value: true
		},
		goods: {
			type: String,
			value:'',
			observer:function(value){
				if(value != ''){
					this.getList(value)
				}else{
					this.getList()
				}
			}
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		list: []
	},
	lifetimes: {
		attached() {
			this.getList()
		}
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		getList(value) {
			if (value && value != "") {
				let goodsIdArr = value.split(',')
				let goodsArr = []
				for (let i = 0; i < goodsIdArr.length; i++) {
					WXAPI.goodsDetail(goodsIdArr[i]).then(res => {
						if (res.code == 0) {
							goodsArr.push(res.data.basicInfo);
						}
						this.setData({
							list: goodsArr,
						});
					})
				}
			} else {
				WXAPI.goods({
					recommendStatus: 1,
					orderBy: this.properties.orderBy,
					pageSize: this.properties.count
				}).then(res => {
					if (res.code == 0) {
						this.setData({
							list: res.data
						})
					}
				})
			}

		}
	}
})
