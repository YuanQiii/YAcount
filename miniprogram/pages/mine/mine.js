// pages/mine/mine.js
import {callCloudFunction} from '../../utils/cloud_helper'
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: wx.getStorageSync('userInfo'),
  },

  // 登录
  login(){
    callCloudFunction('login').then(res => {
      this.setData({
        userInfo: res
      })
    })
  },

  handleLogout(){
    Dialog.confirm({
      message: '是否确定退出登录？',
      showCancelButton: true,
      selector: '#mine-dialog'
    }).then(() => {
      this.logout()
    });
  },

  // 登出
  logout(){
    this.setData({
      userInfo: {}
    })
    wx.clearStorageSync()
    Notify({
      type: 'primary',
      message: '登出成功',
      duration: 1000,
      selector: '#mine-notify'
    });
    wx.reLaunch({
      url: 'pages/mine/mine',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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