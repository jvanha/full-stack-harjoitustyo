import { useApolloClient, useLazyQuery, useMutation, useQuery, useSubscription } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import Board from './components/Board'
import LoginForm from './components/LoginForm';
import RegistryForm from './components/RegistryForm'
import Users from './components/Users';
import { LOGOUT, ACCEPT_CHALLENGE } from './graphql/mutations';
import { ALL_USERS, ME } from './graphql/queries';
import { CHALLENGE_ACCEPTED, CHALLENGE_ISSUED, USER_LOGGED_IN, USER_LOGGED_OUT} from './graphql/subscriptions';
import { getAttackedSquares, isCheckMated, isInCheck } from './utilFunctions'
let squares = Array(64)//[...Array(64).keys()]
let initBoard = Array(64)

let i
for (i=0; i<64; i++) {
  squares[i] = [i, null]
  initBoard[i] = [i, null]
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



for (i=0; i<64; i++) {
  squares[i] = [i, null]
}
initBoard[0] = [0, { type: 'R', color: 'black'}]
initBoard[1] = [1, { type: 'N', color: 'black'}]
initBoard[2] = [2, { type: 'B', color: 'black'}]
initBoard[3] = [3, { type: 'Q', color: 'black'}]
initBoard[4] = [4, { type: 'K', color: 'black'}]
initBoard[5] = [5, { type: 'B', color: 'black'}]
initBoard[6] = [6, { type: 'N', color: 'black'}]
initBoard[7] = [7, { type: 'R', color: 'black'}]
initBoard[8] = [8, { type: 'P', color: 'black'}]
initBoard[9] = [9, { type: 'P', color: 'black'}]
initBoard[10] = [10, { type: 'P', color: 'black'}]
initBoard[11] = [11, { type: 'P', color: 'black'}]
initBoard[12] = [12, { type: 'P', color: 'black'}]
initBoard[13] = [13, { type: 'P', color: 'black'}]
initBoard[14] = [14, { type: 'P', color: 'black'}]
initBoard[15] = [15, { type: 'P', color: 'black'}]

initBoard[48] = [48, { type: 'P', color: 'white'}]
initBoard[49] = [49, { type: 'P', color: 'white'}]
initBoard[50] = [50, { type: 'P', color: 'white'}]
initBoard[51] = [51, { type: 'P', color: 'white'}]
initBoard[52] = [52, { type: 'P', color: 'white'}]
initBoard[53] = [53, { type: 'P', color: 'white'}]
initBoard[54] = [54, { type: 'P', color: 'white'}]
initBoard[55] = [55, { type: 'P', color: 'white'}]
initBoard[56] = [56, { type: 'R', color: 'white'}]
initBoard[57] = [57, { type: 'N', color: 'white'}]
initBoard[58] = [58, { type: 'B', color: 'white'}]
initBoard[59] = [59, { type: 'Q', color: 'white'}]
initBoard[60] = [60, { type: 'K', color: 'white'}]
initBoard[61] = [61, { type: 'B', color: 'white'}]
initBoard[62] = [62, { type: 'N', color: 'white'}]
initBoard[63] = [63, { type: 'R', color: 'white'}]

function App() {
  const [ token, setToken ] = useState(null)
  const [ board, setBoard ] = useState(initBoard)
  const [ attackedSquares, setAttackedSquares ] = useState(null)
  const [ playerToMove, setPlayerToMove ] = useState('white')
  const [ longCastleWhite, setLongCastleWhite ] = useState(true)
  const [ shortCastleWhite, setShortCastleWhite ] = useState(true)
  const [ longCastleBlack, setLongCastleBlack ] = useState(true)
  const [ shortCastleBlack, setShortCastleBlack ] = useState(true)
  const [ enPassant, setEnpassant ] = useState(null)
  const [ users, setUsers ] = useState([])
  const [ user, setUser ] = useState(null)
  const client = useApolloClient()

  const [getUser, meResult] = useLazyQuery(ME, { fetchPolicy: 'network-only' }) 
  const result = useQuery(ALL_USERS)
  const [ logout, logoutResult ] = useMutation(LOGOUT)
  const [ acceptChallenge, acceptChallengeResult ] = useMutation(ACCEPT_CHALLENGE)
  console.log('user',user)

  useSubscription(USER_LOGGED_IN, {
    onSubscriptionData: ({ subscriptionData}) => {
      console.log('subscriptionData',subscriptionData)
      const user = subscriptionData.data.userLoggedIn
      if (!users.map(user => user.id).includes(user.id))
        setUsers(users.concat(user))
    }
  })

  useSubscription(USER_LOGGED_OUT, {
    onSubscriptionData: ({ subscriptionData}) => {
      console.log('subscriptionData',subscriptionData)
      setUsers(users.filter(user => user.id !== subscriptionData.data.userLoggedOut.id))
    }
  })
  console.log('meResult',meResult)

  useSubscription(CHALLENGE_ISSUED, {
    variables: { playerId: user ? user.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('CHALLENGE ISSUED',subscriptionData)
      //const {username, id, ...rest} = subscriptionData.data.challengeIssued.args
      if (window.confirm(`You have been challenged by\nAccept the challenge?`)) {
        //acceptChallenge({ variables: { username, id}})
        console.log('Moro')
      }
    }
  })
  useSubscription(CHALLENGE_ACCEPTED, {
    variables: { playerId: user ? user.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('CHALLENGE ISSUED',subscriptionData)
      alert("Your challenge has been accepted")
    }
  })

  useEffect(() => {
    localStorage.clear()
    setToken(null)
    client.resetStore()
  }, [])

  useEffect(() => {
    getUser()
  },[token])

  useEffect(() => {
    console.log('meResult changed', meResult.data)
    if (meResult.data && meResult.data.me) {
      console.log('meResult.data.me',meResult.data.me)
      const itsme = meResult.data.me
      console.log({ id: itsme.id, username: itsme.username })
      setUser({ id: itsme.id, username: itsme.username })
      console.log('user', user)
      
    }
  }, [meResult])
  
  useEffect(() => {
    if (!result.loading && result.data && result.data.allUsers) {
      setUsers(result.data.allUsers)
    }
  }, [result])

  useEffect(() => {
    console.log('logoutResult',logoutResult)
    if (logoutResult.called && !logoutResult.loading) {
      localStorage.clear()
      setToken(null)
      client.resetStore()
    }
    
  }, [logoutResult.data])

  useEffect(() => {
    if (acceptChallengeResult.called && !acceptChallengeResult.loading) {
      setBoard(initBoard)
      console.log('Game on!')
    }
  }, [acceptChallengeResult])

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
      {users ? <Users users={users}/> : null}
    </div>
  );
}

export default App;
