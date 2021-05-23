import axios from 'axios'

// HYÖDYTÖN
const evaluatePosition = async (board, activeColor, whiteLong, whiteShort, blackLong, blackShort, enPassant) => {
  const position = getFenPosition(board)
  const castling = getFenCastling(whiteLong, whiteShort, blackLong, blackShort)
  const fenEnPassant = getFenEnPassant(enPassant)
  const fenActiveColor = activeColor ? activeColor[0] : 'w'
  try {
    const uri = `https://www.chessdb.cn/cdb.php?action=querypv&board=${position}%20${fenActiveColor}%20${castling}%20${fenEnPassant}%20${0}%20${0}&json=1`
    console.log(uri)
    const response = await axios.get(uri)
    return response.data
  } catch (exception) {
    console.log(exception)
    const uri = `https://lichess.org/api/cloud-eval?fen=${position}%20${fenActiveColor}%20${castling}%20-%20${0}%20${0}`
    console.log(uri)
    const response = await axios.get(uri)
    return response.data
  }
}

const getMove = async (board, activeColor, whiteLong, whiteShort, blackLong, blackShort, enPassant) => {
  const evaluation = await evaluatePosition(board, activeColor, whiteLong, whiteShort, blackLong, blackShort, enPassant)
  console.log('evaluation',evaluation)
  if (evaluation && evaluation.pv) {
    console.log(evaluation && evaluation.pvs)
    const nextFenMove = evaluation.pv[0].substring(0,5)
    console.log('nextFenMove',nextFenMove)
 
    const from = (8-parseInt(nextFenMove[1]))*8 + nextFenMove.charCodeAt(0) - 97

    const to = (8-parseInt(nextFenMove[3]))*8 + nextFenMove.charCodeAt(2) - 97
    const move = { from, to }
    console.log('move',move)
    return move
  }
  return {from: 0, to: 0}
  
}
const getFenPosition = (board) => {
  let position = ''
  let emptyCount = 0
  board.forEach(square => {  
    if (square[0] > 0 && square[0]%8 === 0) {
      if (emptyCount > 0) {
        position += emptyCount
        emptyCount = 0
      }
      position += '/'
    }
    if (square[1]) {
      if (emptyCount > 0) {
        position += emptyCount
        emptyCount = 0
      }
      position = position.concat(square[1].color === 'black' ? square[1].type.toLowerCase() : square[1].type)
    } else {
      ++emptyCount
    }
    
  })
  return position
}
const getFenCastling = (whiteLong, whiteShort, blackLong, blackShort) => {
  let s = ''
  if (whiteShort) s += 'K'
  if (whiteLong) s += 'Q'
  if (blackShort) s += 'k'
  if (blackLong) s += 'q'
  if (s.length === 0) return '-'
  return s
}

const getFenEnPassant = (enPassant) => {
  if (!enPassant) return '-'
  const columns = 'abcdefgh'
  const row = Math.floor((63-enPassant)/8+1)
  const column = columns[enPassant%8]
  return column + row
}

export const toFen = (board, whiteLong, whiteShort, blackLong, blackShort, enPassant) => {
  const position = getFenPosition(board)
  const castling = getFenCastling(whiteLong, whiteShort, blackLong, blackShort)
  const fenEnPassant = getFenEnPassant(enPassant)
  return `${position} ${castling} ${fenEnPassant}`
}

export default { evaluatePosition, getMove }