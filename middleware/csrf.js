const crypto = require('crypto')

// double-submit cookie：同一組 token 同時放在 cookie 與表單隱藏欄位，
// 兩邊對得起來才放行。跨站的表單讀不到 cookie，也就湊不出隱藏欄位。
const COOKIE_NAME = 'csrfToken'
const FIELD_NAME = '_csrf'
const TOKEN_PATTERN = /^[a-f0-9]{64}$/
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

// 比對時長度不同會讓 timingSafeEqual 直接拋錯，先擋掉
function isSameToken(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return crypto.timingSafeEqual(bufferA, bufferB)
}

// 發 token：沒有或格式不對就重發一組，並塞進 res.locals 給樣板用
function issueToken(req, res, next) {
  let token = req.cookies[COOKIE_NAME]

  if (!TOKEN_PATTERN.test(token || '')) {
    token = crypto.randomBytes(32).toString('hex')
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })
  }

  res.locals.csrfToken = token
  next()
}

// 驗 token：只檢查會改資料的請求
function verifyToken(req, res, next) {
  if (SAFE_METHODS.includes(req.method)) return next()

  const fromCookie = req.cookies[COOKIE_NAME]
  const fromBody = req.body ? req.body[FIELD_NAME] : undefined

  if (isSameToken(fromCookie, fromBody)) return next()

  return res.status(403).send('表單驗證失敗，請回上一頁重新整理後再送出一次。')
}

module.exports = { issueToken, verifyToken }
