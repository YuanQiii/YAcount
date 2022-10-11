// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  let arr = []

  if (event.mode == undefined) {
    await db.collection('bill').where({
      bill_date: _.lt(event.date)
    }).get().then(res => {
      arr = res.data
    })
  } else {
    await db.collection('bill').where({
      bill_date: _.lt(event.date),
      mode: event.mode
    }).get().then(res => {
      arr = res.data
    })
  }

  return {
    arr
  }
}