// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  let p1 = db.collection('user').where({
    openid: wxContext.OPENID
  }).get()

  console.log(event.category)

  let p2 = db.collection('category').where({
    type: event.category,
    mode: event.mode
  }).get()

  Promise.all([p1, p2]).then(res => {
    console.log(res)
    db.collection('bill').add({
      data: {
        bill_date: event.billDate,
        record_date: event.recordDate,
        amount: event.amount,
        category: res[1].data[0]._id,
        mode: event.mode,
        note: event.note,
        openid: res[0].data[0]._id
      }
    })
  })

  
  return {
    
  }
}