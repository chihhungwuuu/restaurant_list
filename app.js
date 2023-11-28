const express = require("express")
const exphbs = require("express-handlebars")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const Restaurant = require("./models/restaurant")

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection

db.on("error", () => {
  console.log("mongodb error!")
})

db.once("open", () => {
  console.log("mongodb connected!")
})

const app = express()
const port = 3000

app.engine("handlebars", exphbs({ defaultLayout: "main" }))
app.set("view engine", "handlebars")
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

// 瀏覽全部餐廳
app.get("/", (req, res) => {
  Restaurant.find()
    .lean()
    .then((restaurants) => res.render("index", { restaurants }))
    .catch((error) => console.error(error))
})

app.get("/restaurants/new", (req, res) => {
  return res.render("new")
})

app.post("/restaurants", (req, res) => {
  const name = req.body.name
  const name_en = req.body.name_en
  const category = req.body.category
  const image = req.body.image
  const location = req.body.location
  const phone = req.body.phone
  const google_map = req.body.google_map
  const rating = req.body.rating
  const description = req.body.description

  return Restaurant.create({
    name,
    name_en,
    category,
    image,
    location,
    phone,
    google_map,
    rating,
    description
  })
    .then(() => res.redirect("/"))
    .catch((error) => console.log(error))
})

// app.get("/restaurants/:restaurants_id", (req, res) => {
//   const restaurant = restaurantList.results.find(
//     (restaurant) => restaurant.id.toString() === req.params.restaurants_id
//   )
//   res.render("show", { restaurant: restaurant })
// })

app.get("/search", (req, res) => {
  const keyword = req.query.keyword
  const restaurants = restaurantList.results.filter((restaurant) => {
    return restaurant.name.toLowerCase().includes(keyword.toLowerCase())
  })
  res.render("index", { restaurants: restaurants, keyword: keyword })
})

app.listen(port, () => {
  console.log(`Express is listening on localhost:${port}`)
})
