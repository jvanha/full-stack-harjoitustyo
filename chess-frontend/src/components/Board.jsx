import { useMutation } from '@apollo/client'
import React, { useRef } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MAKE_A_MOVE } from '../graphql/mutations'
import { setMovingPiece } from '../reducers/boardReducer'
import { movePieceRedux } from '../reducers/gameReducer'
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


const Board = ({ clock, attackedSquares, gameSettings, ...props}) => {
  const dispatch = useDispatch()
  const game = useSelector(state => state.game)
  const user = useSelector(state => state.user.user)
  const movingPiece = useSelector(state => state.board.movingPiece)
  const { board, myColor, enPassant, playerToMove } = game
  const [ selectedSquare, setSelectedSquare ] = useState(null)
  const [ validMoves, setValidMoves ] = useState([])
  const [ promotionPortalOpen, setPromotionPortalOpen ] = useState(false)
  const [ tempSquare, setTempSquare ] = useState(null)
  const [ promotion, setPromotion ] = useState(null)
  const [ dragging, setDragging ] = useState(null)
  
  const dragObject = useRef()
  
  const [ makeAMove ] = useMutation(MAKE_A_MOVE)
  

  useEffect(() => {
    if (playerToMove === 'white') {
      setValidMoves(legalMoves(selectedSquare, board, game.longCastleWhite, game.shortCastleWhite, enPassant))
    }
    else {
      setValidMoves(legalMoves(selectedSquare, board, game.longCastleBlack, game.shortCastleBlack, enPassant))
    }
    
  },[selectedSquare, board])
  
  useEffect(() => {
    if(promotion && tempSquare && selectedSquare) {
      dispatch(setMovingPiece({ from: selectedSquare[0], to: tempSquare[0] }))
    }
  }, [promotion])

  useEffect(() => {
    if (game.playerToMove === game.myColor && tempSquare && movingPiece) {
      const from = selectedSquare[0]
      const to = tempSquare[0]
      const promoted = game.board[from][1].type === 'P' && (Math.floor(to/8) === 0 || Math.floor(to/8) === 7)

      makeAMove({ variables: {
        userId: user.id,
        from,
        to,
        time: clock,
        promotion: promoted ? (promotion?promotion:'Q') : null, 
      }})

      setTimeout(() => {
        dispatch(setMovingPiece(null))
        setPromotion(null)
        setTempSquare(null)
        setSelectedSquare(null)
        dispatch(movePieceRedux({
          from: selectedSquare[0],
          to: tempSquare[0],
          promotion: promotion?promotion:'Q'
        }))
      },0)
    }
    
  }, [movingPiece])
  
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
      setTempSquare(square)
      const from = selectedSquare[0]
      const to = square[0]
      dispatch(setMovingPiece({ from, to }))
    }
    else {
      setSelectedSquare(null)
    }
      
  }
  
  const handleDragStart = (event, position) => {
    console.log('drag start')
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
    //setSelectedSquare(null)
  }
  const handleDrop = (event, position) => {
    console.log('handle drop')
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