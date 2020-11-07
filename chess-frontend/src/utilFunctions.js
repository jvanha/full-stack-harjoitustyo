
const legitPawnMoves = (squareId, pieceColor, board) => {
  const squareOccupiedByEnemy = (squareId) => {
    if (!board[squareId][1] || board[squareId][1].color === pieceColor )
      return false
    return true
  }
  let squares = []
  if (pieceColor === 'white' && squareId>8 && !board[squareId-8][1]) {
    squares.push(squareId-8)
  }
  if (pieceColor === 'black' && squareId<56 && !board[squareId+8][1]) {
    squares.push(squareId+8)
  }
  //console.log('pawnAttackSquares()', pawnAttackSquares(squareId, pieceColor, board))
  pawnAttackSquares(squareId, pieceColor, board).forEach((squareId) => {
    if (squareOccupiedByEnemy(squareId))
      squares.push(squareId)
  })
  return squares
}
const pawnAttackSquares = (squareId, pieceColor, board) =>  {
  const squareNotOccupied = (squareId) => {
    return !board[squareId][1] || board[squareId][1].color !== pieceColor
  }
  let squares = []
  if (pieceColor === 'white') {
    if (squareId > 7 && squareId%8 > 0 && squareNotOccupied(squareId-8-1)) 
      squares.push(squareId-8-1)
    if (squareId > 7 && squareId%8 < 7 && squareNotOccupied(squareId-8-1)) 
      squares.push(squareId-8+1)
  }
  if (pieceColor === 'black') {
    if (squareId < 53 && squareId%8 > 0) squares.push(squareId+8-1)
    if (squareId < 53 && squareId%8 < 7) squares.push(squareId+8+1)
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
    //console.log(!board[squareId-1+8][1])
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
const legitKingMoves = (squareId, pieceColor, board, longCastleRight, shortCastleRight) => {
  console.log('LEGIT KING MOVES')
  console.log(squareId, pieceColor,longCastleRight, shortCastleRight)
  let squares = kingAttackSquares(squareId, pieceColor, board)
  if (pieceColor === 'white') {
    const squaresUnderAttack = getAttackedSquares(board, 'black')
    if (longCastleRight && !board[57][1] && !board[58][1] && !board[59][1] && [57,58,59,60].filter(value => squaresUnderAttack.includes(value)).length === 0) 
      squares.push(58)
    if (shortCastleRight && !board[60][1] && !board[61][1] && [60,61,62].filter(value => squaresUnderAttack.includes(value)).length === 0)
      squares.push(61)
  }
  if (pieceColor === 'black') {
    const squaresUnderAttack = getAttackedSquares(board, 'white')
    console.log('squaresUnderAttack',squaresUnderAttack)
    console.log(longCastleRight, !board[1][1], !board[2][1], !board[3][1], [1,2,3,4].filter(value => squaresUnderAttack.includes(value)).length === 0)
    if (longCastleRight && !board[1][1] && !board[2][1] && !board[3][1] && [1,2,3,4].filter(value => squaresUnderAttack.includes(value)).length === 0) 
      squares.push(2)
    if (shortCastleRight && !board[5][1] && !board[6][1] && [4,5,6].filter(value => squaresUnderAttack.includes(value)).length === 0)
      squares.push(6)
  }
  console.log(squares)
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
      //console.log('x', x)
      //console.log(Math.floor(x/8))
      squares.push(x)
      if (squareOccupiedByEnemy(x)) break
      x -= 8
    }
  }
  if (Math.floor(squareId/8) < 7) {
    let x = squareId + 8 
    while (Math.floor(x/8) <= 7 && squareNotOccupied(x)) {
      //console.log('x', x)
      //console.log(Math.floor(x/8))
      squares.push(x)
      if (squareOccupiedByEnemy(x)) break
      x += 8
    }
  }
  return squares
}

const bishopAttackSquares = (squareId, pieceColor, board) => {
  const squareNotOccupied = (squareId) => {
    //console.log('not occupied', squareId)
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
    //console.log('not occupied', squareId)
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

export const attackSquares = (square, board) => {
  //const squares = []
  if (!square || !square[1])
    return null
  
  const squareId = square[0]
  const pieceType = square[1].type
  const pieceColor = square[1].color
  //console.log('piece type', pieceType)
  //if (pieceType === 'P') return legitPawnMoves(squareId, pieceColor, board)
  if (pieceType === 'P') return pawnAttackSquares(squareId, pieceColor, board)
  if (pieceType === 'K') return kingAttackSquares(squareId, pieceColor, board)
  if (pieceType === 'R') return rookAttackSquares(squareId, pieceColor, board)
  if (pieceType === 'B') return bishopAttackSquares(squareId, pieceColor, board)
  if (pieceType === 'Q') return queenAttackSquares(squareId, pieceColor, board)
  if (pieceType === 'N') return knightAttackSquares(squareId, pieceColor, board)
  //console.log(pieceType)
  return []
}

export const legitMoves = (square, board, longCastleRight, shortCastleRight) => {
  const move = (to) => {
    const newBoard = board.map(sq => {
      if (sq[0] === to) return [to, square[1]]
      if (sq[0] === square[0]) return [square[0], null]
      return sq
    })
    console.log('newBoard',newBoard)
    return newBoard
  }
  let squares = []
  if (!square || !square[1])
    return null
  
  const squareId = square[0]
  const pieceType = square[1].type
  const pieceColor = square[1].color
  if (pieceType === 'P') squares = legitPawnMoves(squareId, pieceColor, board)
  else if (pieceType === 'K') squares = legitKingMoves(squareId, pieceColor, board, longCastleRight, shortCastleRight)
  else squares = attackSquares(square, board)
  //console.log('FAIL')
  //console.log('pieceType', pieceType)
  //console.log('squares',squares)
  return squares.filter((square) => !isInCheck(pieceColor, move(square)))
} 

export const getAttackedSquares = (board, color) => {
  //console.log('getAttackedSquares was called')
  //console.log(board.filter(square => (square[1] && square[1].color===color)))
  return board.filter(square => (square[1] && square[1].color===color)).map(square => attackSquares(square,board)).flat()
}
export const getAllLegidMoves = (board, color, longCastleRight, shortCastleRight) => {
  return board.filter(square => (square[1] && square[1].color===color)).map(square => legitMoves(square,board,longCastleRight, shortCastleRight)).flat()
}

export const isCheckMated = (color, board) => {
  //console.log('perk')
  return isInCheck(color,board) && getAllLegidMoves(board, color, false, false).length === 0
}
export const isDrawByLackOfLegitMoves = (color, board) => {
  return !isInCheck(color,board) && getAllLegidMoves(board, color, false, false).length === 0
}


export const isInCheck = (color, board) => {
  //console.log('is in check?')
  //console.log('color', color)
  //console.log('board', board)
  const kingSquare = board.filter((square) => (square[1] && square[1].color === color && square[1].type === 'K'))[0]
  //console.log('kingSquare',kingSquare)
  //console.log(getAttackedSquares(board, color==='white'? 'black': 'white').includes(kingSquare[0]))
  return getAttackedSquares(board, color==='white'? 'black': 'white').includes(kingSquare[0])
}