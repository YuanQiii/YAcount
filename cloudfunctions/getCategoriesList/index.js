// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  let userData = ''
  let arr = []
  let categories = []
  let names = []

  db.collection('category').get().then(res => {
    names = res.data
  })

  // 根据用户的opneid获取用户信息
  await db.collection('user').where({
    openid: wxContext.OPENID
  }).get().then(res => {
    userData = res.data
  }).catch(err => {
    console.log(err)
  })

  // 获取用户分类列表
  await db.collection('categories_list').where({
    _id: userData[0].categories
  }).get().then(res => {
    categories = res.data[0].categories
  })

  categories.forEach(ele1 => {
    names.forEach(ele2 => {
      if (ele1 === ele2.name) {
        arr.push({
          name: ele1,
          mode: ele2.mode
        })
      }
    })
  })



  return {
    arr,
    openid: wxContext.OPENID
  }
}