const app = getApp();
var api = require('../../config/api.js');
var util = require('../../utils/util.js');
Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    var that = this;
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              //从数据库获取用户信息
              that.queryUsreInfo();
              //用户已经授权过
              wx.switchTab({
                url: '/pages/index/index'
              })
            }
          });
        }
      }
    })
  },
  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      app.globalData.userInfo = e.detail.userInfo;
      //插入登录的用户的相关信息到数据库
      let that = this;
      that.insertUserInfo(e);
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  },
  //保存用户信息
  insertUserInfo: function (res){
    console.log(app.globalData);
    let that = this;
    var data = {
      rawData:  res.detail.rawData,
      encryptedData: res.detail.encryptedData,
      iv: res.detail.iv,
      signature: res.detail.signature,
      code: app.globalData.code
    };
    util.request(api.UserAdd, data, 'get').then(function (res) {
      if (res.code === 200) {
        console.log("小程序登录用户信息保存成功！");
        //存储用户信息
        app.globalData.openid = res.data.openid
        wx.setStorageSync('token', res.data.auth_token);
        app.globalData.auth_token = res.data.auth_token
        console.log(res.data)
        //授权成功后，跳转进入小程序首页(正式环境应该在这里)
        wx.switchTab({
          url: '/pages/index/index'
        })
      }else{
      	console.log("小程序登录失败！");
        //that.insertUserInfo(data);
      }
    });
    //授权成功后，跳转进入小程序首页(展示效果用)
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  //获取用户信息接口
  queryUsreInfo: function () {
  	wx.request({
      url: api.AuthUserInfo,
      header: {
        'Content-Type': 'application/json',
        //请求头可以携带Token
        'auth_token': wx.getStorageSync('token')
      },
      method: "GET",
      success(res) {
        let code = res.statusCode
        if (code == '200') {
          let data = res.data
          app.globalData.userInfo = res.data;
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
  },
})
