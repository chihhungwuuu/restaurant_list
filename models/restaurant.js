const mongoose = require("mongoose")
const Schema = mongoose.Schema
const restaurantSchema = new Schema({
  id: {
    type: Number, // 資料型別是字串
    required: true // 這是個必填欄位
  },
  name: {
    type: String,
    required: true
  },
  name_en: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  google_map: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})
module.exports = mongoose.model("Restaurant", restaurantSchema)
