// 云函数入口文件
const cloud = require('wx-server-sdk')
const nodemailer = require('nodemailer');

let code = ''
let timer = null
let address = ''

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  if(event.type == 'register'){
    let messageId = ''
    address = event.email
    code = (Math.random() * 100).toFixed(4).split('.')[1]
    if(timer != null){
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      code = ''
    }, 1000 * 60 * 5);

    let transporter = nodemailer.createTransport({
      // host: 'smtp.ethereal.email',
      service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
      port: 465, // SMTP 端口
      secureConnection: true, // 使用了 SSL
      auth: {
        user: '934024048@qq.com',
        // 这里密码不是qq密码，是你设置的smtp授权码
        pass: 'bsemehwaranwbcii',
      }
    });

    let mailOptions = {
      from: '"YAccount" <934024048@qq.com>', // sender address
      to: event.email, // list of receivers
      subject: 'YAccount邮箱安全验证', // Subject line
      // 发送text或者html格式
      // text: 'Hello world?', // plain text body
      html: `<b>【YAccount】 ${code} （邮箱验证码，请完成验证）5分钟内有效，欢迎使用YAccount，如非本人操作，请忽略本邮件</b>` // html body
    };
   
    // send mail with defined transport object
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
      // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
    });

    return {
      messageId
    }
  }

  if(event.type == 'check'){
    let flag = false
    console.log('event.code', event.code);
    console.log('code', code);
    if(code == event.code && code !== ''){
      flag = true
      timer = null
      await db.collection('user').where({
        openid: wxContext.OPENID
      }).get().then(async res => {
        await db.collection('email').add({
          data: {
            address,
            openid: res.data[0]._id
          }
        })
      })

    }
    return {flag}
  }


}
