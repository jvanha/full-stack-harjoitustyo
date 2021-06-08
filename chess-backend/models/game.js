const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  black: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  white: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  winner: {
    type: String,
    required: true,
  },
  moves: {
    type: Array,
    default: []
  },
  date: String

})

module.exports = mongoose.model('Game', schema)