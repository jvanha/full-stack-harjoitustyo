import React, { useState } from 'react';
import Board from './components/Board'
let squares = Array(64)//[...Array(64).keys()] 
let i
for (i=0; i<64; i++) {
  squares[i] = [i, null]
}
squares[6] = [6, { type: 'P', color: 'white'}]
console.log(squares)

function App() {
  const [ board, setBoard ] = useState(squares)
  
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
    </div>
  );
}

export default App;
