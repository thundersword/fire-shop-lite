const app = getApp()
const WXAPI = require('apifm-wxapi')
const regeneratorRuntime = require('../../utils/runtime')
Page({
	data: {
		provinces: [],
		citys: [],
		districts: [],
		selProvince: '请选择',
		selCity: '请选择',
		selDistrict: '请选择',
		selProvinceIndex: 0,
		selCityIndex: 0,
		selDistrictIndex: 0,
		pickerRegionRange: [],
		pickerSelect: [0, 0, 0],
		showRegionStr: '请选择',
		token: null,
		id: 0,
	},
	afterAuth(e) {
		this.setData({
			token: e.detail
		})
		if (this.data.id) this.getAddressDetail(this.data.id)
	},
	initRegionPicker() {
		WXAPI.province().then(res => {
			if (res.code === 0) {
				let _pickerRegionRange = []
				_pickerRegionRange.push(res.data)
				_pickerRegionRange.push([{
					name: '请选择'
				}])
				_pickerRegionRange.push([{
					name: '请选择'
				}])
				this.data.pickerRegionRange = _pickerRegionRange
				this.bindcolumnchange({
					detail: {
						column: 0,
						value: 0
					}
				})
			}
		})
	},
	bindcolumnchange: function(e) {
		const column = e.detail.column
		const index = e.detail.value
		console.log('eeee:', e)
		const regionObject = this.data.pickerRegionRange[column][index]
		console.log('bindcolumnchange', regionObject)
		if (column === 2) {
			this.setData({
				pickerRegionRange: this.data.pickerRegionRange
			})
			return
		}
		if (column === 1) {
			this.data.pickerRegionRange[2] = [{
				name: '请选择'
			}]
		}
		if (column === 0) {
			this.data.pickerRegionRange[1] = [{
				name: '请选择'
			}]
			this.data.pickerRegionRange[2] = [{
				name: '请选择'
			}]
		}
		// // 后面的数组全部清空
		// this.data.pickerRegionRange.splice(column+1)
		// 追加后面的一级数组
		WXAPI.nextRegion(regionObject.id).then(res => {
			if (res.code === 0) {
				this.data.pickerRegionRange[column + 1] = res.data
			}
			this.bindcolumnchange({
				detail: {
					column: column + 1,
					value: 0
				}
			})
		})
	},
	bindCancel: function() {
		wx.navigateBack({})
	},
	bindChange: function(e) {
		console.log(e)
		const pObject = this.data.pickerRegionRange[0][e.detail.value[0]]
		const cObject = this.data.pickerRegionRange[1][e.detail.value[1]]
		const dObject = this.data.pickerRegionRange[2][e.detail.value[2]]
		const showRegionStr = pObject.name + cObject.name + dObject.name
		this.setData({
			pObject: pObject,
			cObject: cObject,
			dObject: dObject,
			showRegionStr: showRegionStr
		})
	},
	bindSave: function(e) {
		const that = this;
		let linkMan = e.detail.value.linkMan;
		let address = e.detail.value.address;
		let mobile = e.detail.value.mobile;
		let code = e.detail.value.code;

		if (linkMan == "") {
			wx.showModal({
				title: '提示',
				content: '请填写联系人姓名',
				showCancel: false
			})
			return
		}
		if (mobile == "") {
			wx.showModal({
				title: '提示',
				content: '请填写手机号码',
				showCancel: false
			})
			return
		}
		if (!this.data.pObject || !this.data.cObject) {
			wx.showModal({
				title: '提示',
				content: '请选择地区',
				showCancel: false
			})
			return
		}

		if (address == "") {
			wx.showModal({
				title: '提示',
				content: '请填写详细地址',
				showCancel: false
			})
			return
		}
		if (code == "") {
			wx.showModal({
				title: '提示',
				content: '请填写邮编',
				showCancel: false
			})
			return
		}
		let apiAddoRuPDATE = "add";
		let apiAddid = that.data.id;
		if (apiAddid) {
			apiAddoRuPDATE = "update";
		} else {
			apiAddid = 0;
		}
		WXAPI.addAddress({
			token: this.data.token,
			id: apiAddid,
			provinceId: this.data.pObject.id,
			cityId: this.data.cObject.id,
			districtId: this.data.dObject ? this.data.dObject.id : '',
			linkMan: linkMan,
			address: address,
			mobile: mobile,
			code: code,
			isDefault: 'true'
		}).then(res => {
			if (res.code != 0) {
				// 登录错误 
				wx.hideLoading();
				wx.showModal({
					title: '失败',
					content: res.msg,
					showCancel: false
				})
				return;
			}
			// 跳转到结算页面
			wx.navigateBack({})
		})
	},
	getAddressDetail(id) {
		wx.showLoading()
		WXAPI.addressDetail(this.data.token, id).then(res => {
			wx.hideLoading();
			if (res.code == 0) {
				this.setData({
					addressData: res.data.info,
					showRegionStr: res.data.info.provinceStr + res.data.info.cityStr + res.data.info.areaStr
				});
				this.initRegionDB(res.data.info.provinceStr, res.data.info.cityStr, res.data.info.areaStr);
				return;
			} else {
				wx.showModal({
					title: '提示',
					content: '无法获取快递地址数据',
					showCancel: false
				})
			}
		})
	},
	onLoad: function(e) {
		var that = this;
		if (app.globalData.iphone == true) {
			that.setData({
				iphone: 'iphone'
			})
		}
		// this.initCityData(1);
		this.initRegionPicker();
		var id = e.id;
		if (id) {
			this.setData({
				id: id
			})
		}
	},
	setDBSaveAddressId: function(data) {
		var retSelIdx = 0;
		for (var i = 0; i < commonCityData.cityData.length; i++) {
			if (data.provinceId == commonCityData.cityData[i].id) {
				this.data.selProvinceIndex = i;
				for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
					if (data.cityId == commonCityData.cityData[i].cityList[j].id) {
						this.data.selCityIndex = j;
						for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
							if (data.districtId == commonCityData.cityData[i].cityList[j].districtList[k].id) {
								this.data.selDistrictIndex = k;
							}
						}
					}
				}
			}
		}
	},
	async initRegionDB(pname, cname, dname) {
		this.data.showRegionStr = pname + cname + dname
		let pObject = undefined
		let cObject = undefined
		let dObject = undefined
		if (pname) {
			const index = this.data.pickerRegionRange[0].findIndex(ele => {
				return ele.name == pname
			})
			console.log('pindex', index)
			if (index >= 0) {
				this.data.pickerSelect[0] = index
				pObject = this.data.pickerRegionRange[0][index]
			}
		}
		if (!pObject) {
			return
		}
		const _cRes = await WXAPI.nextRegion(pObject.id)
		if (_cRes.code === 0) {
			this.data.pickerRegionRange[1] = _cRes.data
			if (cname) {
				const index = this.data.pickerRegionRange[1].findIndex(ele => {
					return ele.name == cname
				})
				if (index >= 0) {
					this.data.pickerSelect[1] = index
					cObject = this.data.pickerRegionRange[1][index]
				}
			}
		}
		if (!cObject) {
			return
		}
		const _dRes = await WXAPI.nextRegion(cObject.id)
		if (_dRes.code === 0) {
			this.data.pickerRegionRange[2] = _dRes.data
			if (dname) {
				const index = this.data.pickerRegionRange[2].findIndex(ele => {
					return ele.name == dname
				})
				if (index >= 0) {
					this.data.pickerSelect[2] = index
					dObject = this.data.pickerRegionRange[2][index]
				}
			}
		}
		this.setData({
			pickerRegionRange: this.data.pickerRegionRange,
			pickerSelect: this.data.pickerSelect,
			showRegionStr: this.data.showRegionStr,
			pObject: pObject,
			cObject: cObject,
			dObject: dObject
		})
	},
	deleteAddress: function(e) {
		var that = this;
		var id = e.currentTarget.dataset.id;
		wx.showModal({
			title: '提示',
			content: '确定要删除该收货地址吗？',
			success: function(res) {
				if (res.confirm) {
					WXAPI.deleteAddress(that.data.token, id).then(function() {
						wx.navigateBack({})
					})
				} else {
					console.log('用户点击取消')
				}
			}
		})
	},
	readFromWx: function() {
		const that = this
		wx.chooseAddress({
			success: function(res) {
				console.log(res)
				that.initRegionDB(res.provinceName, res.cityName, res.countyName)
				that.setData({
					wxaddress: res
				});
			}
		})
	}
})
