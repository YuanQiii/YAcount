// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  let arr = []
  let startDatetime = event.startDatetime == undefined ? new Date('1990-01-01').getTime() : event.startDatetime

  await db.collection('user').where({
    openid: wxContext.OPENID
  }).get().then(async res => {
    if (event.mode == undefined) {
      await db.collection('bill').where({
        bill_date: _.and(_.gte(startDatetime), _.lt(event.date)),
        openid: res.data[0]._id
      }).get().then(res => {
        arr = res.data
      })
    } else {
      await db.collection('bill').where({
        bill_date: _.and(_.gte(startDatetime), _.lt(event.date)),
        openid: res.data[0]._id,
        mode: event.mode
      }).get().then(res => {
        arr = res.data
      })
    }
  })



  return {
    arr,
    openid: wxContext.OPENID
  }
}