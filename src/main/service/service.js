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
        console.log(reject(err.sqlMessage))
        return reject(err)
      }
      if (!result.length) {
        return reject('没有该用户的购买记录')
      }
      resolve(result)
    })
  })
}

const addOrderMeta = function (commodity, quantity, price, totalPrice) {
  const sql = `INSERT INTO ORDERS(\`commodity\`, \`quantity\`, \`price\`, \`totalPrice\`)
  VALUES
  ("${commodity}", "${quantity}", "${price}", "${totalPrice}")`
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
  // 1. 判断用户是否存在（已经在中间件中操作了）
  // 2. 判断库存是否足够
  // 3. 操作库存
  // 4. 在订单数据库里增加订单
  // 5. 返回剩余库存
  
  // 这里的写法还要斟酌一下，回去看一下阮一峰老师的ES6教程
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


module.exports = {
  auth,
  register,
  login,
  getUserList,
  getAnalysis,
  getOrderList,
  getOrder,
  addOrder,
  getProductList,
  profile,
}