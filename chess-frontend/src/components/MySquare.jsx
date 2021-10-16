import React from 'react'
import Piece from './Piece'


const squareStyle = {
  display: 'flex',
  justifyContent: 'center',
  height: '12.5%',
  width: '12.5%',
}


const MySquare = ({
  content,
  handleSelection,
  selectedSquare,
  validMoves,
  attackedSquares,
  settings,
  movingPiece,
  reversed,
  handleDragStart,
  handleDragEnter,
  handleDrop,
  dragging }) => {
  
  
  const index = content[0]
  let color = ((index + Math.floor(index/8))%2)===0 ? '#f58a42' : '#52170d'

  if (content === selectedSquare) {
    color = 'green'
  }
  if (settings && settings.showLegalMoves && validMoves && validMoves.includes(content[0])) {
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
      onDragEnter={(e) => handleDragEnter(e, content[0])}
      onDrop={(e) => handleDrop(e, content[0])}
      onDragOver={(e) => {e.preventDefault()}}
    >
      {content[1] &&
        <Piece
          draggable
          piece={content[1]}
          position={content[0]}
          moving={(movingPiece && content[0] === movingPiece.from) ? movingPiece : null}
          reversedBoard={reversed}
          handleDragStart={handleDragStart}
          dragging={dragging}
        />}
      
    </div>
  )
}

export default MySquare