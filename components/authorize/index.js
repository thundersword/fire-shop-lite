var app = getApp();
Component({
	properties: {
		isHidden: {
			type: Boolean,
			value: true,
		}
	},
	lifetimes:{
		attached(){
			this.checkLoginStatus()
		}
	},
	methods:{
		checkLoginStatus(){
			const that = this
			wx.getSetting({
				success(res) {
					console.log(res)
					if (res.authSetting['scope.userInfo']){
						that.login()
					}else{
						console.log('未授权')
					}
				}
			})
		},
		login(){
			
		}
	}
})