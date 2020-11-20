import React, { useState } from 'react'
const testPieceStyle = {
  display: 'flex',
  justifyContent: 'center',
  height: '90%',
  width: '90%',
  borderRadius: '50%',
  borderWidth: 3,
  borderColor: 'blue',
  borderStyle: 'solid'
}
const Piece = ({ piece, selectPiece, id }) => {
  const [ selected, setSelected ] = useState(false)
  const borderColor = selected ? 'red' : 'blue' 
  const handleSelect = (event) => {
    dataTran
    if (piece) {
      setSelected(!selected)
      selectPiece()
      console.log('DRAGGED')
      console.log(event.dataTransfer.getData('id'))
    }
  }
  return (
    <div 
      style={{...testPieceStyle, borderColor, backgroundColor: piece.color, color: piece.color==='black' ? 'white' : 'black'}}
      draggable='true'
      onDragStart={(event) => handleSelect(event)}
      onDragEnd={() => setSelected(false)}
      onClick={() => handleSelect}>
      {piece.type}
    </div>
  )

}

export default Piece