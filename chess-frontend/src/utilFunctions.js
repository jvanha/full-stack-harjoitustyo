


const legitPawnMoves = (squareId, pieceColor, board) => {
  if (pieceColor === 'white' && squareId>8 && !board[squareId-8][1]) {
    return [squareId-8]
  }
  if (pieceColor === 'black' && squareId<56 && !board[squareId+8][1]) {
    return [squareId+8]
  }
  return []
}
const pawnAttackSquares = (squareId, pieceColor, board) =>  {
  let squares = []
  if (pieceColor === 'white') {
    if (squareId > 7 && squareId%8 > 0) squares.push(squareId-8-1)
    if (squareId > 7 && squareId%8 < 7) squares.push(squareId-8+1)
  }
  if (pieceColor === 'black') {
    if (squareId < 53 && squareId%8 > 0) squares.push(squareId+8-1)
    if (squareId < 53 && squareId%8 < 7) squares.push(squareId+8+1)
  }
    return squares 
} 
const legitKingMoves = (squareId, pieceColor, board) => {
  const squareNotOccupied = (squareId) => {
    return !board[squareId][1] || board[squareId][1].color !== pieceColor
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

const legitRookMoves = (squareId, pieceColor, board) => {
  console.log('+++++++++++++', -1%8)
  const squareNotOccupied = (squareId) => {
    console.log('not occupied', squareId)
    return !board[squareId][1] || board[squareId][1].color !== pieceColor
  }
  let squares = []
  if (squareId%8 > 0) {
    let x = squareId - 1 
    while (x >= 0 && x%8 !== 7 && squareNotOccupied(x)) {
      squares.push(x)
      x -= 1
    }
  }
  if (squareId%8 < 7) {
    let x = squareId + 1 
    while (x >= 0 && x%8 !== 0 && squareNotOccupied(x)) {
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
  }
  if (Math.floor(squareId/8) < 7) {
    let x = squareId + 8 
    while (Math.floor(x/8) <= 7 && squareNotOccupied(x)) {
      console.log('x', x)
      console.log(Math.floor(x/8))
      squares.push(x)
      x += 8
    }
  }
  return squares
}

const legitBishopMoves = (squareId, pieceColor, board) => {
  const squareNotOccupied = (squareId) => {
    console.log('not occupied', squareId)
    return !board[squareId][1] || board[squareId][1].color !== pieceColor
  }
  let squares = []
  if (squareId%8 > 0) {
    if (Math.floor(squareId/8) > 0) {
      let x = squareId - 1 - 8
      while (x%8 >= 0 && x%8 !== 7 && Math.floor(x/8) >= 0 && squareNotOccupied(x)) {
        squares.push(x)
        x -= 9
      }
    }
    if (Math.floor(squareId/8) < 7) {
      let x = squareId - 1 + 8
      while (x%8 >= 0 && x%8 !== 7 && Math.floor(x/8) <= 7 && squareNotOccupied(x)) {
        squares.push(x)
        x += 7
      }
    }
  }
  if (squareId%8 < 7) {
    if (Math.floor(squareId/8) > 0) {
      let x = squareId + 1 - 8
      while (x%8 >= 0 && x%8 !== 0 && Math.floor(x/8) >= 0 && squareNotOccupied(x)) {
        squares.push(x)
        x -= 7
      }
    }
    if (Math.floor(squareId/8) < 7) {
      let x = squareId + 1 + 8
      while (x%8 >= 0 && x%8 !== 0 && Math.floor(x/8) <= 7 && squareNotOccupied(x)) {
        squares.push(x)
        x += 9
      }
    }
  }
  return squares
}

const legitQueenMoves = (squareId, pieceColor, board) => {
  return legitRookMoves(squareId, pieceColor, board).concat(legitBishopMoves(squareId, pieceColor, board))
}

const legitKnightMoves = (squareId, pieceColor, board) => {
  const squareNotOccupied = (squareId) => {
    console.log('not occupied', squareId)
    return !board[squareId][1] || board[squareId][1].color !== pieceColor
  }

  let squares = []
  if (Math.floor(squareId/8) > 1) {
    let x = squareId - 16 - 1
    if (x >= 0 && x%8 < 7 && squareNotOccupied(x))
      squares.push(x)
    x = squareId - 16 + 1
    if (x >= 0 && x%8 > 0 && squareNotOccupied(x))
      squares.push(x) 
  }
  if (Math.floor(squareId/8) < 6) {
    let x = squareId + 16 - 1
    if (x >= 0 && x%8 < 7 && squareNotOccupied(x))
      squares.push(x)
    x = squareId + 16 + 1
    if (x <= 63 && x%8 > 0 && squareNotOccupied(x))
      squares.push(x) 
  }
  if (squareId%8 > 1) {
    let x = squareId - 8 - 2
    if (x >= 0 && x%8 < squareId%8 && squareNotOccupied(x))
      squares.push(x)
    x = squareId + 8 - 2
    if (x <= 63 && x%8 < squareId%8 && squareNotOccupied(x))
      squares.push(x)
  }
  if (squareId%8 < 6) {
    let x = squareId - 8 + 2
    if (x >= 0 && x%8 > squareId%8 && squareNotOccupied(x))
      squares.push(x)
    x = squareId + 8 + 2
    if (x <= 63 && x%8 > squareId%8 && squareNotOccupied(x))
      squares.push(x)
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
  //if (pieceType === 'P') return legitPawnMoves(squareId, pieceColor, board)
  if (pieceType === 'P') return legitPawnMoves(squareId, pieceColor, board)
  if (pieceType === 'K') return legitKingMoves(squareId, pieceColor, board)
  if (pieceType === 'R') return legitRookMoves(squareId, pieceColor, board)
  if (pieceType === 'B') return legitBishopMoves(squareId, pieceColor, board)
  if (pieceType === 'Q') return legitQueenMoves(squareId, pieceColor, board)
  if (pieceType === 'N') return legitKnightMoves(squareId, pieceColor, board)
  console.log(pieceType)
  return []
}

const controlledSquares = (square, board) => {
  if (!square || !square[1])
    return null
  
  const squareId = square[0]
  const pieceType = square[1].type
  const pieceColor = square[1].color
  if (pieceType === 'P') return pawnAttackSquares(squareId, pieceColor, board)
  return legitMoves(square, board) 
} 

export const getAttackedSquares = (board, color) => {
  console.log('getAttackedSquares was called')
  console.log(board.filter(square => (square[1] && square[1].color===color)))
  return board.filter(square => (square[1] && square[1].color===color)).map(square => controlledSquares(square,board)).flat()
}

export const isInCheck = (color) => {
  
}