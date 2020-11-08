import React, { useState } from 'react';
import Board from './components/Board'
import { getAttackedSquares, isCheckMated, isInCheck } from './utilFunctions'
let squares = Array(64)//[...Array(64).keys()] 
let i
for (i=0; i<64; i++) {
  squares[i] = [i, null]
}
squares[56] = [56, { type: 'R', color: 'white'}]
squares[50] = [50, { type: 'P', color: 'white'}]
squares[18] = [18, { type: 'K', color: 'black'}]
squares[14] = [14, { type: 'P', color: 'black'}]
squares[30] = [30, { type: 'R', color: 'black'}]
squares[45] = [45, { type: 'B', color: 'white'}]
squares[47] = [47, { type: 'Q', color: 'white'}]
squares[60] = [60, { type: 'K', color: 'white'}]
squares[3]  = [3, { type: 'N', color: 'black'}]
//console.log(squares)

const initBoard = []
function App() {
  const [ board, setBoard ] = useState(squares)
  const [ attackedSquares, setAttackedSquares ] = useState(null)
  const [ playerToMove, setPlayerToMove ] = useState('white')
  const [ longCastleWhite, setLongCastleWhite ] = useState(true)
  const [ shortCastleWhite, setShortCastleWhite ] = useState(true)
  const [ longCastleBlack, setLongCastleBlack ] = useState(true)
  const [ shortCastleBlack, setShortCastleBlack ] = useState(true)
  const [ enPassant, setEnpassant ] = useState(null)
  console.log('castle rights App')
  console.log(longCastleWhite, shortCastleWhite, longCastleBlack,shortCastleBlack)
  const movePiece = (from, to) => {
    const squareFrom = board[from]
    const color = squareFrom[1].color
    const type = squareFrom[1].type

    const newBoard = board.map(square => {
      if (square[0] === to) return [to, squareFrom[1]]
      if (square[0] === from) return [from, null]
      return square
    })
    if (!isInCheck(color, newBoard))
      if (type === 'K') {
        if (color === 'white') {
          setLongCastleWhite(false)
          setShortCastleWhite(false)
        } else {
          setLongCastleBlack(false)
          setShortCastleBlack(false)
        }
      }
      else if (type === 'R') {
        if (color === 'white') { 
          if (squareFrom[0] === 56) setLongCastleWhite(false)
          if (squareFrom[0] === 63) setShortCastleWhite(false)
        } else {
          if (squareFrom[0] === 0) setLongCastleBlack(false)
          if (squareFrom[0] === 7) setShortCastleBlack(false)
        }
      }
      setBoard(newBoard)
      setPlayerToMove(playerToMove === 'white' ? 'black' : 'white')
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
      <Board 
        board={board} 
        movePiece={movePiece}
        attackedSquares={attackedSquares}
        playerToMove={playerToMove}
        longCastleBlack={longCastleBlack}
        longCastleWhite={longCastleWhite}
        shortCastleBlack={shortCastleBlack}
        shortCastleWhite={shortCastleWhite}
      />
      {!attackedSquares && <button onClick={() => handleShow('black')}>show black's attack</button>}
      {!attackedSquares && <button onClick={() => handleShow('white')}>show white's attack</button>}
      {attackedSquares && <button onClick={() => handleShow('')}>hide attack</button>}
      <button onClick={() => isInCheck('black', board)}>is black in check</button>
    </div>
  );
}

export default App;
