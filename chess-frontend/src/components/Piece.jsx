import React, { useState } from 'react'
const testPieceStyle = {
  display: 'flex',
  justifyContent: 'center',
  height: '90%',
  width: '90%',
  borderRadius: '50%',
  borderWidth: 3,
  borderColor: 'blue',
  borderStyle: 'solid',
}
const draggedPieceStyle = {

}
const pieceStyle = {
  display: 'flex',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  transitionDuration: '350ms',
  transitionTimingFunction: 'ease-out'
}
const imgStyle = {
  marginTop: 5, 
  height: '90%',
  width: '90%',
}
const Piece = ({ piece, moving, reversedBoard }) => {
  if (moving) console.log('moving', moving)
  //const src = piece.color + piece.type + '.png'
  /*
  return (
    <div 
      style={dragging?draggedPieceStyle:{...testPieceStyle, borderColor, backgroundColor: piece.color, color: piece.color==='black' ? 'white' : 'black'}}
      draggable
      onDragStart={(event) => handleSelect(event)}
      onDragEnd={handleDragEnd}
      >
      
      
    </div>
  )
  */
  let x = 0
  let y = 0
  if (moving) {
    y = -((Math.floor(moving.from/8)-Math.floor(moving.to/8))*63)
    x = -(moving.from%8-moving.to%8)*63
    console.log('moving', x, y)
  }
  if (reversedBoard) {
    y = -y
    x = -x
  }
 
  return (
    <div 
      style={{ ...pieceStyle,transform: `translate(${x}px, ${y}px)` }}
      >
      <img style={imgStyle} src={`${piece.color}${piece.type}.png`} alt='' />
    </div>
  )
}

export default Piece