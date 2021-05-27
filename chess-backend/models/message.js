const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  writer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: String,
  date: String
  
})

module.exports = mongoose.model('Message', schema)