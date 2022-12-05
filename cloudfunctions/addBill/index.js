// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  db.collection('user').where({
    openid: wxContext.OPENID
  }).get().then(res => {
    db.collection('bill').add({
      data: {
        bill_date: event.billDate,
        record_date: event.recordDate,
        amount: event.amount,
        category: event.category,
        mode: event.mode,
        note: event.note,
        icon: event.icon,
        openid: res.data[0]._id
      }
    })
  })

  return {}
}