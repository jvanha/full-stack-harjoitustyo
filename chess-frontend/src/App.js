import { useApolloClient, useQuery } from '@apollo/client';
import React, { useState } from 'react';
import Board from './components/Board'
import LoginForm from './components/LoginForm';
import RegistryForm from './components/RegistryForm'
import Users from './components/Users';
import { ALL_USERS } from './graphql/queries';
import { getAttackedSquares, isCheckMated, isInCheck } from './utilFunctions'
let squares = Array(64)//[...Array(64).keys()] 
let i
for (i=0; i<64; i++) {
  squares[i] = [i, null]
}
squares[56] = [56, { type: 'R', color: 'white'}]
squares[50] = [50, { type: 'P', color: 'white'}]
squares[31] = [31, { type: 'P', color: 'white'}]
squares[4] = [4, { type: 'K', color: 'black'}]
squares[14] = [14, { type: 'P', color: 'black'}]
squares[33] = [33, { type: 'P', color: 'black'}]
squares[0] = [0, { type: 'R', color: 'black'}]
squares[7] = [7, { type: 'R', color: 'black'}]
squares[45] = [45, { type: 'B', color: 'white'}]
squares[47] = [47, { type: 'Q', color: 'white'}]
squares[60] = [60, { type: 'K', color: 'white'}]
squares[3]  = [3, { type: 'N', color: 'black'}]
squares[63] = [63, { type: 'R', color: 'white'}]


const initBoard = []
function App() {
  const [ token, setToken ] = useState(null)
  const [ board, setBoard ] = useState(squares)
  const [ attackedSquares, setAttackedSquares ] = useState(null)
  const [ playerToMove, setPlayerToMove ] = useState('white')
  const [ longCastleWhite, setLongCastleWhite ] = useState(true)
  const [ shortCastleWhite, setShortCastleWhite ] = useState(true)
  const [ longCastleBlack, setLongCastleBlack ] = useState(true)
  const [ shortCastleBlack, setShortCastleBlack ] = useState(true)
  const [ enPassant, setEnpassant ] = useState(null)
  const client = useApolloClient()

  const result = useQuery(ALL_USERS)

  const movePiece = (from, to) => {
    const squareFrom = board[from]
    const color = squareFrom[1].color
    const type = squareFrom[1].type
    const newBoard = board.map(square => {
      if (square[0] === to) {
        if (type === 'P' && (square[0] < 8 || square[0] > 55))
          return [to, { type: 'Q', color }] 
        return [to, squareFrom[1]]
      }
      else if (square[0] === from) return [from, null]
      else if (to === enPassant && square[0] === Math.floor(from/8)*8 + to%8)
       return [square[0], null]
      return square
    })
    if (!isInCheck(color, newBoard))
      if (type === 'K') {
        if (color === 'white') {
          setLongCastleWhite(false)
          setShortCastleWhite(false)
          if (longCastleWhite && to === 58) {
            setBoard(newBoard.map(square => {
              if (square[0] === 59) return [59, { type: 'R', color: 'white'}]
              if (square[0] === 56) return [56, null]
              return square
            }))
            setPlayerToMove(playerToMove === 'white' ? 'black' : 'white')
            setEnpassant(null)
            return 
          }
          else if (shortCastleWhite && to === 62) {
            setBoard(newBoard.map(square => {
              if (square[0] === 61) return [61, { type: 'R', color: 'white'}]
              if (square[0] === 63) return [63, null]
              return square
            }))
            setPlayerToMove(playerToMove === 'white' ? 'black' : 'white')
            setEnpassant(null)
            return
          }
          
        } else {
          setLongCastleBlack(false)
          setShortCastleBlack(false)
          if (longCastleBlack && to === 2) {
            setBoard(newBoard.map(square => {
              if (square[0] === 3) return [3, { type: 'R', color: 'black'}]
              if (square[0] === 0) return [0, null]
              return square
            }))
            setPlayerToMove(playerToMove === 'white' ? 'black' : 'white')
            setEnpassant(null)
            return 
          }
          else if (shortCastleBlack && to === 6) {
            setBoard(newBoard.map(square => {
              if (square[0] === 5) return [5, { type: 'R', color: 'black'}]
              if (square[0] === 7) return [7, null]
              return square
            }))
            setPlayerToMove(playerToMove === 'white' ? 'black' : 'white')
            setEnpassant(null)
            return
          }
        }
      }
      else if (type === 'R') {
        if (color === 'white') { 
          if (squareFrom[0] === 56) setLongCastleWhite(false)
          if (squareFrom[0] === 63) setShortCastleWhite(false)
        } else {
          if (squareFrom[0] === 0) setLongCastleBlack(false)
          if (squareFrom[0] === 7) setShortCastleBlack(false)
        }
      }
      if (type === 'P') {
        console.log('App to', to)
        if ((color === 'white' && from - to === 16))
          setEnpassant(to + 8)
        if ((color === 'black' && to - from === 16))
          setEnpassant(to -8)
      } else {
        setEnpassant(null)
      }
      setBoard(newBoard)
      setPlayerToMove(playerToMove === 'white' ? 'black' : 'white')
  }
  
  const handleShow = (color) => {
    if (attackedSquares == null) {
      setAttackedSquares(getAttackedSquares(board, color))
    } else {
      setAttackedSquares(null)
    }
  }
  
  const logout = () => {
    console.log('logout')
    localStorage.clear()
    setToken(null)
    client.resetStore()
  }
  let users
  if (!result.loading && result.data && result.data.allUsers) {
    users = result.data.allUsers
  }
  return (
    <div>
      
      {token 
        ? <div style={{ margin: 10 }}><button onClick={logout}>Logout</button></div>
        : <div><RegistryForm /><LoginForm setToken={setToken}/></div>
      }
      {board && isCheckMated('black',board, enPassant) && <div>black checkmated</div>}
      <Board 
        board={board} 
        movePiece={movePiece}
        attackedSquares={attackedSquares}
        playerToMove={playerToMove}
        longCastleBlack={longCastleBlack}
        longCastleWhite={longCastleWhite}
        shortCastleBlack={shortCastleBlack}
        shortCastleWhite={shortCastleWhite}
        enPassant={enPassant}
      />
      {!attackedSquares && <button onClick={() => handleShow('black')}>show black's attack</button>}
      {!attackedSquares && <button onClick={() => handleShow('white')}>show white's attack</button>}
      {attackedSquares && <button onClick={() => handleShow('')}>hide attack</button>}
      <button onClick={() => isInCheck('black', board)}>is black in check</button>
      {users ? <Users users={result.data.allUsers}/> : null}
    </div>
  );
}
//<Users users={result.data.allUsers}/>
export default App;
