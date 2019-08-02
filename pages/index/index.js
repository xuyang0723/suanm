const app = getApp();
var api = require('../../config/api.js');
var util = require('../../utils/util.js');
Page({
	data: {
		userInfos: {},
	},
	onLoad () {
		var that = this;
		var status = false;
		// 获取用户信息
		wx.getSetting({
			success: res => {
				if(res.authSetting['scope.userInfo']) {
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
					wx.getUserInfo({
						success: res => {
							//可以将 res 发送给后台解码出 unionId;
							that.setData({
								userInfos: JSON.parse(res.rawData)
							})
							// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
							// 所以此处加入 callback 以防止这种情况
							if(that.userInfoReadyCallback) {
								that.userInfoReadyCallback(res)
							}
						}
					})
				} else {
					wx.reLaunch({
						url: '/pages/authorize/authorize',
					})
				}
			}
		});
	},
	onShow: function() {
		wx.setNavigationBarTitle({
			title: ''
		});
	},
	about: function(e) {
		wx.showModal({
			title: '提示',
			content: app.globalData.about || '',
			showCancel: false
		});
	},
	//下拉刷新（仅仅为示例，不是真实逻辑）
	onPullDownRefresh() {
		let that = this;
		wx.showNavigationBarLoading() //在标题栏中显示加载
		//刷新数据，刷新完成加载下边两个事件
		wx.request({
      url: api.AuthUserInfo,
      header: {
        //请求头可以携带Token
        'auth_token': wx.getStorageSync('token')
      },
      method: "GET",
      success(res) {
        let code = res.statusCode
        if (code == '200') {
          let data = res.data.data
          that.setData({
            userInfos : data
          })
          app.globalData.userInfo = data
					wx.hideNavigationBarLoading() //完成停止加载
					wx.stopPullDownRefresh() //停止下拉刷新
        } else {
          console.log(res.errMsg)
        }
      },
      fail(res) {
        console.log(res.statusCode)
      }
    })
	}
});