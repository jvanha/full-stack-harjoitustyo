import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { legalMoves } from '../utilFunctions'
import MySquare from './MySquare'
import PromotionPortal from './PromotionPortal'

const boardStyle = {
  paddingTop: 5,
  paddingBottom: 5,
  height: 504,
  width: 504,
  display: 'flex',
  flexWrap: 'wrap',
}
const boardStyleReversed = {
  paddingTop: 5,
  paddingBottom: 5,
  height: 504,
  width: 504,
  display: 'flex',
  flexDirection: 'row-reverse',
  flexWrap: 'wrap-reverse'
}


const ReplayBoard = ({ moves }) => {
  const [ board, setBoard ] = useState()
  const [ tempSquare, setTempSquare ] = useState(null)
  const [ promotion, setPromotion ] = useState(null)
  const [ movingPiece, setMovingPiece ] = useState(null)


  useEffect(() => {
    console.log('useEffect on movingPiece', movingPiece)
    if (tempSquare && movingPiece) {
      setTimeout(() => {
        setMovingPiece(null)
        setPromotion(null)
        setTempSquare(null)
      },0)
    }
    
  }, [movingPiece])
  
  useEffect(() => {
    console.log('props.moveMade',props.moveMade)
    if (props.moveMade) {
      const {from, to, promotion} = props.moveMade
      if (from && to && promotion) {
        setMovingPiece({from, to})
        setTimeout(() => {
          movePiece(from,to,promotion)
          setMovingPiece(null)
          setPromotion(null)
        },0)
      }
    }
    
  },[props.moveMade])
  
  return (
    <div style={myColor === "black" ? boardStyleReversed : boardStyle}>
      {board.map(element => (
        <MySquare
          key={element[0]}
          content={element}
          selectedSquare={selectedSquare}
          movingPiece={movingPiece}
          reversed={myColor === 'black'}
        />   
      ))}
    </div>
  )
}

export default ReplayBoard