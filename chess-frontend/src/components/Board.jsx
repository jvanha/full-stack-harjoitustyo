import React from 'react'
import { useState } from 'react'
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
const MySquare = ({ content, handleSelection }) => {
  //console.log('square', content)
  const index = content[0]

  const color = ((index + Math.floor(index/8))%2)===0 ? 'white' : 'black'
  return (
    <div style={{ ...squareStyle, backgroundColor: color}} onClick={() => handleSelection(content[0])}>
      {content[1] && <Piece piece={content[1]} selectPiece={() => console.log('...')}/>}
    </div>
  )
}


const Board = ({ board, movePiece }) => {
  const [ selectedSquare, setSelectedSquare ] = useState(null)
  console.log('selected', selectedSquare)
  console.log(board)
  const handleSelection = (id) => {
    console.log('select id',id)
    if (!selectedSquare && board[id][1]) {
      console.log('new')
      setSelectedSquare(id)
    } 
    else if (selectedSquare === id) setSelectedSquare(null)
    else if (selectedSquare){
      movePiece(selectedSquare, id)
      setSelectedSquare(null)
    }
      
  }
  return (
    <div style={boardStyle}>
      {board.map(element => (
        <MySquare 
          key={element[0]}
          content={element}
          handleSelection={handleSelection}
        />   
      ))}
    </div>
  )
}

export default Board