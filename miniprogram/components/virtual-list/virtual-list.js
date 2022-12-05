const createRecycleContext = require('miniprogram-recycle-view')
let ctx = null

Component({
  data: {
    batchSetRecycleData: true,
    recycleList: [],
    itemHeight: 100 / (750 / wx.getSystemInfoSync().windowWidth),
    arr: [],
  },
  properties: {
    bill: {
      type: Array,
      value: [],
      observer: function (newVal, oldVal, changedPath) {
        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：‘_propertyChange‘
        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
        console.log('newVal', newVal);

        if(this.data.ctx == null){
          ctx = createRecycleContext({
            id: 'recycleId',
            dataKey: 'recycleList',
            page: this,
            itemSize: { // 这个参数也可以直接传下面定义的 this.itemSizeFunc 函数
              width: 375,
              height: this.data.itemHeight
            }
          })
        }

        if(this.data.arr.length != 0){
          ctx.splice(0, this.data.arr.length, newVal)
        }else{
          ctx.append(newVal)
        }

        setTimeout(() => {
          ctx.forceUpdate()
        }, 1000);

        this.setData({
          arr: Array.isArray(newVal) ? newVal : []
        })
      }
    }
  },
  methods: {
    handleShare(e) {
      let date = `${e.currentTarget.dataset.date}01`.replace('年', '/').replace('月', '/')
      let month = Number(date.split('/')[1])
      let year = Number(date.split('/')[0])
      let startDatetime = new Date(date).getTime()
      if (month + 1 > 12) {
        year += 1
        month = 1
      } else {
        month += 1
      }
      let endDatetime = new Date(`${year}/${month}/01`).getTime()
  
      wx.navigateTo({
        url: `../share/share?startDatetime=${startDatetime}&endDatetime=${endDatetime}&opneid=${getApp().globalData.openid}`
      })
    },
    toInfo(e) {
      console.log(e.currentTarget.dataset.info)
      let info = e.currentTarget.dataset.info
      wx.navigateTo({
        url: '../info/info',
        success(res) {
          res.eventChannel.emit('acceptDataFromDetailPage', { data: info })
        }
      })
    },
  },
  ready(){
    
  }
})