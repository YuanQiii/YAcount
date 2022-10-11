// pages/info/info.js
import { formatDate } from '../../utils/format_date'
import { callCloudFunction } from '../../utils/cloud_helper'



Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
  },

  handleUpdate() {
    let { amount, bill_date, category, mode, note, openid, record_date, _id } = this.data.info
    bill_date = bill_date.split(' ')[0]

    wx.reLaunch({
      url: `../record/record?amount=${amount}&bill_date=${bill_date}&category=${category}&mode=${mode}&note=${note}&openid=${openid}&record_date=${record_date}&_id=${_id}`,
    })
  },
  handleDelete() {
    callCloudFunction('delBill', {
      _id: this.data.info._id
    }).then(res => {
      wx.reLaunch({
        url: '../detail/detail',
      })
    })
  },

  getWeek(time) {
    let arr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return arr[new Date(time).getUTCDay()]
  },

  handleBillDate(datetime) {
    let temp = formatDate(datetime, 'YY-MM-DD')
    return `${temp} ${this.getWeek(datetime)}`
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel && eventChannel.on && eventChannel.on('acceptDataFromDetailPage', data => {
      console.log(data.data)
      data.data.bill_date = this.handleBillDate(data.data.bill_date)
      data.data.record_date = formatDate(data.data.record_date)
      this.setData({
        info: data.data
      })
    })
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