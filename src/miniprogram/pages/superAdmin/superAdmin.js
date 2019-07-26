// miniprogram/pages/superAdmin/superAdmin.js
const db = wx.cloud.database();
var foodName = '';
var foodPrice = 0;
var foodStock = 0;
var currentOrderID = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedImage:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var checkList = [];
    var userList = [];
    var orderList = [];
    wx.cloud.callFunction({
      name: 'getDB',
      data: {
        dbName: "check"
      }
    })
      .then(res => {
          checkList = res.result.data;
        wx.cloud.callFunction({
          name: 'getDB',
          data: {
            dbName: "user"
          }
        })
          .then(res => {
            userList = res.result.data;
            wx.cloud.callFunction({
              name: 'getDB',
              data: {
                dbName: "order"
              }
            })
              .then(res => {
                orderList = res.result.data;
                that.setData({
                  checkList: checkList,
                  userList: userList,
                  orderList: orderList
                })
              })
              .catch(console.error);
          })
          .catch(console.error);
      })
      .catch(console.error);

  },

  showModal: function(options){
    currentOrderID = options.currentTarget.dataset.id;
    this.setData({
      modalName: options.currentTarget.dataset.modalname
    })
  },

  hideModal: function(){
    this.setData({
      modalName: null
    })
  },

  ChooseImage() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        this.setData({
          selectedImage: res.tempFilePaths
        })
      }
    });
  },

  ViewImage(e) {
    wx.previewImage({
      url: this.data.selectedImage,
      current: this.data.selectedImage
    });
  },

  DelImg(e) {
    wx.showModal({
      title: 'warning',
      content: 'Delete Pic?',
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      success: res => {
          this.setData({
            selectedImage: ''
          })
        }
    })
  },

  getName: function(e){
    foodName = e.detail.value;
  },
  
  getStock: function (e) {
    foodStock = e.detail.value;
  },

  getPrice: function (e) {
    foodPrice = e.detail.value;
  },

  addFood: function(){  
    var that = this;
    wx.showLoading({
      title: '正在新建菜品',
    })
    var imageID = "momage";
    for (var i = 0; i < 6; i++) {
      imageID += Number.parseInt(Math.random() * 10);
    }
    imageID += ".png";
    var foodID = "mofood";
    for (var i = 0; i < 6; i++) {
      foodID += Number.parseInt(Math.random() * 10);
    }
    wx.cloud.uploadFile({
      cloudPath: 'foodPics/' + imageID,
      filePath: this.data.selectedImage[0], // 文件路径
      success: res => {
        // get resource ID
        console.log(res.fileID)
        db.collection('order').add({
          data: {
            _id: foodID,
            name: foodName,
            price: foodPrice,
            stock: foodStock,
            imageURL:res.fileID,
            goodRateNum: 0,
            rateNum: 0
          },
          success: function(res){
            wx.hideLoading();
            that.hideModal();
            wx.showToast({
              title: '已上传',
            })
          }
        });
      },
      fail: err => {
        // handle error
      }
    })
  },

  addCover: function () {
    var that = this;
    wx.showLoading({
      title: '正在上传图片',
    })
    var imageID = "momage";
    for (var i = 0; i < 6; i++) {
      imageID += Number.parseInt(Math.random() * 10);
    }
    imageID += ".png";
    wx.cloud.uploadFile({
      cloudPath: 'sodexPlaceHolder/' + imageID,
      filePath: this.data.selectedImage[0], // 文件路径
      success: res => {
        // get resource ID
        console.log(res.fileID)
        db.collection('sodexPlaceHolder').add({
          data: {
            url:res.fileID
          },
          success: function (res) {
            wx.hideLoading();
            that.hideModal();
            wx.showToast({
              title: '已上传',
            })
          }
        });
      },
      fail: err => {
        // handle error
      }
    })
  },

  // ListTouch触摸开始
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
  ListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },

  toGulag: function(options){
    wx.cloud.callFunction({
      name: 'updateDB',
      data: {
        dbName: "user",
        id: options.currentTarget.dataset.id,
        isAdmin: false,
        isPrisoner:true
      }
    }).then(res => {
      wx.showToast({
        title: 'Gulagged!',
      })
      wx.reLaunch({
        url: '../superAdmin/superAdmin',
      })
    }).catch(console.error);

  },

  deleteUser: function(options){
    wx.cloud.callFunction({
      name: 'deleteUser',
      data:{
        id: options.currentTarget.dataset.id
      }
    }).then(res => {
      wx.showToast({
        title: 'Deleted!',
      })
      wx.reLaunch({
        url: '../superAdmin/superAdmin',
      })
    }).catch (console.error);
  },
  
  promoteUser: function(options){
    wx.cloud.callFunction({
      name: 'updateDB',
      data: {
        dbName: "user",
        id: options.currentTarget.dataset.id,
        isAdmin: true,
        isPrisoner: false
      }
    }).then(res => {
      wx.showToast({
        title: 'Promoted!',
      })
      wx.reLaunch({
        url: '../superAdmin/superAdmin',
      })
    }).catch(console.error);
  },

  deleteCheck: function(options){
    wx.cloud.callFunction({
      name: 'deleteCheck',
      data: {
        id: options.currentTarget.dataset.id
      }
    }).then(res => {
      wx.showToast({
        title: 'Deleted!',
      })
      wx.reLaunch({
        url: '../superAdmin/superAdmin',
      })
    }).catch(console.error);
  },

  changeStock: function(){
    console.log(currentOrderID)
    wx.cloud.callFunction({
      name: 'updateDB',
      data: {
        dbName: "order",
        id: currentOrderID,
        stock:foodStock
      }
    }).then(res => {
      wx.showToast({
        title: 'Changed!',
      })
      wx.reLaunch({
        url: '../superAdmin/superAdmin',
      })
    }).catch(console.error);
  },

  deleteOrder: function(options){
    wx.cloud.callFunction({
      name: 'deleteOrder',
      data: {
        id: options.currentTarget.dataset.id
      }
    }).then(res => {
      wx.showToast({
        title: 'Deleted!',
      })
      wx.reLaunch({
        url: '../superAdmin/superAdmin',
      })
    }).catch(console.error);
  },

  onPullDownRefresh: function () {
    wx.reLaunch({
      url: '../superAdmin/superAdmin',
    })
  }

})