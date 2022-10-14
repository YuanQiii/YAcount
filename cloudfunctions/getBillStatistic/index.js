// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const MAX_LIMIT = 100

  // 先取出集合记录总数
  const countResult = await db.collection('bill').count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('bill').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }

  let user_id = ''
  await db.collection('user').where({
    openid: wxContext.OPENID
  }).get().then(res => {
    user_id = res.data[0]._id
  })

  let allAmount = 0
  let yearAmount = 0
  let yearExpenses = 0

  let currentYear = new Date().getFullYear()
  let startDatetime = new Date(`${currentYear}-01-01`).getTime()
  let endDatetime = new Date(`${currentYear}-12-31`).getTime()

  let arr = await Promise.all(tasks)
  arr.forEach(ele1 => {
      ele1.data.forEach(ele2 => {
        if(ele2.openid == user_id){

          if(ele2.mode == 1){
            allAmount += ele2.amount
          }else{
            allAmount -= ele2.amount
          }

          if(startDatetime <= ele2.bill_date && endDatetime >= ele2.bill_date){
            if(ele2.mode == 1){
              yearAmount += ele2.amount
            }else{
              yearAmount -= ele2.amount
              yearExpenses += ele2.amount
            }
          }
        }
      })
  });

  // 等待所有
  return {
    allAmount,
    yearAmount,
    yearExpenses
  }
}