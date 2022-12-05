// pages/share/share.js
import * as echarts from '../../ec-canvas/echarts'
import { callCloudFunction } from '../../utils/cloud_helper'
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import {formatDate} from '../../utils/format_date'

let chart0 = null
let chart1 = null

// 初始化图表函数
function initChart0(canvas, width, height, dpr) {
  chart0 = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  })

  canvas.setChart(chart0)
  return chart0;
}
function initChart1(canvas, width, height, dpr) {
  chart1 = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  })

  canvas.setChart(chart1)
  return chart1;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ec0: {
      onInit: initChart0
    },
    ec1: {
      onInit: initChart1
    },
    amountAll0: 0,
    amountAll1: 0,
    popupShareShow: false,
    popupEmailShow: false,
    billList: {},
    startDatetime: 0,
    endDatetime: 0,
    openid: '',
    shareUrl: '',
    share: false,
    emailList: [],
    email: '934024048@qq.com',
    btnShow: false,
    fn: null
  },

  handleShare() {
    this.setData({
      popupShareShow: true
    })
  },
  chooseEmail(e) {
    this.setData({
      popupEmailShow: false,
      email: e.currentTarget.dataset.address
    })
    this.sendExcel()
  },
  sendExcel() {
    Toast.loading({
      forbidClick: true,
      selector: '#share-toast',
      duration: 0
    })
    callCloudFunction('sendExcel', {
      startDatetime: Number(this.data.startDatetime),
      date: Number(this.data.endDatetime),
      openid: this.data.openid,
      email: this.data.email,
      filename: `${formatDate(Number(this.data.startDatetime), 'YY年MM月')}账单明细`
    }).then(res => {
      console.log(res);
      Toast.success({
        forbidClick: true,
        selector: '#share-toast',
        duration: 1000
      });
    })
  },
  handleExcel() {
    this.setData({
      popupEmailShow: true
    })
  },
  handleSave() {
    const ecComponent0 = this.selectComponent('#mychart-dom-save0');
    const ecComponent1 = this.selectComponent('#mychart-dom-save1');
    let tempFilePath0 = ''
    let tempFilePath1 = ''

    // 先保存图片到临时的本地文件，然后存入系统相册
    let p1 = new Promise((resolve, reject) => {
      ecComponent0.canvasToTempFilePath({
        success: res => {
          console.log("tempFilePath:", res.tempFilePath)
          resolve(res.tempFilePath)
        },
        fail: res => console.log(res)
      });
    })

    let p2 = new Promise((resolve, reject) => {
      ecComponent1.canvasToTempFilePath({
        success: res => {
          console.log("tempFilePath:", res.tempFilePath)
          resolve(res.tempFilePath)
        },
        fail: res => console.log(res)
      });
    })

    Promise.all([p1, p2]).then(res => {
      res.forEach(element => {
        wx.saveImageToPhotosAlbum({
          filePath: element,
          success: function () {
            console.log('保存图片的地址');
          },
          fail: function (err) {
            console.log('图片保存失败了', err);
          },
        });
      });
    })


  },
  handleOverlay() {
    this.setData({
      popupShareShow: false,
      popupEmailShow: false
    })
  },

  getWeek(time) {
    let arr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return arr[new Date(time).getUTCDay()]
  },
  getBillValue(bill) {
    let optionData0 = []
    let optionData1 = []
    let amountAll0 = 0
    let amountAll1 = 0
    console.log('bill', bill)

    Object.keys(bill).forEach(ele1 => {
      Object.keys(bill[ele1]).forEach(ele2 => {
        let flag = true
        bill[ele1][ele2].forEach(ele3 => {
          if (ele3.mode) {
            optionData1.forEach(ele4 => {
              if (ele4.name == ele3.category) {
                ele4.value += ele3.amount
                flag = false
              }
            })
            if (flag) {
              optionData1.push({
                name: ele3.category,
                value: ele3.amount
              })
            }
            amountAll1 += ele3.amount
          } else {
            optionData0.forEach(ele4 => {
              if (ele4.name == ele3.category) {
                ele4.value += ele3.amount
                flag = false
              }
            })
            if (flag) {
              optionData0.push({
                name: ele3.category,
                value: ele3.amount
              })
            }
            amountAll0 += ele3.amount
          }
        })
      })
    })

    this.setData({
      amountAll0,
      amountAll1
    })

    function update() {
      if (chart0 == null || chart1 == null) {
        wx.nextTick(update)
      } else {
        chart0.setOption({
          title: {
            text: `￥-${amountAll0}`,
            left: 'center',
            top: 'center'
          },
          series: [
            {
              type: 'pie',
              data: optionData0,
              radius: ['40%', '70%'],
              itemStyle: {
                borderRadius: 5,
                borderColor: '#fff',
                borderWidth: 2
              },
            }
          ]
        })
        chart1.setOption({
          title: {
            text: `￥+${amountAll1}`,
            left: 'center',
            top: 'center'
          },
          series: [
            {
              type: 'pie',
              data: optionData1,
              radius: ['40%', '70%'],
              itemStyle: {
                borderRadius: 5,
                borderColor: '#fff',
                borderWidth: 2
              },
            }
          ]
        })
      }
    }

    wx.nextTick(update)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      startDatetime: options.startDatetime,
      endDatetime: options.endDatetime,
      openid: options.openid,
      share: !!options.share,
      shareUrl: `startDatetime=${options.startDatetime}&endDatetime=${options.endDatetime}&opneid=${options.openid}&share=true`
    })
    callCloudFunction('getBill', {
      startDatetime: Number(options.startDatetime),
      date: Number(options.endDatetime),
      openid: options.openid
    }, false).then(res => {
      let bill = {}
      res.result.arr.reverse().map(ele => {
        let billDatetime = ele.bill_date
        let date = `${new Date(billDatetime).getFullYear()}/${new Date(billDatetime).getMonth() + 1}`
        if (bill[date] === undefined) {
          bill[date] = []
        }
        bill[date].push(ele)
      })

      Object.keys(bill).forEach(ele => {
        let obj = {}
        bill[ele].forEach(element => {
          let tempDate = `${new Date(element.bill_date).getDate()} ${this.getWeek(element.bill_date)}`
          if (obj[tempDate] === undefined) {
            obj[tempDate] = []
          }
          obj[tempDate].push(element)
        });
        bill[ele] = obj
      })
      this.setData({
        billList: bill
      })
      console.log(bill);
      this.getBillValue(bill)
    })

    callCloudFunction('getEmail', {
      openid: options.openid
    }, false).then(res => {
      console.log(res);
      this.setData({
        emailList: res.result.emailList.data
      })
    })

    this.setData({
      fn: this.throttle(this.showBtn, 100)
    })
  },

  throttle(fn, delay) {
    let last = 0 // 上次触发时间
    return function (...args) {
      const now = Date.now()
      if (now - last > delay) {
        last = now
        fn.apply(this, args)
      }
    }
  },

  showBtn(ev) {
    if (!this.data.share) {
      if (ev.scrollTop > 100) {
        this.setData({
          btnShow: true
        })
      } else {
        this.setData({
          btnShow: false
        })
      }
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
  onShareAppMessage(res) {
    console.log('share');
    if (res.from === 'button') {
      return {
        title: `${wx.getStorageSync('userInfo').nickName} ${new Date(Number(this.data.startDatetime)).getFullYear()}年${new Date(Number(this.data.endDatetime)).getMonth() + 1}月账单明细`,
        path: `/pages/share/share?${this.data.shareUrl}`,
        imageUrl: '../../images/thumbs.webp'
      }
    }
  },

  onPageScroll(ev) {
    this.data.fn(ev)
  }
})