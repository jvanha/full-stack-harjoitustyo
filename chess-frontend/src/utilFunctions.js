export const legitMoves = (square, board) => {
  //const squares = []
  if (!square || !square[1])
    return null
  
  const squareId = square[0]
  const pieceType = square[1].type
  const pieceColor = square[1].color
  console.log('piece type', pieceType)
  if (pieceType === 'P') {
    if (pieceColor === 'white' && squareId>8) {
      return [squareId-8]
    }
    if (pieceColor === 'black' && squareId<56) {
      return [squareId+8]
    }
  }
  if (pieceType === 'K') {
    let squares = []
    if (squareId%8 > 0) {
      squares.push(squareId-1)
      if (Math.floor(squareId/8) < 7)
        squares.push(squareId-1+8)
      if (Math.floor(squareId/8) > 0)
        squares.push(squareId-1-8)
    }
    if (squareId%8 < 7) {
      squares.push(squareId+1)
      if (Math.floor(squareId/8) < 7)
        squares.push(squareId+1+8)
      if (Math.floor(squareId/8) > 0)
        squares.push(squareId+1-8)
    }
    if (Math.floor(squareId/8) < 7)
      squares.push(squareId+8)
    if (Math.floor(squareId/8) > 0)
      squares.push(squareId-8)
    return squares
  }
  console.log(pieceType)
  return []
}

export const attacedSquares = (board, color) => {
  return board.filter(square => (square[0].color===color)).map(square => legitMoves(square,board)).flat()
}