import React, { useState } from 'react';
import Board from './components/Board'
let squares = Array(64)//[...Array(64).keys()] 
let i
for (i=0; i<64; i++) {
  squares[i] = [i, null]
}
squares[50] = [50, { type: 'P', color: 'white'}]
squares[18] = [18, { type: 'K', color: 'black'}]
squares[14] = [14, { type: 'P', color: 'black'}]
console.log(squares)

const initBoard = []
function App() {
  const [ board, setBoard ] = useState(squares)
  const [ showAttack, setShowAttack ] = useState(false)
  const movePiece = (from, to) => {
    const squareFrom = board[from]
    setBoard(board.map(square => {
      if (square[0] === to) return [to, squareFrom[1]]
      if (square[0] === from) return [from, null]
      return square
    }))
  }
  return (
    <div>
      <Board board={board} movePiece={movePiece}/>
      <button onSubmit={() => setShowAttack(!showAttack)}>show</button>
    </div>
  );
}

export default App;
