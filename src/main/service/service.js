// Service module

// Import body-parser
const bodyParser = require('body-parser')
// Import db model
const model = require('../model/model')
// Import filesystem module(for read and write files)
const fs = require('fs')
// Import path module(for managing file path)
const path = require('path')
// Import mime module(for managing Content-Type)
const mime = require('mime')
// Import bcrypt(encoding passwords)
const bcrypt = require('bcrypt-nodejs')
// Import jsonwebtoken(for returning tokens to users)
const jwt = require('jsonwebtoken')
// Import nodemailer(for sending email to ensure the order)
const nodemailer = require('nodemailer')

// Define SECRET for generating tokens
const SECRET = 'MotherLynWeb'

// Meta functions
const jwtVerify = function (raw) {
  return new Promise((resolve, reject) => {
    try {
      const {name} = jwt.verify(raw, SECRET)
      resolve(name)
    } catch (err) {
      reject('身份验证不通过')
    }
  })
}

const getUserMeta = function (name) {
  const sql = `SELECT * FROM USER WHERE name="${name}"`
  return new Promise((resolve, reject) => {
    model.query(sql, (err, result) => {
      if (err) {
        console.log(err)
        console.log(err.sqlMessage)
        return reject(err)
      }
      if (!result.length) {
        return reject('用户不存在')
      }
      resolve(result)
    })
  })
}

const getUserEmail = function (name) {
  const sql = `SELECT email FROM USER WHERE name="${name}"`
  return new Promise((resolve, reject) => {
    model.query(sql, (err, result) => {
      if (err) {
        console.log(err)
        console.log(err.sqlMessage)
        return reject(err)
      }
      if (!result.length) {
        return reject('用户不存在')
      }
      resolve(result)
    })
  })
}

const getUserListMeta = function () {
  const sql = 'SELECT * FROM USER'
  return new Promise((resolve, reject) => {
    model.query(sql, (err, result) => {
      if (err) {
        console.log(err.sqlMessage)
        return reject(err)
      }
      resolve(result)
    })
  })
}

const addUserMeta = function (name, password, email) {
  const sql = `INSERT INTO USER(\`name\`, \`password\`, \`email\`)
  VALUES
  ("${name}", "${password}", "${email}")`
  return new Promise((resolve, reject) => {
    model.query(sql, (err, result) => {
      if (err) {
        console.log(err.sqlMessage)
        return reject(err)
      }
      resolve(result)
    })
  })
}

const addNewOrderMeta = function (commodity, quantity, price, totalPrice, customer) {
  const sql = `INSERT INTO ORDERS(\`commodity\`, \`quantity\`, \`price\`, \`totalPrice\`, \`customer\`)
  VALUES
  ("${commodity}", "${quantity}", "${price}", "${totalPrice}", "${customer}")`
  return new Promise((resolve, reject) => {
    model.query(sql, (err, result) => {
      if (err) {
        console.log(err.sqlMessage)
        return reject(err)
      }
      resolve(result)
    })
  })
}

const addOldOrderMeta = function (commodity, quantity, totalPrice, customer) {
  const sql = `UPDATE ORDERS SET quantity=quantity+${quantity}, totalPrice=totalPrice+${totalPrice} WHERE commodity="${commodity}" AND Customer="${customer}"`
  return new Promise((resolve, reject) => {
    model.query(sql, (err, result) => {
      if (err) {
        console.log(err.sqlMessage)
        return reject(err)
      }
      resolve(result)
    })
  })
}

const getOrderListMeta = function () {
  const sql = 'SELECT * FROM ORDERS'
  return new Promise((resolve, reject) => {
    model.query(sql, (err, result) => {
      if (err) {
        console.log(err.sqlMessage)
        return reject(err)
      }
      resolve(result)
    })
  })
}

const getOrderMeta = function (customer) {
  const sql = `SELECT * FROM ORDERS WHERE customer="${customer}"`
  return new Promise((resolve, reject) => {
    model.query(sql, (err, result) => {
      if (err) {
        console.log(err.sqlMessage)
        return reject(err)
      }
      if (!result.length) {
        return resolve('没有该用户的购买记录')
      }
      resolve(result)
    })
  })
}

const getRepeatOrderMeta = function (commodity, customer) {
  const sql = `SELECT * FROM ORDERS WHERE customer="${customer}" AND commodity="${commodity}"`
  return new Promise((resolve, reject) => {
    model.query(sql, (err, result) => {
      if (err) {
        console.log(err.sqlMessage)
        return reject(err)
      }
      resolve(result)
    })
  })
}

const getProductListMeta = function () {
  const sql = 'SELECT * FROM COMMODITY'
  return new Promise((resolve, reject) => {
    model.query(sql, (err, result) => {
      if (err) {
        console.log(err.sqlMessage)
        return reject(err)
      }
      resolve(result)
    })
  })
}

const getProductStockMeta = function (id) {
  const sql = `SELECT STOCK FROM COMMODITY WHERE ID = ${id}`
  return new Promise((resolve, reject) => {
    model.query(sql, (err, result) => {
      if (err) {
        console.log(err.sqlMessage)
        return reject(err)
      }
      resolve(result)
    })
  })
}

const reduceProductStockMeta = function (id, stock) {

}

const getProductMeta = function (id) {
  const sql = `SELECT * FROM COMMODITY WHERE ID = ${id}`
  return new Promise((resolve, reject) => {
    model.query(sql, (err, result) => {
      if (err) {
        console.log(err.sqlMessage)
        return reject(err)
      }
      resolve(result)
    })
  })
}

// Middlewares
const auth = async function (req, res, next) {
  const raw = String(req.headers.authorization).split(' ').pop() || req.body.token
  await jwtVerify(raw).then(async result => {
    req.user = await getUserMeta(result)
    next()
  }, err => {
    res.end(JSON.stringify({
      "code": 0,
      "msg": err
    }))
  })
}


// Service functions

const login = async function (req, res) {
  await getUserMeta(req.body.name).then(result => {
    if(bcrypt.compareSync(
      req.body.password,
      result[0].password
    )) {
      const token = jwt.sign({
        name: String(result[0].name)
      }, SECRET)
      res.end(JSON.stringify({
        "code": 1,
        "msg": "登录成功",
        "token": token
      }))
    }
    res.end(JSON.stringify({
      "code": 0,
      "msg": "密码错误",
      "token": null
    }))
  }, () => {
    res.end(JSON.stringify({
      "code": 0,
      "msg": "用户不存在",
      "token": null
    }))
  })
}

const register = async function (req, res) {
  const name = req.body.name
  await getUserMeta(name).then(() => {
    res.end(JSON.stringify({
      "code": 0,
      "msg": "用户名已存在"
    }))
  }, async () => {
    const password = bcrypt.hashSync(req.body.password)
    const email = req.body.email
    await addUserMeta(name, password, email).then(() => {
      res.end(JSON.stringify({
        "code": 1,
        "msg": "注册成功"
      }))
    }, err => {
      res.end(JSON.stringify({
        "code": 0,
        "msg": "服务器出错"
      }))
    })
  })

}

const getUserList = async function (req, res) {
  await getUserListMeta().then(result => {
    res.end(JSON.stringify({
      "code": 1,
      "msg": "成功",
      "data": result
    }))
  }, () => {
    res.end(JSON.stringify({
      "code": 0,
      "msg": "服务端出错，请重试",
      "token": null
    }))
  })
}

const getAnalysis = async function (req, res) {

}

const getOrderList = async function (req, res) {
  await getOrderListMeta().then(result => {
    res.end(JSON.stringify({
      "code": 1,
      "msg": "成功",
      "data": result
    }))
  }, () => {
    res.end(JSON.stringify({
      "code": 0,
      "msg": "服务端出错，请重试",
      "token": null
    }))
  })
}

const getOrder = async function (req, res) {
  const customer = req.user[0].name
  await getOrderMeta(customer).then(result => {
    res.end(JSON.stringify({
      "code": 1,
      "msg": "成功",
      "data": result
    }))
  }, () => {
    res.end(JSON.stringify({
      "code": 0,
      "msg": "服务端出错，请重试",
    }))
  })
}

const addOrder = async function (req, res) {
  const body = req.body
  const result = await getRepeatOrderMeta(body.commodity, body.Customer)
  if (!result.length) {
    await addNewOrderMeta(body.commodity, body.quantity, body.price, body.totalPrice, body.Customer)
    res.end(JSON.stringify({
      "code": 1,
      "msg": "成功",
      "data": "新增记录"
    }))
  } else {
    await addOldOrderMeta(body.commodity, body.quantity, body.totalPrice, body.Customer)
    res.end(JSON.stringify({
      "code": 1,
      "msg": "成功",
      "data": "在旧记录上修改"
    }))
  }
}

const getProduct = async function (req, res) {
  await getProductMeta(req.query.itemId).then(result => {
    res.end(JSON.stringify({
      "code": 1,
      "msg": "成功",
      "data": result
    }))
  }, () => {
    res.end(JSON.stringify({
      "code": 0,
      "msg": "服务端出错，请重试",
    }))
  })
}

const getProductList = async function (req, res) {
  await getProductListMeta().then(result => {
    res.end(JSON.stringify({
      "code": 1,
      "msg": "成功",
      "data": result
    }))
  }, () => {
    res.end(JSON.stringify({
      "code": 0,
      "msg": "服务端出错，请重试",
      "token": null
    }))
  })
}

const profile = async function (req, res) {
  res.end(JSON.stringify(req.user))
}

const buy = async function (req, res) {
  await getUserEmail(req.query.username).then(result => {
    let transporter = nodemailer.createTransport({
      host: 'smtp.qq.com',
      secureConnection: true,
      port: 465,
      secure: true,
      auth: {
        user: '2907681146@qq.com',
        pass: 'dljfekaccwmcdeai'
      }
    })

    let mailOptions = {
      from: '一个购物网站 <2907681146@qq.com>',
      to: result[0].email,
      subject: '确认发货',
      text: '您的订单已经确认发货……'
    }

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return console.log(err)
      }
      console.log(`Message: ${info.messageId}`)
      console.log(`sent: ${info.response}`)
    })
    
    res.end(JSON.stringify({
      "code": 1,
      "msg": "邮件发送成功"
    }))
  }, () => {
    res.end(JSON.stringify({
      "code": 0,
      "msg": "服务端出错，请重试"
    }))
  })

}

module.exports = {
  auth,
  register,
  login,
  getUserList,
  getAnalysis,
  getOrderList,
  getOrder,
  addOrder,
  getProduct,
  getProductList,
  profile,
  buy
}