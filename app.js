const express = require("express")
const mongoose = require("mongoose")

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}

const app = express()
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection
db.on("error", () => {
  console.log("mongodb error!")
})

db.once("open", () => {
  console.log("mongodb connected!")
})

const port = 3000
const exphbs = require("express-handlebars")
const restaurantList = require("./restaurant.json")

app.engine("handlebars", exphbs({ defaultLayout: "main" }))
app.set("view engine", "handlebars")

app.use(express.static("public"))

app.get("/", (req, res) => {
  res.render("index", { restaurants: restaurantList.results })
})

app.get("/restaurants/:restaurants_id", (req, res) => {
  const restaurant = restaurantList.results.find(
    (restaurant) => restaurant.id.toString() === req.params.restaurants_id
  )
  res.render("show", { restaurant: restaurant })
})

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
