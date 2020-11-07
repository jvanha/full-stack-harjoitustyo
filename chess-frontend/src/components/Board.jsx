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
  const index = content[0]
  //console.log('attacked squares',attackedSquares)
  
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
    <div style={{ ...squareStyle, backgroundColor: color}} onClick={() => handleSelection(content)}>
      {content[1] && <Piece piece={content[1]} selectPiece={() => console.log('...')}/>}
    </div>
  )
}


const Board = ({ board, movePiece, attackedSquares, playerToMove, ...props}) => {
  const [ selectedSquare, setSelectedSquare ] = useState(null)
  const [ validMoves, setValidMoves ] = useState([])
  
  //console.log('selected', selectedSquare)
  //console.log(board)
  
  useEffect(() => {
    //console.log(playerToMove,'++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    if (playerToMove === 'white') {
      //console.log('castle rights',props.longCastleWhite, props.shortCastleWhite)
      setValidMoves(legitMoves(selectedSquare, board, props.longCastleWhite, props.shortCastleWhite))
    }
    else {
      setValidMoves(legitMoves(selectedSquare, board, props.longCastleBlack, props.shortCastleBlack))
    }
    
  },[selectedSquare, board])
  
  const handleSelection = (square) => {
    const id = square[0]
    //console.log('select id',id)
    if (!selectedSquare && board[id][1] && board[id][1].color=== playerToMove) {
      //console.log('new')
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
          attackedSquares={attackedSquares}
        />   
      ))}
    </div>
  )
}

export default Board