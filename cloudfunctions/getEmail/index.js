// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  let openid = event.openid || wxContext.OPENID

  let emailList = []

  await db.collection('user').where({
    openid
  }).get().then(async res => {
    await db.collection('email').where({
      openid: res.data[0]._id
    }).get().then(res => {
      emailList = res
    })
  })

  return {
    emailList
  }
}