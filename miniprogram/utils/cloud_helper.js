
import Dialog from '../miniprogram_npm/@vant/weapp/dialog/dialog';
import Notify from '../miniprogram_npm/@vant/weapp/notify/notify';
import Toast from '../miniprogram_npm/@vant/weapp/toast/toast';

let requestWait = null

// 调用云函数
export async function callCloudFunction(name, data = {}, permission = true) {
  if (permission) {
    if (name === 'login') {
      return login()
    } else if (name === 'getCategoriesList') {
      return wx.cloud.callFunction({
        name,
        data
      })
    }
    else {
      await checkToken()
      return wx.cloud.callFunction({
        name,
        data
      })
    }
  } else {
    return wx.cloud.callFunction({
      name,
      data
    })
  }
}



// 检查登录时效
function checkToken() {
  return new Promise((resolve, reject) => {
    let token = wx.getStorageSync('token')
    let pageName = getCurrentPageName()

    // 未登录
    if (!token) {
      getApp().globalData.toast?.clear()
      Dialog.confirm({
        message: '是否需要登录？',
        selector: `#${pageName}-dialog`
      }).then(() => {
        login().then(res => {
          resolve()
        })
      })
    } else {
      // 登录超时
      if (new Date().getTime() > token.split('_Expired_')[1]) {
        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo')

        getApp().globalData.toast?.clear()
        Dialog.confirm({
          message: '登录过期，是否重新登录？',
          selector: `#${pageName}-dialog`
        }).then(() => {
          if (res.confirm) {
            login().then(res => {
              resolve()
            })
          }
        }).catch(() => {
        }).finally(() => {
          wx.reLaunch({
            url: '/pages/detail/detail',
          })
        })
      } else {
        resolve()
      }
    }
  })
}

// 登录
function login() {
  let pageName = getCurrentPageName()
  let toast = null
  // 获取用户信息
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '登录',
      success: res1 => {
        wx.setStorageSync('userInfo', res1.userInfo)
        console.log('userInfo', res1.userInfo)
        toast = Toast.loading({
          message: '登录中...',
          forbidClick: true,
          selector: `#${pageName}-toast`,
          duration: 0
        });

        // 登录请求
        wx.login({
          success: res2 => {
            if (res2.code) {
              wx.cloud.callFunction({
                name: 'login'
              }).then(res3 => {
                if (res3.result.token) {
                  console.log(res3.result.token)
                  wx.setStorageSync('token', res3.result.token)
                  toast.clear();
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

function getCurrentPageName() {
  let pages = getCurrentPages()
  let currentPage = pages[pages.length - 1]
  let routeList = currentPage.route.split('/')
  return routeList[routeList.length - 1]
}
