//index.js
const app = getApp()
const db = wx.cloud.database();
var user = {};
var openid = "";
var orderList = [];

Page({
  data: {
    user: {},
    isCard: true,
    logged: false,
    takeSession: false,
    requestResult: '',
    swiperList: [{
      id: 0,
      type: 'image',
      url: 'https://wx2.sinaimg.cn/mw690/006tozhpgy1g03uqzlrfyj31dc0ww1g2.jpg'
      }, {
        id: 1,
        type: 'image',
        url: 'https://wx2.sinaimg.cn/mw690/006tozhpgy1g03ur2znb5j31dc0wwdw0.jpg'
      }],
    orderList: []
  },

  onLoad: function() {
    this.getOrderList();
  },
  
  getOrderList: function (){
    wx.cloud.callFunction({
      name: 'getOrder'
    })
      .then(res => {
        orderList = res.result.data;
        app.globalData.orderList = res.result.data;
      })
      .catch(console.error)
    console.log("Run Complete.")
    this.onGetOpenid()
  },

  upload: function () {
    var that = this;
    //var Time = util.formatTime(new Date());
    db.collection('user').doc(openid).get({//建立或者更新数据库信息
      success: function (res) {
        user = res.data.user;
        app.globalData.user = res.data.user;
        that.setData({
          orderList: orderList,
          user: user
        })
        // res.data 包含该记录的数据
        wx.showToast({
          title: '您已登录！',
        })
      },
      fail: function () {
        wx.getUserInfo({
          success: function (res){
            var userInfo = res.userInfo;
            var userTotal = { info: userInfo, orderID:[]};
            app.globalData.user = userTotal;
            user = userTotal;
            db.collection('user').add({
              data: {
                _id: openid,
                user: user
              }
            })
            that.setData({
              orderList: orderList,
              user: user
            })            
            wx.showToast({
              title: '您已注册！',
            })
          },
          fail: function (res) {
            wx.showToast({
              title: '未授权，注册失败！',
            })
          }
        })
        // 获取用户信息
      }
    })
    
  },

  toFood: function(e){
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    var link = '../food/food?foodID=' + id;
    wx.navigateTo({
      url: link,
    })
  },

  toSelf: function(){
    wx.navigateTo({
      url: '../self/self',
    })
  },

  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        openid = res.result.openid;
        app.globalData.openid = res.result.openid;
        this.upload();
      },
      fail: err => {
        wx.showToast({
          title: '出了点问题',
        })
      }
    })
  },

})