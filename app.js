const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
// const bodyParser = require('body-parser')
const Restaurant = require('./models/restaurant')
const { issueToken, verifyToken } = require('./middleware/csrf')
const {
  pickRestaurantFields,
  validateRestaurant
} = require('./middleware/validateRestaurant')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})

db.once('open', () => {
  console.log('mongodb connected!')
})

const app = express()
const port = 3000

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(methodOverride('_method'))
app.use(issueToken)
app.use(verifyToken)

// 瀏覽全部餐廳
app.get('/', (req, res) => {
  Restaurant.find()
    .lean()
    .then((restaurantsData) => res.render('index', { restaurantsData }))
    .catch((error) => console.error(error))
})

// 新增餐廳頁面
app.get('/restaurants/new', (req, res) => {
  return res.render('new')
})

// 搜尋餐廳
app.get('/search', (req, res) => {
  const keywords = req.query.keywords

  // 沒輸入關鍵字就導回首頁，這裡要 return，否則下面還會再送一次 response
  if (!keywords || !keywords.trim()) {
    return res.redirect('/')
  }

  const keyword = keywords.trim().toLowerCase()

  return Restaurant.find({})
    .lean()
    .then((restaurantsData) => {
      const filterRestaurantsData = restaurantsData.filter(
        (data) =>
          data.name.toLowerCase().includes(keyword) ||
          data.category.includes(keyword)
      )
      res.render('index', { restaurantsData: filterRestaurantsData, keywords })
    })
    .catch((err) => console.log(err))
})

//新增餐廳
app.post('/restaurants', (req, res) => {
  const restaurant = pickRestaurantFields(req.body)
  const errors = validateRestaurant(restaurant)

  // 驗證沒過就把使用者填的內容原樣帶回表單，不用重打
  if (errors.length) {
    return res.status(400).render('new', { restaurant, errors })
  }

  return Restaurant.create(restaurant)
    .then(() => res.redirect('/'))
    .catch((error) => console.log(error))
})

//瀏覽特定餐廳
app.get('/restaurants/:id', (req, res) => {
  return Restaurant.findById(req.params.id)
    .lean()
    .then((restaurant) => res.render('show', { restaurant }))
    .catch((error) => console.log(error))
})

// 前往edit頁面
app.get('/restaurants/:id/edit', (req, res) => {
  const id = req.params.id
  return Restaurant.findById(id)
    .lean()
    .then((restaurant) => res.render('edit', { restaurant }))
    .catch((error) => console.log(error))
})

//修改特定餐廳
app.post('/restaurants/:id/edit', (req, res) => {
  const id = req.params.id
  const data = pickRestaurantFields(req.body)
  const errors = validateRestaurant(data)

  if (errors.length) {
    // 表單 action 要用到 _id，回填時補上
    return res
      .status(400)
      .render('edit', { restaurant: { ...data, _id: id }, errors })
  }

  return Restaurant.findById(id)
    .then((restaurant) => {
      Object.assign(restaurant, data)
      return restaurant.save()
    })
    .then(() => res.redirect(`/`))
    .catch((error) => console.log(error))
})

// 刪除餐廳
app.post('/restaurants/:id/delete', (req, res) => {
  const id = req.params.id
  return Restaurant.findById(id)
    .then((restaurant) => restaurant.remove())
    .then(() => res.redirect('/'))
    .catch((error) => console.log(error))
})

app.listen(port, () => {
  console.log(`Express is listening on localhost:${port}`)
})
