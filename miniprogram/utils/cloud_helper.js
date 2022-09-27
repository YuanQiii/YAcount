
import Dialog from '../miniprogram_npm/@vant/weapp/dialog/dialog';
import Notify from '../miniprogram_npm/@vant/weapp/notify/notify';

// 调用云函数
export async function callCloudFunction(name, data = {}) {
  if(name === 'login'){
     return login()
  }else{
    if(checkToken()){
      return wx.cloud.callFunction({
        name,
        data
      })
    }
  }
}

// 检查登录时效
function checkToken(){
  let token = wx.getStorageSync('token')

  // 未登录
  if(!token){
    Dialog.confirm({
      message: '是否需要登录？',
      selector: '#detail-dialog'
    }).then(() => login())
    return false
  }

  // 登录超时
  if(new Date().getTime() < parseInt(wx.getStorageSync('token'))){
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo')

    // Dialog.confirm({
    //   message: '登录过期，是否重新登录？',
    //   selector: '#tip-dialog'
    // }).then(async () => {
    //   if(res.confirm) await login()
    // }).catch(() => {
    // }).finally(() => {
    //   wx.reLaunch({
    //     url: '/pages/detail/detail',
    //   })
    // })
    return false
  } 
  return true
}

// 登录
function login(){
  // 获取用户信息
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '登录',
      success: res1 => {
        wx.setStorageSync('userInfo', res1.userInfo)
        console.log('userInfo', res1.userInfo)
        Notify({
          type: 'primary',
          message: '登录中',
          duration: 1000,
          selector: '#tip-notify'
        });
        // 登录请求
        wx.login({
          success: res2 => {
            if(res2.code){
              wx.cloud.callFunction({
                name: 'login'
              }).then(res3 => {
                if(res3.result.token){
                  console.log(res3.result.token)
                  wx.setStorageSync('token', res3.result.token)
                  Notify.clear({
                    selector: '#tip-notify'
                  })
                  setTimeout(() => {
                    Notify({
                      type: 'success',
                      message: '登录成功',
                      duration: 1000,
                      selector: '#tip-notify'
                    });
                  }, 500);
                  resolve(res1.userInfo)
                }
              })
            }
          }
        })
      }
    })
  })

}

function getCurrentPageName(){
  let pages = getCurrentPages()
  let currentPage = pages[pages.length - 1]
  let routeList = currentPage.route.split('/')
  return pageName = routeList[routeList.length-1]
}
