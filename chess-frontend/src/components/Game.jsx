import { useMutation, useSubscription } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import Board from './Board'
import Clock from './Clock';
import Users from './Users';
import { ACCEPT_CHALLENGE, MAKE_A_MOVE, DECLINE_CHALLENGE, CREATE_GAME, RESIGN, GET_COMPUTER_MOVE } from './../graphql/mutations';
import { CHALLENGE_ACCEPTED, CHALLENGE_CANCELLED, CHALLENGE_DECLINED, CHALLENGE_ISSUED, MOVE_MADE, OPPONENT_RESIGNED } from './../graphql/subscriptions';
import { getAttackedSquares, isCheckMated, isDrawByInsufficientMaterial, isDrawByLackOflegalMoves, isInCheck } from './../utilFunctions'
import { Button, Label, Menu} from 'semantic-ui-react';
import Chat from './Chat';
import { deleteGameState, loadGameSettings, loadGameState, saveGameState } from '../localStorageService';
import SettingsModal from './SettingsModal';
import { toFen } from '../fen';
import { ME } from '../graphql/queries';
import { useDispatch, useSelector } from 'react-redux';
import { setGameState, updateGame, movePieceRedux, initGame } from '../reducers/gameReducer';

let squares = Array(64)//[...Array(64).keys()]
let emptyBoard = Array(64)
let initBoard = Array(64)
let testBoard = Array(64)

let i
for (i=0; i<64; i++) {
  squares[i] = [i, null]
  initBoard[i] = [i, null]
  testBoard[i] = [i, null]
  emptyBoard[i] = [i, null]
}
squares[56] = [56, { type: 'R', color: 'white' }]
squares[50] = [50, { type: 'P', color: 'white' }]
squares[31] = [31, { type: 'P', color: 'white' }]
squares[4] = [4, { type: 'K', color: 'black' }]
squares[14] = [14, { type: 'P', color: 'black' }]
squares[33] = [33, { type: 'P', color: 'black' }]
squares[0] = [0, { type: 'R', color: 'black' }]
squares[7] = [7, { type: 'R', color: 'black' }]
squares[45] = [45, { type: 'B', color: 'white' }]
squares[47] = [47, { type: 'Q', color: 'white' }]
squares[60] = [60, { type: 'K', color: 'white' }]
squares[3]  = [3, { type: 'N', color: 'black' }]
squares[63] = [63, { type: 'R', color: 'white' }]

initBoard[0] = [0, { type: 'R', color: 'black' }]
initBoard[1] = [1, { type: 'N', color: 'black' }]
initBoard[2] = [2, { type: 'B', color: 'black' }]
initBoard[3] = [3, { type: 'Q', color: 'black' }]
initBoard[4] = [4, { type: 'K', color: 'black' }]
initBoard[5] = [5, { type: 'B', color: 'black' }]
initBoard[6] = [6, { type: 'N', color: 'black' }]
initBoard[7] = [7, { type: 'R', color: 'black' }]
initBoard[8] = [8, { type: 'P', color: 'black' }]
initBoard[9] = [9, { type: 'P', color: 'black' }]
initBoard[10] = [10, { type: 'P', color: 'black' }]
initBoard[11] = [11, { type: 'P', color: 'black' }]
initBoard[12] = [12, { type: 'P', color: 'black' }]
initBoard[13] = [13, { type: 'P', color: 'black' }]
initBoard[14] = [14, { type: 'P', color: 'black' }]
initBoard[15] = [15, { type: 'P', color: 'black' }]

initBoard[48] = [48, { type: 'P', color: 'white' }]
initBoard[49] = [49, { type: 'P', color: 'white' }]
initBoard[50] = [50, { type: 'P', color: 'white' }]
initBoard[51] = [51, { type: 'P', color: 'white' }]
initBoard[52] = [52, { type: 'P', color: 'white' }]
initBoard[53] = [53, { type: 'P', color: 'white' }]
initBoard[54] = [54, { type: 'P', color: 'white' }]
initBoard[55] = [55, { type: 'P', color: 'white' }]
initBoard[56] = [56, { type: 'R', color: 'white' }]
initBoard[57] = [57, { type: 'N', color: 'white' }]
initBoard[58] = [58, { type: 'B', color: 'white' }]
initBoard[59] = [59, { type: 'Q', color: 'white' }]
initBoard[60] = [60, { type: 'K', color: 'white' }]
initBoard[61] = [61, { type: 'B', color: 'white' }]
initBoard[62] = [62, { type: 'N', color: 'white' }]
initBoard[63] = [63, { type: 'R', color: 'white' }]

testBoard[0] = [0, { type: 'K', color: 'black' }]
testBoard[63] = [63, { type: 'K', color: 'white' }]
testBoard[11] = [11, { type: 'P', color: 'white' }]
testBoard[14] = [14, { type: 'Q', color: 'white' }]

const Game = ({ user }) => {
  const dispatch = useDispatch()
  const pendingChallenge = useSelector(state => state.challenge) //JUST FOR TESTING
  const game = useSelector(state => state.game)
  
  /*
  const [ game, setGame ] = useState({
    board: emptyBoard,
    playerToMove: null,
    shortCastleWhite: true,
    shortCastleBlack: true,
    longCastleWhite: true,
    longCastleBlack: true,
    enPassant: null,
    clock: 0,
    opponentsClock: 0,
  })*/
  const [ activeMenuItem, setActiveMenuItem ] = useState("players")
  
  const [ board, setBoard ] = useState(emptyBoard)
  const [ playerToMove, setPlayerToMove ] = useState(null)
  const [ longCastleWhite, setLongCastleWhite ] = useState(true)
  const [ shortCastleWhite, setShortCastleWhite ] = useState(true)
  const [ longCastleBlack, setLongCastleBlack ] = useState(true)
  const [ shortCastleBlack, setShortCastleBlack ] = useState(true)
  const [ enPassant, setEnpassant ] = useState(null)
  const [ opponent, setOpponent ] = useState(null)
  const [ myColor, setMyColor ] = useState(null)
  const [ clock, setClock ] = useState(10)
  const [ clockRunning, setClockRunning] = useState(false)
  const [ opponentsClock, setOpponentsClock ] = useState(10)
  const [ opponentsClockRunning, setOpponentsClockRunning] = useState(false)
  const [ moves, setMoves] = useState([])
  
  const [ challengeWaiting, setChallengeWaiting ] = useState(null)

  const [ attackedSquares, setAttackedSquares ] = useState(null)

  const [ settingsModalOpen, setSettingsModalOpen ] = useState(false)
  const [ gameSettings, setGameSettings ] = useState({ autoQueen: false, showLegalMoves: false}) 
  const [ moveMade, setMoveMade ] = useState(null)

  const [ acceptChallenge, acceptChallengeResult ] = useMutation(ACCEPT_CHALLENGE)
  const [ declineChallenge, declineChallengeResult ] = useMutation(DECLINE_CHALLENGE)
  const [ makeAMove, makeAMoveResult ] = useMutation(MAKE_A_MOVE)
  const [ createGame, createGameResult ] = useMutation(CREATE_GAME, {
    refetchQueries: [  {query: ME} ],
  })
  const [ resign ] = useMutation(RESIGN)
  const [ getComputerMove, getComputerMoveResult ] = useMutation(GET_COMPUTER_MOVE)
  
  useSubscription(CHALLENGE_ISSUED, {
    variables: { playerId: user ? user.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('CHALLENGE ISSUED',subscriptionData)
      const challenger = subscriptionData.data.challengeIssued.opponents.challenger
      const timeControl = subscriptionData.data.challengeIssued.timeControl
      const color = subscriptionData.data.challengeIssued.color
      const message = timeControl%60 
        ? `You have been challenged for ${timeControl} second game by ${challenger.username} as ${color==='white' ? 'black' : 'white'}. Accept the challenge?`
        : `You have been challenged for ${timeControl/60} minute game by ${challenger.username} as ${color==='white' ? 'black' : 'white'}. Accept the challenge?`
      console.log('challenger',challenger)
      if (window.confirm(message)) {
        console.log('challenger', challenger)
        acceptChallenge({ variables: { username: challenger.username, id: challenger.id, timeControl, color }})
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
      alert(`${challenger.username} has cancelled their challenge`)
    }
  })
  useSubscription(CHALLENGE_ACCEPTED, {
    variables: { playerId: user ? user.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('pendingChallenge',pendingChallenge)
      console.log('subscriptionData', subscriptionData)
      const challenge = subscriptionData.data.challengeAccepted
      if (pendingChallenge === challenge.opponents.challenged.id) { //challengeWaiting is UNDEFINED from now on
        const myTurn = challenge.color === 'white'
        setClock(challenge.timeControl)
        setOpponentsClock(challenge.timeControl)
        setOpponentsClockRunning(!myTurn)
        setClockRunning(myTurn)

        setOpponent(challenge.opponents.challenged)
        setMyColor(challenge.color)
        setPlayerToMove('white')
        setBoard(initBoard) //set board last
      }
    }
  })

  useSubscription(CHALLENGE_DECLINED, {
    variables: { playerId: user ? user.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('CHALLENGE DECLINED',subscriptionData)
      alert("Your challenge has been declined")
    }
  })

  useSubscription(MOVE_MADE, {
    variables: { opponentId: opponent ? opponent.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('MOVE MADE', subscriptionData)
      const {from, to, time, promotion } = subscriptionData.data.moveMade.move
      if (time === 0) {
        const whiteId = myColor === 'white' ? user.id : opponent.id
        const blackId = myColor === 'black' ? user.id : opponent.id
        const winner = myColor
        //only the winner creates a new game
        createGame({ variables: { input: { whiteId, blackId, winner, moves} }})
        alert('You won by timeout')
        setClockRunning(false)
        setPlayerToMove(null)
        deleteGameState()

      } else {
        setMoves(moves.concat({from, to, time, promotion, takenPiece: board[to][1]}))
        setMoveMade({from, to, time, promotion})
        setClockRunning(true)
      }
      setOpponentsClockRunning(false)
      setOpponentsClock(time)
    } 
  })

  useSubscription(OPPONENT_RESIGNED, {
    variables: { opponentId: opponent ? opponent.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('OPPONENT RESIGNED',subscriptionData)
      const whiteId = myColor === 'white' ? user.id : opponent.id
      const blackId = myColor === 'black' ? user.id : opponent.id
      const winner = myColor
      //only the winner creates a new game
      console.log('moves',moves)
      createGame({ variables: { input: { whiteId, blackId, winner, moves} }})
      alert("You won by resignation")
      setClockRunning(false)
      setOpponentsClockRunning(false)
      setPlayerToMove(null)
      deleteGameState()
    }
  })

  useEffect(() => {
    
    const gameState = loadGameState()
    
    console.log('Load gameState', gameState)
    if (gameState) {
      dispatch(setGameState(gameState))
      console.log('gameState.board', gameState.board)
      setBoard(gameState.board)
      setMyColor(gameState.myColor)
      gameState.clockRunning ? setClock(gameState.clock-Math.floor((Date.now()-gameState.timeStamp) / 1000)) : setClock(gameState.clock)
      gameState.opponentsClockRunning ? setOpponentsClock(gameState.opponentsClock-Math.floor((Date.now()-gameState.timeStamp) / 1000)) : setOpponentsClock(gameState.opponentsClock)
      setPlayerToMove(gameState.playerToMove)
      setOpponent(gameState.opponent)
      setLongCastleBlack(gameState.longCastleBlack)
      setLongCastleWhite(gameState.longCastleWhite)
      setShortCastleBlack(gameState.shortCastleBlack)
      setShortCastleWhite(gameState.shortCastleWhite)
      setEnpassant(gameState.enPassant)
      setClockRunning(gameState.clockRunning)
      setOpponentsClockRunning(gameState.opponentsClockRunning)
    }
    
    const settings = loadGameSettings()
    console.log('loadGameSettings settings', settings)
    if (settings) {
      setGameSettings(settings)
    }
    console.log('gameSettings', gameSettings)
  },[])
  
  useEffect(() => {
    if (acceptChallengeResult.called && !acceptChallengeResult.loading) {
      //POTENTTIAALISESTI VÄÄRIN
      console.log('acceptChallengeResult',acceptChallengeResult)
      const challenge = acceptChallengeResult.data.acceptChallenge
      const myTurn = challenge.color === 'black'
      setOpponent(challenge.opponents.challenger)
      //setBoard(testBoard)
      setMyColor(challenge.color==='white' ? 'black' : 'white')
      setClock(challenge.timeControl)
      setOpponentsClock(challenge.timeControl)
      setClockRunning(myTurn)
      setOpponentsClockRunning(!myTurn)
      setPlayerToMove('white')
      setBoard(initBoard)
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
      alert('you lost by timeout')
      setClock(0)
      makeAMove({ variables: { userId: user.id, from: 0, to: 0, time: 0}})
      setClockRunning(false)
      setPlayerToMove(null)
      deleteGameState()
      const gameState = loadGameState()
      console.log('deleted gamestate', gameState)
    }
  }, [clock])

  useEffect(() => {
    if (myColor && playerToMove) {
      console.log(playerToMove, board, enPassant, '++++++++++++++++++++')
      if (isDrawByLackOflegalMoves(playerToMove, board, enPassant)) {
        alert('Draw')
        setPlayerToMove(null)
        setMyColor(null)
        setClockRunning(false)
        deleteGameState()
      } else if (isDrawByInsufficientMaterial(board)) {
        alert('Draw! Insufficient material')
        setPlayerToMove(null)
        setMyColor(null)
        setClockRunning(false)
        deleteGameState()
      } else if (isCheckMated(playerToMove, board, enPassant)) {
        if (playerToMove === myColor) {
          alert('You lost')
          setPlayerToMove(null)
          setClockRunning(false)
          deleteGameState()
        }
        else {
          const whiteId = myColor === 'white' ? user.id : opponent.id
          const blackId = myColor === 'black' ? user.id : opponent.id
          const winner = myColor
          //only the winner creates a new game
          console.log('YOU WON, opponent.id:',opponent.id)
          if (opponent.id !== 'computer') {
            console.log('moves',moves)
            createGame({ variables: { input: { whiteId, blackId, winner, moves} }})
          }
          alert('You won')
          setPlayerToMove(null)
          setOpponentsClockRunning(false)
          deleteGameState()
          return;
        }
      } else {
        const gameState = {
          myColor,
          playerToMove,
          clock,
          opponentsClock,
          opponent,
          longCastleBlack,
          longCastleWhite,
          shortCastleBlack,
          shortCastleWhite,
          enPassant,
          board,
          clockRunning,
          opponentsClockRunning,
          timeStamp: Date.now(),
          moves,
        }
        console.log('SAVING gameState', gameState)
        saveGameState(gameState)
      }
    }

    console.log(opponent, playerToMove)
    if (opponent && opponent.id === 'computer' && playerToMove === 'white') {
      const fen = toFen(board, playerToMove, longCastleWhite, shortCastleWhite, longCastleBlack, shortCastleBlack, enPassant)
      console.log('fen',fen)
      if (fen) {
        const variables = { fen }
        console.log('variables',variables)
        getComputerMove({ variables })
      }
    }
 
  }, [board])

  useEffect(() => {
    console.log('getComputerMoveResult',getComputerMoveResult)
    if (getComputerMoveResult.called && !getComputerMoveResult.loading) {
      const move = getComputerMoveResult.data.getComputerMove
      console.log('move', move)
      if (opponent && opponent.id === 'computer' && playerToMove === 'white') {
        setMoveMade({ ...move, promotion: 'Q'})                                     //VIIIIIIIIRRRRRRRHE
        setOpponentsClockRunning(false)
        setClockRunning(true)
      }
    }
  }, [getComputerMoveResult.data])
 
  
  
  // THIS WILL BE REDUNDANT
  const handleMoveMaking = (from, to, promotion) => {
    if (opponent && opponent.id === 'computer') {
      return
    }
    const promoted = board[from][1].type === 'P' && (Math.floor(to/8) === 0 || Math.floor(to/8) === 7)

    makeAMove({ variables: {
      userId: user.id,
      from, to,
      time: clock,
      promotion: promoted ? promotion : null, 
    }})

    setMoves(moves.concat({
      from,
      to,
      time: clock,
      promotion: promoted ? promotion : null, 
      takenPiece: board[to][1]
    }))
  }
  

  const movePiece = (from, to, promotion) => {
    if (opponent && playerToMove === myColor) {
      setClockRunning(false)
      setOpponentsClockRunning(true)
      console.log({ variables: { userId: user.id, from, to}})
    }
    console.log(from)
    console.log(to)
    console.log(board)

    const squareFrom = board[from]
    const color = squareFrom[1].color
    const type = squareFrom[1].type
    
    const newBoard = board.map(square => {
      if (square[0] === to) {
        if (type === 'P' && (square[0] < 8 || square[0] > 55))
          return [to, { type: promotion, color }] 
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
          setPlayerToMove(playerToMove === 'white' ? 'black' : 'white')
          setEnpassant(null)
          // Castling rook move
          if (longCastleWhite && to === 58) {
            setBoard(newBoard.map(square => {
              if (square[0] === 59) return [59, { type: 'R', color: 'white'}]
              if (square[0] === 56) return [56, null]
              return square
            }))
            
            return 
          }
          else if (shortCastleWhite && to === 62) {
            setPlayerToMove(playerToMove === 'white' ? 'black' : 'white') //toistoa
            setEnpassant(null)
            setBoard(newBoard.map(square => {
              if (square[0] === 61) return [61, { type: 'R', color: 'white'}]
              if (square[0] === 63) return [63, null]
              return square
            }))
            
            return
          }
          
        } else {
          
          setLongCastleBlack(false) 
          setShortCastleBlack(false)
          setPlayerToMove(playerToMove === 'white' ? 'black' : 'white')
          setEnpassant(null)
          if (longCastleBlack && to === 2) {
            setBoard(newBoard.map(square => {
              if (square[0] === 3) return [3, { type: 'R', color: 'black'}]
              if (square[0] === 0) return [0, null]
              return square
            }))
            
            return 
          }
          else if (shortCastleBlack && to === 6) {
            setPlayerToMove(playerToMove === 'white' ? 'black' : 'white') //toistoa
            setEnpassant(null)
            setBoard(newBoard.map(square => {
              if (square[0] === 5) return [5, { type: 'R', color: 'black'}]
              if (square[0] === 7) return [7, null]
              return square
            }))
            
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
          setEnpassant(to - 8)
         else 
          setEnpassant(null)
      } else {
        setEnpassant(null)
      }
      setPlayerToMove(playerToMove === 'white' ? 'black' : 'white')
      setBoard(newBoard)
  }
  
  const handleShow = (color) => {
    if (attackedSquares == null) {
      setAttackedSquares(getAttackedSquares(board, color))
    } else {
      setAttackedSquares(null)
    }
  }
  const handleResignation = () => {
    if (opponent && !opponent.id === 'computer') {
      resign({ variables: { userId: user.id}})
    }
    alert('You resigned')
    setPlayerToMove(null)
    setClockRunning(false)
    setOpponentsClockRunning(false)
    dispatch(updateGame({                     //update gamestate
      playerToMove: null,
      clockRunning: false,
      opponentsClockRunning: false,
    }))
    deleteGameState()
  }
  const playComputer = () => {
    dispatch(initGame({                                               //REDUX
      opponent: { username: 'Computer', id: 'computer'},
      clock: 300,
      opponentsClock: 300,
      opponentsClockRunning: true,
      myColor: 'black',
    }))
    setOpponent({ username: 'Computer', id: 'computer'})
    setLongCastleBlack(true)
    setShortCastleBlack(true)
    setLongCastleWhite(true)
    setShortCastleWhite(true)
    setClock(300)
    setOpponentsClock(300)
    setOpponentsClockRunning(true)
    setChallengeWaiting(null)
          //setBoard(testBoard)
    setMyColor('black')
    setPlayerToMove('white')
    setBoard(initBoard)
  }

  //        {toFen(board, longCastleWhite, shortCastleWhite, longCastleBlack, shortCastleBlack, enPassant)}

  return (
    <div style={{ padding: 30, display: 'flex', flexDirection: 'row'}}>
      <div style={{ padding: 30}}>
      {toFen(board, longCastleWhite, shortCastleWhite, longCastleBlack, shortCastleBlack, enPassant)}
      {(user && (!opponent || opponent.id === 'computer')) &&
        <Button onClick={playComputer}>Play against computer</Button>
      }
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          { opponent &&
            <Label image>
              <img src='https://react.semantic-ui.com/images/avatar/small/joe.jpg' />
              {opponent.username}
            </Label>
          }
          <Clock time={opponentsClock}/>
        </div>
        <Board 
          board={board} 
          movePiece={movePiece}
          attackedSquares={attackedSquares}
          gameSettings={gameSettings}
          moveMade={moveMade}
          makeAMove={handleMoveMaking}
        />
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          { user &&
            <Label image>
            <img src='https://react.semantic-ui.com/images/avatar/small/joe.jpg' />
            {user.username}
          </Label>
          }
          <Clock time={clock}/>

        </div>
        {!attackedSquares && <button onClick={() => handleShow('black')}>show black's attack</button>}
        {!attackedSquares && <button onClick={() => handleShow('white')}>show white's attack</button>}
        {attackedSquares && <button onClick={() => handleShow('')}>hide attack</button>}
        <button onClick={() => isInCheck('black', board)}>is black in check</button>
        </div>
      <Button circular inverted icon='setting' onClick={()=>setSettingsModalOpen(true)}/>
      <div style={{ backgroundColor: 'white'}}>
        <Menu attached='top' inverted>
          { opponent &&
            <Menu.Item
              name='Game'
              active={activeMenuItem === 'game'}
              onClick={() => setActiveMenuItem('game')}
            />
          }
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
        </Menu>
        {activeMenuItem === 'players'
          && <Users 
          me={user}
          /> 
        }
        {activeMenuItem === 'chat' && user
          && <Chat/>
        }
        {activeMenuItem === 'game' && user
          && <Button onClick={handleResignation}>Resign</Button>
        } 
      </div>
      <SettingsModal
        modalOpen={settingsModalOpen}
        close={() => setSettingsModalOpen(false)}
        settings={gameSettings}
        setSettings={setGameSettings}
      />
    </div>
  );
}
export default Game;



