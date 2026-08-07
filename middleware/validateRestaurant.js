// 只放行 http / https，擋掉 javascript: 這種點下去會執行程式碼的連結
const ALLOWED_PROTOCOLS = ['http:', 'https:']

const REQUIRED_TEXT_FIELDS = [
  ['name', '店名'],
  ['name_en', '英文店名'],
  ['category', '分類'],
  ['location', '地址'],
  ['phone', '電話'],
  ['description', '敘述']
]

function isSafeHttpUrl(value) {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value.trim())
    return ALLOWED_PROTOCOLS.includes(url.protocol)
  } catch (error) {
    return false
  }
}

// 從表單挑出我們認得的欄位，避免多餘的 key 被一起寫進資料庫
function pickRestaurantFields(body) {
  return {
    name: String(body.name || '').trim(),
    name_en: String(body.name_en || '').trim(),
    category: String(body.category || '').trim(),
    image: String(body.image || '').trim(),
    location: String(body.location || '').trim(),
    phone: String(body.phone || '').trim(),
    google_map: String(body.google_map || '').trim(),
    rating: String(body.rating || '').trim(),
    description: String(body.description || '').trim()
  }
}

// 回傳錯誤訊息陣列，空陣列代表通過
function validateRestaurant(data) {
  const errors = []

  REQUIRED_TEXT_FIELDS.forEach(([field, label]) => {
    if (!data[field]) errors.push(`${label}為必填`)
  })

  if (!isSafeHttpUrl(data.image)) {
    errors.push('圖片連結必須是 http 或 https 開頭的網址')
  }

  if (!isSafeHttpUrl(data.google_map)) {
    errors.push('Google 地圖連結必須是 http 或 https 開頭的網址')
  }

  const rating = Number(data.rating)
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    errors.push('評分必須是 0 到 5 之間的數字')
  }

  return errors
}

module.exports = { isSafeHttpUrl, pickRestaurantFields, validateRestaurant }
