
const legalPawnMoves = (squareId, pieceColor, board, enPassant) => {
  const squareOccupiedByEnemy = (squareId) => {
    if (!board[squareId][1] || board[squareId][1].color === pieceColor )
      return false
    return true
  }
  let squares = []
  if (pieceColor === 'white' && squareId>8 && !board[squareId-8][1]) {
    squares.push(squareId-8)
    if (Math.floor(squareId/8) === 6 && !board[squareId-16][1])
      squares.push(squareId-16) 
  }
  if (pieceColor === 'black' && squareId<56 && !board[squareId+8][1]) {
    squares.push(squareId+8)
    if (Math.floor(squareId/8) === 1 && !board[squareId+16][1])
      squares.push(squareId+16) 
  }
  pawnAttackSquares(squareId, pieceColor, board, enPassant).forEach((squareId) => {
    if (squareOccupiedByEnemy(squareId) || enPassant === squareId)
      squares.push(squareId)
  })
  return squares
}
const pawnAttackSquares = (squareId, pieceColor, board) =>  {
  const squareNotOccupied = (squareId) => {
    return !board[squareId][1] || board[squareId][1].color !== pieceColor
  }
  let squares = []
  if (pieceColor === 'white' && squareId > 7) {
    if (squareId%8 > 0 && squareNotOccupied(squareId-8-1)) 
      squares.push(squareId-8-1)
    if (squareId%8 < 7 && squareNotOccupied(squareId-8+1)) 
      squares.push(squareId-8+1)
  }
  if (pieceColor === 'black' && squareId < 53) {
    if (squareId%8 > 0 && squareNotOccupied(squareId+8-1))
      squares.push(squareId+8-1)
    if (squareId%8 < 7 && squareNotOccupied(squareId+8+1))
      squares.push(squareId+8+1)
  }
  return squares 
}

const kingAttackSquares = (squareId, pieceColor, board) => {
  const squareNotOccupied = (squareId) => {
    return !board[squareId][1] || board[squareId][1].color !== pieceColor
  }
  let squares = []
  if (squareId%8 > 0) {
    if (squareNotOccupied(squareId-1))
      squares.push(squareId-1)
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
const legalKingMoves = (squareId, pieceColor, board, longCastleRight, shortCastleRight) => {
  let squares = kingAttackSquares(squareId, pieceColor, board)
  if (pieceColor === 'white') {
    const squaresUnderAttack = getAttackedSquares(board, 'black')
    if (longCastleRight && !board[57][1] && !board[58][1] && !board[59][1] && [57,58,59,60].filter(value => squaresUnderAttack.includes(value)).length === 0) 
      squares.push(58)
    if (shortCastleRight && !board[61][1] && !board[62][1] && [60,61,62].filter(value => squaresUnderAttack.includes(value)).length === 0)
      squares.push(62)
  }
  if (pieceColor === 'black') {
    const squaresUnderAttack = getAttackedSquares(board, 'white')
    if (longCastleRight && !board[1][1] && !board[2][1] && !board[3][1] && [1,2,3,4].filter(value => squaresUnderAttack.includes(value)).length === 0) 
      squares.push(2)
    if (shortCastleRight && !board[5][1] && !board[6][1] && [4,5,6].filter(value => squaresUnderAttack.includes(value)).length === 0)
      squares.push(6)
  }
  return squares
}

const rookAttackSquares = (squareId, pieceColor, board) => {
  const squareNotOccupied = (squareId) => {
    return !board[squareId][1] || board[squareId][1].color !== pieceColor
  }
  
  const squareOccupiedByEnemy = (squareId) => {
    if (!board[squareId][1] || board[squareId][1].color === pieceColor )
      return false
    return true
  }

  let squares = []
  if (squareId%8 > 0) {
    let x = squareId - 1 
    while (x >= 0 && x%8 !== 7 && squareNotOccupied(x)) {
      squares.push(x)
      if (squareOccupiedByEnemy(x)) break
      x -= 1
    }
  }
  if (squareId%8 < 7) {
    let x = squareId + 1 
    while (x >= 0 && x%8 !== 0 && squareNotOccupied(x)) {
      squares.push(x)
      if (squareOccupiedByEnemy(x)) break
      x += 1
    }
  }
  if (Math.floor(squareId/8) > 0) {
    let x = squareId - 8 
    while (Math.floor(x/8) >= 0 && squareNotOccupied(x)) {
      squares.push(x)
      if (squareOccupiedByEnemy(x)) break
      x -= 8
    }
  }
  if (Math.floor(squareId/8) < 7) {
    let x = squareId + 8 
    while (Math.floor(x/8) <= 7 && squareNotOccupied(x)) {
      squares.push(x)
      if (squareOccupiedByEnemy(x)) break
      x += 8
    }
  }
  return squares
}

const bishopAttackSquares = (squareId, pieceColor, board) => {
  const squareNotOccupied = (squareId) => {
    return !board[squareId][1] || board[squareId][1].color !== pieceColor
  }

  const squareOccupiedByEnemy = (squareId) => {
    if (!board[squareId][1] || board[squareId][1].color === pieceColor )
      return false
    return true
  }

  let squares = []
  if (squareId%8 > 0) {
    if (Math.floor(squareId/8) > 0) {
      let x = squareId - 1 - 8
      while (x%8 >= 0 && x%8 !== 7 && Math.floor(x/8) >= 0 && squareNotOccupied(x)) {
        squares.push(x)
        if (squareOccupiedByEnemy(x)) break
        x -= 9
      }
    }
    if (Math.floor(squareId/8) < 7) {
      let x = squareId - 1 + 8
      while (x%8 >= 0 && x%8 !== 7 && Math.floor(x/8) <= 7 && squareNotOccupied(x)) {
        squares.push(x)
        if (squareOccupiedByEnemy(x)) break
        x += 7
      }
    }
  }
  if (squareId%8 < 7) {
    if (Math.floor(squareId/8) > 0) {
      let x = squareId + 1 - 8
      while (x%8 >= 0 && x%8 !== 0 && Math.floor(x/8) >= 0 && squareNotOccupied(x)) {
        squares.push(x)
        if (squareOccupiedByEnemy(x)) break
        x -= 7
      }
    }
    if (Math.floor(squareId/8) < 7) {
      let x = squareId + 1 + 8
      while (x%8 >= 0 && x%8 !== 0 && Math.floor(x/8) <= 7 && squareNotOccupied(x)) {
        squares.push(x)
        if (squareOccupiedByEnemy(x)) break
        x += 9
      }
    }
  }
  return squares
}

const queenAttackSquares = (squareId, pieceColor, board) => {
  return rookAttackSquares(squareId, pieceColor, board).concat(bishopAttackSquares(squareId, pieceColor, board))
}

const knightAttackSquares = (squareId, pieceColor, board) => {
  const squareNotOccupied = (squareId) => {
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

export const attackSquares = (square, board, enPassant) => {
  if (!square || !square[1])
    return null
  
  const squareId = square[0]
  const pieceType = square[1].type
  const pieceColor = square[1].color
  
  if (pieceType === 'P') return pawnAttackSquares(squareId, pieceColor, board)
  if (pieceType === 'K') return kingAttackSquares(squareId, pieceColor, board)
  if (pieceType === 'R') return rookAttackSquares(squareId, pieceColor, board)
  if (pieceType === 'B') return bishopAttackSquares(squareId, pieceColor, board)
  if (pieceType === 'Q') return queenAttackSquares(squareId, pieceColor, board)
  if (pieceType === 'N') return knightAttackSquares(squareId, pieceColor, board)
  return []
}

export const legalMoves = (square, board, longCastleRight, shortCastleRight, enPassant) => {
  const move = (to) => {
    const newBoard = board.map(sq => {
      if (sq[0] === to) return [to, square[1]]
      if (sq[0] === square[0]) return [square[0], null]
      return sq
    })
    return newBoard
  }
  let squares = []
  if (!square || !square[1])
    return null
  
  const squareId = square[0]
  const pieceType = square[1].type
  const pieceColor = square[1].color
  if (pieceType === 'P') squares = legalPawnMoves(squareId, pieceColor, board, enPassant)
  else if (pieceType === 'K') squares = legalKingMoves(squareId, pieceColor, board, longCastleRight, shortCastleRight)
  else squares = attackSquares(square, board)
  return squares.filter((square) => !isInCheck(pieceColor, move(square)))
} 

export const getAttackedSquares = (board, color) => {
  return [...new Set(board.filter(square => (square[1] && square[1].color===color)).map(square => attackSquares(square,board)).flat())]
}
export const getAllLegidMoves = (board, color, longCastleRight, shortCastleRight, enPassant) => {
  return [...new Set(board.filter(square => (square[1] && square[1].color===color)).map(square => legalMoves(square,board,longCastleRight, shortCastleRight, enPassant)).flat())]
}

export const isCheckMated = (color, board, enPassant) => {
  const check = isInCheck(color, board)
  const result = isInCheck(color,board) && getAllLegidMoves(board, color, false, false, enPassant).length === 0
  return result
}
export const isDrawByLackOflegalMoves = (color, board, enPassant) => {
  return !isInCheck(color,board) && getAllLegidMoves(board, color, false, false, enPassant).length === 0
}
export const isDrawByInsufficientMaterial = (board) => {
  const pieces = board.filter(square => square[1] && square[1].type !== 'K')
  if (pieces.length === 0) return true
  else if (pieces.length === 1) {
    if (pieces.type[0][1] === 'N' || pieces[0][1].type === 'B') return true
  }
  else if (pieces.length === 2) {
    if (pieces[0][1].color !== pieces[1][1].color) {
      if (pieces[0][1].type === 'B' && pieces[1][1].type === 'B' && pieces[0][0]%2 === pieces[1][0]%2) {
        return true
      }
    }
      
  }
  return false
}


export const isInCheck = (color, board) => {
  const kingSquare = board.filter((square) => (square[1] && square[1].color === color && square[1].type === 'K'))
  
  if(!kingSquare || !kingSquare[0]) return false
  const result = getAttackedSquares(board, color==='white'? 'black': 'white').includes(kingSquare[0][0])

  return result
}