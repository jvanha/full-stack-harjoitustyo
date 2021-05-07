import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { legitMoves } from '../utilFunctions'
import Piece from './Piece'

const boardStyle = {
  height: 500,
  width: 500,
  display: 'flex',
  flexWrap: 'wrap',
  padding: 10
}
const boardStyleReversed = {
  height: 500,
  width: 500,
  display: 'flex',
  flexDirection: 'row-reverse',
  flexWrap: 'wrap-reverse'
}

const squareStyle = {
  display: 'flex',
  justifyContent: 'center',
  height: '12.5%',
  width: '12.5%'
}
const MySquare = ({ content, handleSelection, selectedSquare, validMoves, attackedSquares }) => {
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
      {content[1] && <Piece piece={content[1]}/>}
      
    </div>
  )
}
//{content[1] && <Piece piece={content[1]} selectPiece={() => handleSelection(content)}/>}

const Board = ({ board, movePiece, attackedSquares, playerToMove, enPassant, myColor, ...props}) => {
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
    console.log('handleSelection selectedSquare', selectedSquare)
    console.log('handleSelection squareDraggedOver', squareDraggedOver)
    if (myColor !== playerToMove) return
    const id = square[0]
    if (selectedSquare && validMoves.includes(squareDraggedOver)) {
      console.log('selectedSquare && validMoves.includes(squareDraggedOver)')
      movePiece(selectedSquare[0], squareDraggedOver)
      setSelectedSquare(null)
    }
    else if (board[id][1] && board[id][1].color=== playerToMove) {
      console.log('!selectedSquare && board[id][1] && board[id][1].color=== playerToMove')
      setSelectedSquare(square)
    } 
    else if (selectedSquare && selectedSquare[0] === id) setSelectedSquare(null)
    else if (selectedSquare && validMoves.includes(id)) {
      movePiece(selectedSquare[0], id)
      setSelectedSquare(null)
    }
    else {
      setSelectedSquare(null)
    }
      
  }
  
  
  return (
    <div style={myColor==="black" ? boardStyleReversed : boardStyle}>
      {board.map(element => (
        <MySquare
          draggable='false'
          key={element[0]}
          content={element}
          selectedSquare={selectedSquare}
          validMoves={validMoves}
          handleSelection={handleSelection}
          attackedSquares={attackedSquares}
        />   
      ))}
    </div>
  )
}

export default Board