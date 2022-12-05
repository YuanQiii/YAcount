// pages/mine/mine.js
import { callCloudFunction } from '../../utils/cloud_helper'
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog'
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    allAmount: 0,
    yearAmount: 0,
    yearExpenses: 0,
    userInfo: wx.getStorageSync('userInfo'),
    popupShow: false,
    email: '',
    type: '',
    emailList: [],

    value: '',
    label: '邮箱',
    placeholder: '请输入邮箱',
    btnText: '发送验证码',
    token: wx.getStorageSync('token')
  },

  // 登录
  handleLogin() {

    getApp().globalData.isUpdate = true
    
    callCloudFunction('login').then(res => {
      this.setData({
        userInfo: res
      })
      if (wx.getStorageSync('token')) {
        callCloudFunction('getBillStatistic').then(res => {
          console.log(res);
          let { allAmount, yearAmount, yearExpenses } = res.result
          this.setData({
            allAmount,
            yearAmount,
            yearExpenses
          })
        })
        this.getEmailList()
      }
    })
  },

  handleLogout() {
    Dialog.confirm({
      message: '是否确定退出登录？',
      showCancelButton: true,
      selector: '#mine-dialog'
    }).then(() => {
      this.logout()
    });
  },

  // 登出
  logout() {
    getApp().globalData.isUpdate = true
    this.setData({
      userInfo: {},
      allAmount: 0,
      yearAmount: 0,
      yearExpenses: 0,
      emailList: [],
      email: '',
      value: '',
      type: '',
      label: '邮箱',
      placeholder: '请输入邮箱',
      btnText: '发送验证码',
    })
    wx.clearStorageSync()
    Toast.success({
      selector: '#mine-toast',
      duration: 500
    });
    wx.reLaunch({
      url: 'pages/mine/mine',
    })
  },

  handleEmail() {
    this.setData({
      popupShow: true
    })
  },

  handleBtnClick() {
    if (this.data.type == 'register') {
      let reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (reg.test(this.data.value)) {
        callCloudFunction('addEmail', { type: this.data.type, email: this.data.value }).then(res => {
          this.onShow()
          this.setData({
            email: this.data.value,
            type: 'check',
            label: '验证码',
            placeholder: '请输入验证码',
            btnText: '确定',
            value: ''
          })
        })

      } else {
        Toast({
          message: '请输入正确的邮箱',
          position: 'bottom',
          selector: '#mine-toast',
        });
      }
    } else {
      callCloudFunction('addEmail', { type: this.data.type, code: this.data.value }).then(res => {
        if (res.result.flag) {
          this.onShow()
          this.setData({
            email: '',
            value: '',
            type: '',
            label: '邮箱',
            placeholder: '请输入邮箱',
            btnText: '发送验证码',
            popupShow: false
          })
          callCloudFunction('getEmail').then(res => {
            console.log(res);
          })
        } else {
          Toast({
            message: '请输入正确的验证码',
            position: 'bottom',
            selector: '#mine-toast',
          });
          this.setData({
            value: ''
          })
        }
      })
    }
  },

  getEmailList() {
    callCloudFunction('getEmail').then(res => {
      this.setData({
        emailList: res.result.emailList.data
      })
    })
  },

  handleOverlay() {
    this.setData({
      popupShow: false,
    })
  },

  handleAdd() {
    this.setData({
      type: 'register'
    })
  },

  handleClose() {
    this.setData({
      popupShow: false,
    })
  },

  handleBack() {
    this.setData({
      type: ''
    })
  },




  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (wx.getStorageSync('token')) {
      callCloudFunction('getBillStatistic').then(res => {
        console.log(res);
        let { allAmount, yearAmount, yearExpenses } = res.result
        this.setData({
          allAmount,
          yearAmount,
          yearExpenses
        })
      })
      this.getEmailList()
    }
  },



  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (wx.getStorageSync('token')) {
      callCloudFunction('getBillStatistic').then(res => {
        console.log(res);
        let { allAmount, yearAmount, yearExpenses } = res.result
        this.setData({
          allAmount,
          yearAmount,
          yearExpenses
        })
      })
      this.getEmailList()
    }
    console.log(this.data.userInfo);
    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})