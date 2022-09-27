// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let userData = ''
  let arr = []

  // 根据用户的opneid获取用户信息
  await cloud.database().collection('user').where({
    openid: wxContext.OPENID
  }).get().then(res => {
    userData = res.data
  }).catch(err => {
    console.log(err)
  })

  // 获取用户分类列表
  await cloud.database().collection('categories_list').where({
    _id: userData[0].categories
  }).get().then(res => {
    arr = res.data[0].categories
  })

  return {
    arr,
    openid: wxContext.OPENID
  }
}