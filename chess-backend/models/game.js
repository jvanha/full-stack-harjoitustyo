const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  blackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  whiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  winner: {
    type: String,
    required: true,
  }
})

module.exports = mongoose.model('Game', schema)