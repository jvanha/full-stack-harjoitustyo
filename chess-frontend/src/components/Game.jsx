import { useMutation, useSubscription } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import Board from './Board'
import Clock from './Clock';
import Users from './Users';
import { ACCEPT_CHALLENGE, MAKE_A_MOVE, DECLINE_CHALLENGE, CREATE_GAME } from './../graphql/mutations';
import { CHALLENGE_ACCEPTED, CHALLENGE_CANCELLED, CHALLENGE_DECLINED, CHALLENGE_ISSUED, MOVE_MADE} from './../graphql/subscriptions';
import { getAttackedSquares, isCheckMated, isDrawByLackOfLegitMoves, isInCheck } from './../utilFunctions'
import { Menu} from 'semantic-ui-react';
import Chat from './Chat';
let squares = Array(64)//[...Array(64).keys()]
const emptyBoard = Array(64)
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

const Game = ({ user }) => {
  const [ activeMenuItem, setActiveMenuItem ] = useState("players")
  const [ board, setBoard ] = useState(initBoard)
  const [ attackedSquares, setAttackedSquares ] = useState(null)
  const [ playerToMove, setPlayerToMove ] = useState('white')
  const [ longCastleWhite, setLongCastleWhite ] = useState(true)
  const [ shortCastleWhite, setShortCastleWhite ] = useState(true)
  const [ longCastleBlack, setLongCastleBlack ] = useState(true)
  const [ shortCastleBlack, setShortCastleBlack ] = useState(true)
  const [ enPassant, setEnpassant ] = useState(null)
  const [ opponent, setOpponent ] = useState(null)
  const [ myColor, setMyColor ] = useState(null)
  const [ challengeWaiting, setChallengeWaiting ] = useState(null)
  const [ cancelledChallenge, setCancelledChallenge ] = useState(null)
  const [ clock, setClock ] = useState(10)
  const [ clockRunning, setClockRunning] = useState(false)
  const [ opponentsClock, setOpponentsClock ] = useState(300)
  const [ opponentsClockRunning, setOpponentsClockRunning] = useState(false) 
  
  const [ acceptChallenge, acceptChallengeResult ] = useMutation(ACCEPT_CHALLENGE)
  const [ declineChallenge, declineChallengeResult ] = useMutation(DECLINE_CHALLENGE)
  const [ makeAMove, makeAMoveResult ] = useMutation(MAKE_A_MOVE)
  const [ createGame, createGameResult ] = useMutation(CREATE_GAME)
  console.log('user',user)


  useSubscription(CHALLENGE_ISSUED, {
    variables: { playerId: user ? user.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('CHALLENGE ISSUED',subscriptionData)
      const challenger = subscriptionData.data.challengeIssued.challenger
      console.log('challenger',challenger)
      if (window.confirm(`You have been challenged by ${challenger.username}. Accept the challenge?`)) {
        console.log('challenger', challenger)
        acceptChallenge({ variables: { username: challenger.username, id: challenger.id }})
      } else {
        declineChallenge({ variables: { username: challenger.username, id: challenger.id }})
        console.log('YOU DECLINED THE CHALLENGE')
      }
    }
  })
  useSubscription(CHALLENGE_CANCELLED, {
    variables: { playerId: user ? user.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('CHALLENGE CANCELLED',subscriptionData)
      const challenger = subscriptionData.data.challengeCancelled.challenger
      setCancelledChallenge(challenger.id)
      alert(`${challenger.username} has cancelled their challenge`)
    }
  })
  useSubscription(CHALLENGE_ACCEPTED, {
    variables: { playerId: user ? user.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('challengeWaiting',challengeWaiting)
      console.log('subscriptionData', subscriptionData)
      if (challengeWaiting === subscriptionData.data.challengeAccepted.challenged.id) {
        setOpponentsClockRunning(true)
        setChallengeWaiting(null)
        alert("Your challenge has been accepted")
        setOpponent(subscriptionData.data.challengeAccepted.challenged)
        setBoard(initBoard)
        setMyColor('black')
      }
    }
  })
  useSubscription(CHALLENGE_DECLINED, {
    variables: { playerId: user ? user.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('CHALLENGE DECLINED',subscriptionData)
      alert("Your challenge has been declined")
      setChallengeWaiting(null)
    }
  })
  useSubscription(MOVE_MADE, {
    variables: { opponentId: opponent ? opponent.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('MOVE MADE', subscriptionData)
      const move = subscriptionData.data.moveMade.move
      movePiece(move.from, move.to)
      setOpponentsClockRunning(false)
      setOpponentsClock(move.time)
      setClockRunning(true)
    } 
  })
  
  useEffect(() => {
    if (acceptChallengeResult.called && !acceptChallengeResult.loading) {
      //POTENTTIAALISESTI VÄÄRIN
      console.log('acceptChallengeResult',acceptChallengeResult)
      setOpponent(acceptChallengeResult.data.acceptChallenge)
      setBoard(initBoard)
      setMyColor('white')
      setClockRunning(true)
      console.log('Game on!')
    }
  }, [acceptChallengeResult.data])

  useEffect(() => {
    if (clockRunning) {
      const interval = setInterval(() => {
        setClock(clock => clock - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [clockRunning])

  useEffect(() => {
    if (opponentsClockRunning) {
      const interval = setInterval(() => {
        setOpponentsClock(opponentsClock => opponentsClock - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [opponentsClockRunning])

  useEffect(() => {
    if (clock < 0) {
      console.log('Time is out')
      setClockRunning(false)
      setClock(0)
    }
  }, [clock])

  useEffect(() => {
    if (myColor) {
      if (isDrawByLackOfLegitMoves(playerToMove, board, enPassant)) {
        alert('Draw')
      } else if (isCheckMated(playerToMove, board, enPassant)) {
        if (playerToMove === myColor) alert('You lost')
        else {
          const whiteId = myColor === 'white' ? user.id : opponent.id
          const blackId = myColor === 'black' ? user.id : opponent.id
          const winner = myColor
          //only the winner creates a new game
          createGame({ variables: { whiteId, blackId, winner } })
          alert('You won')
        }
      }
    }
  }, [board])

  const movePiece = (from, to) => {
    console.log('playerToMove != myColor', playerToMove !== myColor)
    console.log('opponent', opponent)
    if (opponent && playerToMove === myColor) {
      setClockRunning(false)
      setOpponentsClockRunning(true)
      console.log('Trying to make a move')
      console.log({ variables: { userId: user.id, from, to}})
      makeAMove({ variables: { userId: user.id, from, to, time: clock}})
    }
    console.log('movePiece board', board)
    console.log('movePiece from', from)
    console.log('movePiece to', to)
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
        else if ((color === 'black' && to - from === 16))
          setEnpassant(to -8)
         else 
          setEnpassant(null)
      } else {
        setEnpassant(null)
      }
      setPlayerToMove(playerToMove === 'white' ? 'black' : 'white')
      setBoard(newBoard)
    if (myColor==='white') {
      if (isCheckMated('black', board, enPassant)) {
        createGame({
          variables: {
            whiteId: user.id,
            blackId: opponent.id,
            winner: 'white'
          }})
      }
    }
  }
  
  const handleShow = (color) => {
    if (attackedSquares == null) {
      setAttackedSquares(getAttackedSquares(board, color))
    } else {
      setAttackedSquares(null)
    }
  }

  
  return (
    <div style={{ padding: 30, display: 'flex', flexDirection: 'horizontal'}}>
      <div style={{ padding: 30}}>
        <button onClick={() => setClockRunning(!clockRunning)}>start clock</button>
        {opponent && <div> opponent {opponent.username} {opponent.id}</div>}
        {board && isCheckMated('black',board, enPassant) && <div>White won</div>}
        {board && isCheckMated('white',board, enPassant) && <div>Black won</div>}
        <Clock time={opponentsClock}/>
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
          myColor={myColor}
        />
        <Clock time={clock}/>
        {!attackedSquares && <button onClick={() => handleShow('black')}>show black's attack</button>}
        {!attackedSquares && <button onClick={() => handleShow('white')}>show white's attack</button>}
        {attackedSquares && <button onClick={() => handleShow('')}>hide attack</button>}
        <button onClick={() => isInCheck('black', board)}>is black in check</button>
      </div>
      <div style={{ backgroundColor: 'white'}}>
        <Menu attached='top' inverted>
          <Menu.Item
            name='players'
            active={activeMenuItem === 'players'}
            onClick={() => setActiveMenuItem('players')}
          />
          <Menu.Item
            name='chat'
            active={activeMenuItem === 'chat'}
            onClick={() => setActiveMenuItem('chat')}
          />
          <Menu.Item
            name='moves'
            active={activeMenuItem === 'moves'}
            onClick={() => setActiveMenuItem('moves')}
          />
        </Menu>
        {activeMenuItem === 'players'
          && <Users 
          challengeWaiting={challengeWaiting}
          setChallengeWaiting={setChallengeWaiting}
          me={user}
          /> 
        }
        {activeMenuItem === 'chat' && user
          && <Chat/>
        }
      </div>
    </div>
  );
}
export default Game;



