import React, { useState } from 'react';
import Board from './components/Board'
import { getAttackedSquares, isCheckMated, isInCheck } from './utilFunctions'
let squares = Array(64)//[...Array(64).keys()] 
let i
for (i=0; i<64; i++) {
  squares[i] = [i, null]
}
squares[50] = [50, { type: 'P', color: 'white'}]
squares[18] = [18, { type: 'K', color: 'black'}]
squares[14] = [14, { type: 'P', color: 'black'}]
squares[30] = [30, { type: 'R', color: 'black'}]
squares[45] = [45, { type: 'B', color: 'white'}]
squares[47] = [47, { type: 'Q', color: 'white'}]
squares[48] = [48, { type: 'K', color: 'white'}]
squares[3]  = [3, { type: 'N', color: 'black'}]
//console.log(squares)

const initBoard = []
function App() {
  const [ board, setBoard ] = useState(squares)
  const [ attackedSquares, setAttackedSquares ] = useState(null)
  const [ playerToMove, setPlayerToMove ] = useState('white')
  const movePiece = (from, to) => {
    const squareFrom = board[from]
    const newBoard = board.map(square => {
      if (square[0] === to) return [to, squareFrom[1]]
      if (square[0] === from) return [from, null]
      return square
    })
    if (!isInCheck(squareFrom[1].color, newBoard))
      setBoard(newBoard)
  }
  const handleShow = (color) => {
    if (attackedSquares == null) {
      setAttackedSquares(getAttackedSquares(board, color))
    } else {
      setAttackedSquares(null)
    }
  }  
  return (
    <div>
      {board && isCheckMated('black',board) && <div>black checkmated</div>}
      <Board board={board} movePiece={movePiece} attackedSquares={attackedSquares}/>
      {!attackedSquares && <button onClick={() => handleShow('black')}>show black's attack</button>}
      {!attackedSquares && <button onClick={() => handleShow('white')}>show white's attack</button>}
      {attackedSquares && <button onClick={() => handleShow('')}>hide attack</button>}
      <button onClick={() => isInCheck('black', board)}>is black in check</button>
    </div>
  );
}

export default App;
