

const legitPawnMoves = (squareId, pieceColor, board) => {
  if (pieceColor === 'white' && squareId>8 && !board[squareId-8][1]) {
    return [squareId-8]
  }
  if (pieceColor === 'black' && squareId<56 && !board[squareId+8][1]) {
    return [squareId+8]
  }
  return []
}
const legidKingMoves = (squareId, pieceColor, board) => {
  const squareNotOccupied = (squareId) => {
    return !board[squareId][1] || board[squareId][1].color != pieceColor
  }
  let squares = []
  if (squareId%8 > 0) {
    if (squareNotOccupied(squareId-1))
      squares.push(squareId-1)
    console.log(!board[squareId-1+8][1])
    if (Math.floor(squareId/8) < 7 && squareNotOccupied(squareId-1+8))
      squares.push(squareId-1+8)
    if (Math.floor(squareId/8) > 0 && squareNotOccupied(squareId-1-8))
      squares.push(squareId-1-8)
  }
  if (squareId%8 < 7) {
    if (squareNotOccupied(squareId+1))
    squares.push(squareId+1)
    if (Math.floor(squareId/8) < 7 && squareNotOccupied(squareId+1+8))
      squares.push(squareId+1+8)
    if (Math.floor(squareId/8) > 0 && squareNotOccupied(squareId+1-8))
      squares.push(squareId+1-8)
  }
  if (Math.floor(squareId/8) < 7 && squareNotOccupied(squareId+8))
    squares.push(squareId+8)
  if (Math.floor(squareId/8) > 0 && squareNotOccupied(squareId-8))
    squares.push(squareId-8)
  return squares
}

const legidRookMoves = (squareId, pieceColor, board) => {
  console.log('+++++++++++++', -1%8)
  const squareNotOccupied = (squareId) => {
    console.log('not occupied', squareId)
    return !board[squareId][1] || board[squareId][1].color != pieceColor
  }
  let squares = []
  if (squareId%8 > 0) {
    let x = squareId - 1 
    while (x >= 0 && x%8 != 7 && squareNotOccupied(x)) {
      squares.push(x)
      x -= 1
    }
  }
  if (squareId%8 < 7) {
    let x = squareId + 1 
    while (x >= 0 && x%8 != 0 && squareNotOccupied(x)) {
      squares.push(x)
      x += 1
    }
  }
  if (Math.floor(squareId/8) > 0) {
    let x = squareId - 8 
    while (Math.floor(x/8) >= 0 && squareNotOccupied(x)) {
      console.log('x', x)
      console.log(Math.floor(x/8))
      squares.push(x)
      x -= 8
    }
    console.log(squares)
  }
  return squares
}
export const legitMoves = (square, board) => {
  //const squares = []
  if (!square || !square[1])
    return null
  
  const squareId = square[0]
  const pieceType = square[1].type
  const pieceColor = square[1].color
  console.log('piece type', pieceType)
  if (pieceType === 'P') return legitPawnMoves(squareId, pieceColor, board)
  if (pieceType === 'K') return legidKingMoves(squareId, pieceColor, board)
  if (pieceType === 'R') return legidRookMoves(squareId, pieceColor, board)
  console.log(pieceType)
  return []
}

export const getAttackedSquares = (board, color) => {
  console.log('getAttackedSquares was called')
  console.log(board.filter(square => (square[1] && square[1].color===color)))
  return board.filter(square => (square[1] && square[1].color===color)).map(square => legitMoves(square,board)).flat()
}