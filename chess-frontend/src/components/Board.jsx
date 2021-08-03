import React, { useRef } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
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


const Board = ({ board, movePiece, attackedSquares, playerToMove, enPassant, myColor, gameSettings, makeAMove, ...props}) => {
  const [ selectedSquare, setSelectedSquare ] = useState(null)
  const [ validMoves, setValidMoves ] = useState([])
  const [ promotionPortalOpen, setPromotionPortalOpen ] = useState(false)
  const [ tempSquare, setTempSquare ] = useState(null)
  const [ promotion, setPromotion ] = useState(null)
  const [ movingPiece, setMovingPiece ] = useState(null)
  const [ dragging, setDragging ] = useState(null)
  
  const dragObject = useRef()
  
  useEffect(() => {
    if (playerToMove === 'white') {
      setValidMoves(legalMoves(selectedSquare, board, props.longCastleWhite, props.shortCastleWhite, enPassant))
    }
    else {
      setValidMoves(legalMoves(selectedSquare, board, props.longCastleBlack, props.shortCastleBlack, enPassant))
    }
    
  },[selectedSquare, board])
  
  useEffect(() => {
    if(promotion && tempSquare && selectedSquare) {
      setMovingPiece({ from: selectedSquare[0], to: tempSquare[0] })
    }
  }, [promotion])

  useEffect(() => {
    console.log('useEffect on movingPiece', movingPiece)
    if (tempSquare && movingPiece) {
      makeAMove(selectedSquare[0], tempSquare[0], promotion?promotion:'Q')
      setTimeout(() => {
        movePiece(selectedSquare[0], tempSquare[0], promotion?promotion:'Q')
        setMovingPiece(null)
        setPromotion(null)
        setTempSquare(null)
        setSelectedSquare(null)
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
  
  const handleSelection = (square) => {
    if (myColor !== playerToMove) return
    const index = square[0]

    if (board[index][1] && board[index][1].color=== playerToMove) {
      setSelectedSquare(square)
    } 
    else if (selectedSquare && selectedSquare[0] === index) setSelectedSquare(null)
    else if (selectedSquare && validMoves.includes(index)) {

      if (!gameSettings.autoQueen && selectedSquare[1].type === 'P' && (Math.floor(index/8) === 0 || Math.floor(index/8) === 7)) {
        setTempSquare(square)
        setPromotionPortalOpen(true)
        return
      }
      console.log('setting movingPiece')
      setTempSquare(square)
      setMovingPiece({ from: selectedSquare[0], to: index })
    }
    else {
      setSelectedSquare(null)
    }
      
  }
  
  const handleDragStart = (event, position) => {
    console.log(event)
    console.log(position)
    dragObject.current = event.target
    dragObject.current.addEventListener('dragend', handleDragEnd)
    setTimeout(() => {
      setDragging(position)
    },0)
    
    handleSelection(board[position])
  }
  const handleDragEnter = (event, position) => {

  }
  const handleDragEnd = () => {
    console.log('drag end')
    dragObject.current.removeEventListener('dragend', handleDragEnd)
    setDragging(null)
    setSelectedSquare(null)
  }
  const handleDrop = (event, position) => {
    handleSelection(board[position])
  } 
  
  
  return (
    <div style={myColor === "black" ? boardStyleReversed : boardStyle}>
      {board.map(element => (
        <MySquare
          key={element[0]}
          content={element}
          selectedSquare={selectedSquare}
          validMoves={validMoves}
          handleSelection={handleSelection}
          attackedSquares={attackedSquares}
          settings={gameSettings}
          movingPiece={movingPiece}
          reversed={myColor === 'black'}
          handleDragStart = {handleDragStart}
          dragging={dragging}
          handleDragEnter={handleDragEnter}
          handleDrop={handleDrop}
        />   
      ))}
      <PromotionPortal 
        open={promotionPortalOpen}
        handleClose={() => setPromotionPortalOpen(false)}
        color='white'
        setPromotion={setPromotion}
        settings={gameSettings}
        />
    </div>
  )
}

export default Board