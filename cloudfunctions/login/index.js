// 云函数入口文件
const cloud = require('wx-server-sdk')
const rp = require('request-promise')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const defaultCategoryListId = 'a0041d0f632fcebb003a352867cdb0c9'
  
  // const APPID = 'wxa8631a8a02c8b7c4'
  // const SECRET = 'f09bb30bbfa2773137a2774d6a728ce8'
  // const JSCODE = event.code

  // let openid = ''
  // let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${JSCODE}&grant_type=authorization_code`

  // 获取openid
  // await rp({
  //   url,
  //   method: 'GET',
  //   json: true
  // }).then(res => {
  //   openid = res.openid
  // })

  let userData = ''
  // 根据用户的opneid获取用户信息
  await db.collection('user').where({
    openid: wxContext.OPENID
  }).get().then(res => {
    userData = res.data
  }).catch(err => {
    console.log(err)
  })

  // 新用户初始化
  if(!userData.length){
        // 创建新用户，分配默认分类列表
        await db.collection('user').add({
          data: {
            nickname: 'test',
            openid: wxContext.OPENID,
            categories: defaultCategoryListId
          }
        })     
  }

  // 生成token
  const genRandomString = len => {
    const text = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const rdmIndex = text => Math.random() * text.length | 0;
    let rdmString = '';
    for (; rdmString.length < len; rdmString += text.charAt(rdmIndex(text)));
    return rdmString;
  }

  let token = `${genRandomString(32)}_Expired_${new Date().getTime() + 86400 * 30}`
  return {
    token
  }
}