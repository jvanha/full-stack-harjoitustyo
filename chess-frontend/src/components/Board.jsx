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
const MySquare = ({ content, handleSelection, selectedSquare, validMoves, attackedSquares, handleDragOver }) => {
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
      onDragEnter={handleDragOver}
    >
      {content[1] && <Piece piece={content[1]} selectPiece={() => handleSelection(content)}/>}
    </div>
  )
}


const Board = ({ board, movePiece, attackedSquares, playerToMove, enPassant, ...props}) => {
  const [ selectedSquare, setSelectedSquare ] = useState(null)
  const [ validMoves, setValidMoves ] = useState([])
  const [ squareDraggedOver, setSquareDraggedOver ] = useState(null)

  useEffect(() => {
    if (playerToMove === 'white') {
      setValidMoves(legitMoves(selectedSquare, board, props.longCastleWhite, props.shortCastleWhite, enPassant))
    }
    else {
      setValidMoves(legitMoves(selectedSquare, board, props.longCastleBlack, props.shortCastleBlack, enPassant))
    }
    
  },[selectedSquare, board])
  
  const handleSelection = (square) => {
    console.log('selectedSquare',selectedSquare)
    console.log('squareDraggedOver',squareDraggedOver)
    console.log(square)
    const id = square[0]
    if (selectedSquare && validMoves.includes(squareDraggedOver)) {
      movePiece(selectedSquare[0], squareDraggedOver)
      setSelectedSquare(null)
    }
    else if (!selectedSquare && board[id][1] && board[id][1].color=== playerToMove) {
      setSelectedSquare(square)
    } 
    else if (selectedSquare && selectedSquare[0] === id) setSelectedSquare(null)
    else if (selectedSquare && validMoves.includes(id)) {
      movePiece(selectedSquare[0], id)
      setSelectedSquare(null)
    } 
      
  }
  
  
  return (
    <div style={boardStyle}>
      {board.map(element => (
        <MySquare
          draggable='false'
          key={element[0]}
          content={element}
          selectedSquare={selectedSquare}
          validMoves={validMoves}
          handleSelection={handleSelection}
          attackedSquares={attackedSquares}
          handleDragOver={() => setSquareDraggedOver(element[0])}
        />   
      ))}
    </div>
  )
}

export default Board