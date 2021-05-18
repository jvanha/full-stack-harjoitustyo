import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { legitMoves } from '../utilFunctions'
import Piece from './Piece'
import PromotionPortal from './PromotionPortal'

const boardStyle = {
  height: 504,
  width: 504,
  display: 'flex',
  flexWrap: 'wrap',
}
const boardStyleReversed = {
  height: 504,
  width: 504,
  display: 'flex',
  flexDirection: 'row-reverse',
  flexWrap: 'wrap-reverse'
}

const squareStyle = {
  display: 'flex',
  justifyContent: 'center',
  height: '12.5%',
  width: '12.5%',
  transitionDuration: '100ms',
  transitionTimingFunction: 'ease-out'
}
const MySquare = ({ content, handleSelection, selectedSquare, validMoves, attackedSquares, settings, movingPiece, reversed }) => {
  const index = content[0]
  let color = ((index + Math.floor(index/8))%2)===0 ? '#f58a42' : '#52170d'

  if (content === selectedSquare) {
    //console.log('content === selectedSquare')
    //console.log('content', content)
    //console.log('selectedSquare', selectedSquare)
    color = 'green'
  }
  if (settings && settings.showLegalMoves && validMoves && validMoves.includes(content[0])) {
    color = 'red'
  }
  if (attackedSquares && attackedSquares.includes(content[0])) {
    color = 'purple'
  }
  if (movingPiece) {
    //console.log('movingPiece', movingPiece)
    //console.log('content[0]', content[0])
  }
  return (
    <div
      id={index}
      style={{ ...squareStyle, backgroundColor: color}} 
      onClick={() => handleSelection(content)}
    >
      {content[1] &&
        <Piece 
          piece={content[1]} 
          moving={(movingPiece && content[0] === movingPiece.from) ? movingPiece : null}
          reversedBoard={reversed}
        />}
      
    </div>
  )
}
//{content[1] && <Piece piece={content[1]} selectPiece={() => handleSelection(content)}/>}

const Board = ({ board, movePiece, attackedSquares, playerToMove, enPassant, myColor, gameSettings, ...props}) => {
  const [ selectedSquare, setSelectedSquare ] = useState(null)
  const [ validMoves, setValidMoves ] = useState([])
  const [ promotionPortalOpen, setPromotionPortalOpen ] = useState(false)
  const [ tempSquare, setTempSquare ] = useState(null)
  const [ promotion, setPromotion ] = useState(null)
  const [ movingPiece, setMovingPiece ] = useState(null)
  //console.log('promotion', promotion)
  //console.log('movingPiece', movingPiece)
  useEffect(() => {
    if (playerToMove === 'white') {
      setValidMoves(legitMoves(selectedSquare, board, props.longCastleWhite, props.shortCastleWhite, enPassant))
    }
    else {
      setValidMoves(legitMoves(selectedSquare, board, props.longCastleBlack, props.shortCastleBlack, enPassant))
    }
    
  },[selectedSquare, board])
  
  useEffect(() => {
    if(promotion && tempSquare && selectedSquare) {
      //console.log('setting movingPiece')
      setMovingPiece({ from: selectedSquare[0], to: tempSquare[0] })
    }
  }, [promotion])

  useEffect(() => {
    if (tempSquare && movingPiece) {
      setTimeout(() => {
        movePiece(selectedSquare[0], tempSquare[0], promotion?promotion:'Q')
        setMovingPiece(null)
        setPromotion(null)
      },350)
    }
    
  }, [movingPiece])

  const handleSelection = (square) => {
    //console.log('handleSelection selectedSquare', selectedSquare)
    //console.log('handleSelection square', square)
    if (myColor !== playerToMove) return
    const index = square[0]

    if (board[index][1] && board[index][1].color=== playerToMove) {
      //console.log('!selectedSquare && board[id][1] && board[id][1].color=== playerToMove')
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
      
      //setSelectedSquare(null)
    }
    else {
      setSelectedSquare(null)
    }
      
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