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
}
const imgStyle = {
  marginTop: 5, 
  height: '90%',
  width: '90%',
}
const Piece = ({ piece, selectPiece, id }) => {
  const [ selected, setSelected ] = useState(false)
  const [ dragging, setDragging ] = useState(false)

  const borderColor = selected ? 'red' : 'blue'
  const src = piece.color + piece.type + '.png'
  const handleSelect = (event) => {
    if (piece) {
      
      setTimeout(()=>{
        setDragging(true)
        setSelected(!selected)
        selectPiece()
      }, 0)
    }
  }
  const handleDragEnd = () => {
    setDragging(false)
    setSelected(false)
    selectPiece()

  }
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
 
  return (
    <div 
      style={{...pieceStyle, borderColor}}
      draggable
      onDragStart={(event) => handleSelect(event)}
      onDragEnd={handleDragEnd}
      >
      <img style={imgStyle} src={`${piece.color}${piece.type}.png`} alt='' />
    </div>
  )
}

export default Piece