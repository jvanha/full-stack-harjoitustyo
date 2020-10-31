import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { legitMoves } from '../utilFunctions'
import Piece from './Piece'

const boardStyle = {
  height: 500,
  width: 500,
  display: 'flex',
  flexWrap: 'wrap'
}

const squareStyle = {
  display: 'flex',
  justifyContent: 'center',
  height: '12.5%',
  width: '12.5%'
}
const MySquare = ({ content, handleSelection, selectedSquare, validMoves }) => {
  //console.log('square', content)
  const index = content[0]
  
  let color = ((index + Math.floor(index/8))%2)===0 ? 'white' : 'black'
  if (content === selectedSquare)
    color = 'green'
  if (validMoves && validMoves.includes(content[0])) {
    console.log('CHECK',content[0], validMoves)
    console.log('CHECK',content[0] in validMoves)
    color = 'red'
  }
  return (
    <div style={{ ...squareStyle, backgroundColor: color}} onClick={() => handleSelection(content)}>
      {content[1] && <Piece piece={content[1]} selectPiece={() => console.log('...')}/>}
    </div>
  )
}


const Board = ({ board, movePiece }) => {
  const [ selectedSquare, setSelectedSquare ] = useState(null)
  const [ validMoves, setValidMoves ] = useState([])
  
  console.log('selected', selectedSquare)
  console.log(board)
  
  useEffect(() => {
    setValidMoves(legitMoves(selectedSquare, board))
  },[selectedSquare, board])
  
  const handleSelection = (square) => {
    const id = square[0]
    console.log('select id',id)
    if (!selectedSquare && board[id][1]) {
      console.log('new')
      setSelectedSquare(square)
    } 
    else if (selectedSquare && selectedSquare[0] === id) setSelectedSquare(null)
    else if (selectedSquare && validMoves.includes(id)){
      movePiece(selectedSquare[0], id)
      setSelectedSquare(null)
    }
      
  }
  
  return (
    <div style={boardStyle}>
      {board.map(element => (
        <MySquare 
          key={element[0]}
          content={element}
          selectedSquare={selectedSquare}
          validMoves={validMoves}
          handleSelection={handleSelection}
        />   
      ))}
    </div>
  )
}

export default Board