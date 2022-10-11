// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  let { billDate, recordDate, amount, mode, category, note } = event

  await db.collection('bill').doc(event._id).update({
    data: {
      bill_date: billDate,
      record_date: recordDate,
      amount,
      mode,
      category,
      note,
    }
  })

  return {}
}