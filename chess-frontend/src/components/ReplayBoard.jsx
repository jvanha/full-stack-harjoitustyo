import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { nextPos } from '../reducers/replayReducer'
import MySquare from './MySquare'

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


const ReplayBoard = () => {
  const [ reversed, setReversed ] = useState(false)
  const [ tempSquare, setTempSquare ] = useState(null)
  const [ promotion, setPromotion ] = useState(null)
  const [ movingPiece, setMovingPiece ] = useState(null)
  const { board, moves, counter, ...rest } = useSelector(state => state.replay)
  console.log('board',board)
  const dispatch = useDispatch()
  
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

  const nextPosition = () => {
    console.log('next position')
    const {from, to, promotion} = moves[counter]
    if (from && to) {
      setMovingPiece({from, to})
      setTimeout(() => {
        dispatch(nextPos())
        setMovingPiece(null)
        setPromotion(null)
      },0)
    }
  }

  const previousPosition = () => {
    console.log('previous position')
  }

  
  return (
    <div>
      {board && <div style={reversed ? boardStyleReversed : boardStyle}>
        {board.map(element => (
          <MySquare
            key={element[0]}
            content={element}
            movingPiece={movingPiece}
            reversed={reversed}
          />   
        ))}
      </div>}
      <button onClick={nextPosition}>Next</button>
      <button onClick={previousPosition}>Previous</button>
    </div>

  )
}

export default ReplayBoard