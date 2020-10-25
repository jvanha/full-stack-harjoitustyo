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
const Piece = ({ piece, selectPiece }) => {
  console.log(piece)
  const [ selected, setSelected ] = useState(false)
  const borderColor = selected ? 'red' : 'blue' 
  const handleSelect = () => {
    if (piece) {
      console.log('perkel')
      setSelected(!selected)
      selectPiece()
    }
  }
  return (
    <div style={{...testPieceStyle, borderColor, backgroundColor: piece.color}}
          onClick={() => handleSelect}>
      {piece.type}
    </div>
  )

}

export default Piece