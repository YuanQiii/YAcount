// 云函数入口文件
const cloud = require('wx-server-sdk')
const nodemailer = require('nodemailer');
const xlsx = require('xlsx');
const fs = require('fs');
const {resolve} = require('path')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

function formatDate(time, format = 'YY-MM-DD hh:mm:ss') {
  var date = new Date(time);

  var year = date.getFullYear(),
    month = date.getMonth() + 1,//月份是从0开始的
    day = date.getDate(),
    hour = date.getHours(),
    min = date.getMinutes(),
    sec = date.getSeconds();

  var preArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (elem, index) {
    return '0' + index;
  });

  var newTime = format.replace(/YY/g, year)
    .replace(/MM/g, preArr[month] || month)
    .replace(/DD/g, preArr[day] || day)
    .replace(/hh/g, preArr[hour] || hour)
    .replace(/mm/g, preArr[min] || min)
    .replace(/ss/g, preArr[sec] || sec);

  return newTime;
}


function createExcel(filename, sheetData) {
  // 1. 创建一个工作簿 workbook
  const workBook = xlsx.utils.book_new()
  // 2. 创建工作表 worksheet
  const workSheet = xlsx.utils.json_to_sheet(sheetData)
  // 3. 将工作表放入工作簿中
  xlsx.utils.book_append_sheet(workBook, workSheet)
  // 4. 生成数据保存
  xlsx.writeFile(workBook, `/tmp/${filename}.xlsx`)
}


// 云函数入口函数
exports.main = async (event, context) => {


  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  let arr = []
  let startDatetime = event.startDatetime || new Date('1990-01-01').getTime()
  let openid = event.openid || wxContext.OPENID

  await db.collection('user').where({
    openid
  }).get().then(async res => {
    await db.collection('bill').where({
      bill_date: _.and(_.gte(startDatetime), _.lt(event.date)),
      openid: res.data[0]._id,
    }).get().then(res => {
      arr = res.data
    })
  })

  let filename = event.filename

  let sheetData = []
  arr.forEach((ele, index) => {
    sheetData.push({
      '账单日期': formatDate(ele.bill_date, 'YY/MM/DD'),
      '金额': `${ele.mode == 1 ? '+' : '-'}${ele.amount}`,
      '账单类型': `${ele.mode == 1 ? '收入' : '支出'}`,
      '分类': ele.category,
      '备注': ele.note
    })
  })

  createExcel(filename, sheetData)

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
    subject: `YAccount${filename}`, // Subject line
    // 发送text或者html格式
    // text: 'Hello world?', // plain text body
    html: '<b>这是一封YAccount账单导出邮件，如非本人操作，请忽略！详细的账单记录在附件中，请您查阅！</b>',
    attachments: [
      {
        filename: `${filename}.xlsx`,
        path: `/tmp/${filename}.xlsx`
      }
    ]
  };

  // send mail with defined transport object
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  });

  return filename
}