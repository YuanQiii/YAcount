// pages/record/record.jscategoryName
import { callCloudFunction } from '../../utils/cloud_helper'
import { formatDate } from '../../utils/format_date'
import Toast from '@vant/weapp/toast/toast';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mode: 0,
    num: '',
    categoriesList0: [],
    categoriesList1: [],
    categoryName0: '三餐',
    categoryName1: '工资',
    categoryIcon0: 'https://636c-cloud1-9gy06h7v3cd9add3-1314052338.tcb.qcloud.la/cloudbase-cms/upload/2022-10-18/0zn6uo2j0lcpz5llgfm64jpqjofztc48_.png',
    categoryIcon1: 'https://636c-cloud1-9gy06h7v3cd9add3-1314052338.tcb.qcloud.la/cloudbase-cms/upload/2022-10-18/leu35j9pqcdc9tfnimbcsfsg8dyd6mg4_.png',
    loading: true,
    height: '',
    popupNoteShow: false,
    popupDateShow: false,
    popupAddShow: false,
    note: '',
    currentDate: formatDate(new Date().getTime(), 'YY/MM/DD'),
    currentWeek: null,
    maxDate: new Date().getTime(),
    minDate: new Date('1990-01-01').getTime(),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      }
      if (type === 'month') {
        return `${value}月`;
      }
      return value;
    },
    billInfo: {
      recordDate: null,
      billDate: new Date().getTime(),
      amount: 0,
      category: null,
      mode: null,
      note: '',
      icon: '',
    },
    billId: '',
    isUpdate: false,
    tempDate: 0
  },

  getCurrentWeek(datetime) {
    let arr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    this.setData({
      currentWeek: arr[new Date(datetime).getUTCDay()]
    })
  },

  handleTabChange(e) {
    this.setData({
      mode: e.detail.index
    })
  },

  handleKeyPress(e) {
    const num = e.target.dataset.num; // 点击的那个键盘代表值，即上面data-num嵌入的自定义数据，D：删除，C：清空，S：确认，‘’：无效，0-9：数字
    // 不同按键处理逻辑
    // '' 代表无效按键，直接返回
    if (num === '') return false;
    switch (String(num)) {
      // 删除键
      case 'D':
        this.handleDeleteKey();
        break;
      // 清空键
      case 'C':
        this.handleClearKey();
        break;
      // 确认键
      case 'S':
        this.handleConfirmKey();
        break;
      default:
        this.handleNumberKey(num);
        break;
    }
  },

  // 处理删除键
  handleDeleteKey() {
    const S = this.data.num; // 因为上面mounted()函数赋值，这个值已经是父组件点击的那个输入框的值了，当点击了数字键盘上的数字后，它也会发生变化的
    // 如果没有输入（或者长度为0），直接返回
    if (!S.length) return fal1221se;
    // 否则删除最后一个
    this.setData({
      num: S.substring(0, S.length - 1)
    })
  },
  // 处理清空键
  handleClearKey() {
    this.setData({
      num: ''
    })
  },
  // 处理数字
  handleNumberKey(num) {
    let temp = this.data.num + num

    if (num === '.' && this.data.num === '') {
      this.setData({
        num: '0.'
      })
    }
    if (num === '.' && this.data.num.includes('.')) return

    if (temp.split('.')[0].length > 7) {
      console.log('超过最大值');
      return
    }
    if (temp.includes('.') && temp.split('.')[1].length > 2) return

    this.setData({
      num: temp,
    })

  },
  // 确认键
  handleConfirmKey() {
    getApp().globalData.isUpdate = true
    let amount = Number(this.data.num)
    if (amount !== 0) {
      this.setData({
        ['billInfo.recordDate']: new Date().getTime(),
        ['billInfo.mode']: this.data.mode,
        ['billInfo.amount']: amount,
        ['billInfo.note']: this.data.note,
        ['billInfo.category']: this.data.mode ? this.data.categoryName1 : this.data.categoryName0,
        ['billInfo.icon']: this.data.mode ? this.data.categoryIcon1 : this.data.categoryIcon0
      })
      console.log(this.data.billInfo)

      getApp().globalData.toast = Toast.loading({
        forbidClick: true,
        duration: 0,
        selector: '#record-toast'
      });

      if (this.data.isUpdate) {
        this.setData({
          ['billInfo._id']: this.data.billId,
        })

        console.log(this.data.billInfo)

        callCloudFunction('updateBill', this.data.billInfo).then(res => {
          if (res) {
            getApp().globalData.toast.clear()
            this.setData({
              popupAddShow: true,
            })
          }
        })
      } else {
        callCloudFunction('addBill', this.data.billInfo).then(res => {
          if (res) {
            getApp().globalData.toast.clear()
            this.setData({
              popupAddShow: true,
            })
          }
        })
      }

    }
  },

  handleCategoriesContainenrHeight() {
    wx.getSystemInfo({
      success: res => {
        let height = (res.windowHeight - 450) * res.pixelRatio
        this.setData({
          height: `height: ${height}rpx`,
        })
      }
    })
  },

  handleSelectCategory(e) {
    let dataset = e.currentTarget.dataset
    this.setData({
      [`categoryName${dataset.mode}`]: dataset.name,
      [`categoryIcon${dataset.mode}`]: dataset.icon,
    })
  },

  handleAddNote() {
    this.setData({
      popupNoteShow: true
    })
  },

  handlePopupNoteClose() {
    this.setData({
      popupNoteShow: false,
      note: ''
    })
  },

  handlePopupNoteSubmit() {
    this.setData({
      popupNoteShow: false
    })
  },

  handleNoteChange(e) {
    this.setData({
      note: e.detail
    })
  },

  handleAddDate() {
    this.setData({
      popupDateShow: true
    })
  },

  handlePopupDateClose() {
    this.setData({
      popupDateShow: false
    })
  },


  handleCancelDate() {
    this.setData({
      popupDateShow: false
    })
  },

  handleDateInput(e) {
    this.setData({
      tempDate: e.detail
    })
  },

  handleConfirmDate() {
    this.setData({
      popupDateShow: false,
      currentDate: formatDate(this.data.tempDate, 'YY/MM/DD'),
      ['billInfo.billDate']: this.data.tempDate,
    })

    this.getCurrentWeek(this.data.tempDate)
  },

  handleAddAgain() {
    this.setData({
      num: '',
      popupAddShow: false
    })
  },

  handleToDetail() {
    this.setData({
      num: '',
      popupAddShow: false
    })
    wx.switchTab({
      url: '/pages/detail/detail'
    })
  },

  handleCategories(arr) {
    let arr0 = []
    let arr1 = []
    arr.map(ele => {
      if (ele.mode) {
        arr1.push(ele)
      } else {
        arr0.push(ele)
      }
    })
    return [arr0, arr1]
  },

  handleOverlay() {
    this.setData({
      popupNoteShow: false,
      popupDateShow: false,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    Toast.loading({
      forbidClick: true,
      duration: 1500,
      selector: '#record-toast'
    });

    this.setData({
      categoriesList0: getApp().globalData.categoriesList[0],
      categoriesList1: getApp().globalData.categoriesList[1]
    })
    this.handleCategoriesContainenrHeight()
    this.getCurrentWeek(new Date())
    setTimeout(() => {
      this.setData({
        loading: false
      })
    }, 1500)
    if (Object.keys(options).length) {
      this.setData({
        isUpdate: true,
        num: options.amount,
        mode: options.mode,
        note: options.note,
        billId: options._id,
        ['billInfo.billDate']: new Date(options.bill_date).getTime(),
        [`categoryName${options.mode}`]: options.category,
        currentDate: formatDate(options.bill_date, 'YY/MM/DD'),
        currentWeek: this.getCurrentWeek(options.bill_date)
      })
      console.log(options)
    } else {
      this.setData({
        isUpdate: false
      })
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
  onShareAppMessage() {

  }
})