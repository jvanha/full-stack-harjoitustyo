
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

export const toFen = (board, activeColor, whiteLong, whiteShort, blackLong, blackShort, enPassant) => {
  const position = getFenPosition(board)
  const castling = getFenCastling(whiteLong, whiteShort, blackLong, blackShort)
  const fenEnPassant = getFenEnPassant(enPassant)
  const fenActiveColor = activeColor ? activeColor[0] : 'w'
  return `${position} ${fenActiveColor} ${castling} ${fenEnPassant}`
}

