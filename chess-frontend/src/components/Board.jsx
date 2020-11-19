import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { attackedSquares, legitMoves } from '../utilFunctions'
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
const MySquare = ({ content, handleSelection, selectedSquare, validMoves, attackedSquares }) => {
  const [ droppable, setDroppable ] = useState(false)
  const index = content[0]
  let color = ((index + Math.floor(index/8))%2)===0 ? '#f58a42' : '#52170d'
  
  if (content === selectedSquare)
    color = 'green'
  if (validMoves && validMoves.includes(content[0])) {
    color = 'red'
  }
  if (attackedSquares && attackedSquares.includes(content[0])) {
    color = 'purple'
  }

  
  return (
    <div
      id={index}
      style={{ ...squareStyle, backgroundColor: color}} 
      onClick={() => handleSelection(content)}
    >
      {content[1] && <Piece piece={content[1]} selectPiece={() => handleSelection(content)}/>}
    </div>
  )
}


const Board = ({ board, movePiece, attackedSquares, playerToMove, enPassant, ...props}) => {
  const [ selectedSquare, setSelectedSquare ] = useState(null)
  const [ validMoves, setValidMoves ] = useState([])

  useEffect(() => {
    if (playerToMove === 'white') {
      setValidMoves(legitMoves(selectedSquare, board, props.longCastleWhite, props.shortCastleWhite, enPassant))
    }
    else {
      setValidMoves(legitMoves(selectedSquare, board, props.longCastleBlack, props.shortCastleBlack, enPassant))
    }
    
  },[selectedSquare, board])
  
  const handleSelection = (square) => {
    const id = square[0]
    if (!selectedSquare && board[id][1] && board[id][1].color=== playerToMove) {
      setSelectedSquare(square)
    } 
    else if (selectedSquare && selectedSquare[0] === id) setSelectedSquare(null)
    else if (selectedSquare && validMoves.includes(id)){
      movePiece(selectedSquare[0], id)
      setSelectedSquare(null)
    }
      
  }
  const handleDrop = (event, element) => {
    console.log('handle Drop')
    const id = event.dataTransfer.getData('id')
    if (validMoves && validMoves.includes(element[0])) {
      movePiece(id, element[0])
      
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
          attackedSquares={attackedSquares}
          onDrop={(event, element) => handleDrop(event, element)}
        />   
      ))}
    </div>
  )
}

export default Board