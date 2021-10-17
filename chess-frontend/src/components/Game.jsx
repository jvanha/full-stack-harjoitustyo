import { useMutation } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import Board from './Board'
import Clock from './Clock';
import Users from './Users';
import { MAKE_A_MOVE, RESIGN, GET_COMPUTER_MOVE, CREATE_GAME } from './../graphql/mutations';
import { getAttackedSquares, isCheckMated, isDrawByInsufficientMaterial, isDrawByLackOflegalMoves, isInCheck } from './../utilFunctions'
import { Button, Label, Menu} from 'semantic-ui-react';
import Chat from './Chat';
import { deleteGameState, loadGameSettings, loadGameState, saveGameState } from '../localStorageService';
import SettingsModal from './SettingsModal';
import { toFen } from '../fen';
import { useDispatch, useSelector } from 'react-redux';
import { updateGame, initGame, endGame, movePieceRedux } from '../reducers/gameReducer';
import { setMovingPiece } from '../reducers/boardReducer';
import ChallengeModal from './ChallengeModal';
import { ME } from '../graphql/queries';


const Game = ({ clock, opponentsClock, setClock, setOpponentsClock }) => {
  const dispatch = useDispatch()
  const game = useSelector(state => state.game)
  const pendingChallenge = useSelector(state => state.challenge)
  const user = useSelector(state => state.user.user)
  const [ activeMenuItem, setActiveMenuItem ] = useState("players")
  const [ attackedSquares, setAttackedSquares ] = useState(null)
  const [ settingsModalOpen, setSettingsModalOpen ] = useState(false)
  const [ gameSettings, setGameSettings ] = useState({ autoQueen: false, showLegalMoves: false}) 

  const [ challengeComputerModalOpen, setChallengeComputerModalOpen ] = useState(false)

  const [ makeAMove ] = useMutation(MAKE_A_MOVE)
  const [ resign ] = useMutation(RESIGN)
  const [ getComputerMove, getComputerMoveResult ] = useMutation(GET_COMPUTER_MOVE)
  const [ createGame ] = useMutation(CREATE_GAME, {
    refetchQueries: [  {query: ME} ],
  })

  useEffect(() => {
    const gameState = loadGameState()
    console.log('Load gameState', gameState)
    if (gameState) {
      dispatch(updateGame({
        ...gameState,
      }))
      setClock(gameState.clockRunning ? gameState.clock-Math.floor((Date.now()-gameState.timeStamp) / 1000) : gameState.clock)
      setOpponentsClock(gameState.opponentsClockRunning ? gameState.opponentsClock-Math.floor((Date.now()-gameState.timeStamp) / 1000) : gameState.opponentsClock)
    }
    const settings = loadGameSettings()
    console.log('loadGameSettings settings', settings)
    if (settings) {
      setGameSettings(settings)
    }
  },[])

  useEffect(() => {
    if (game.gameOn && clock <= 0) {
      if (game.opponent && game.opponent.id != 'computer') makeAMove({ variables: { userId: user.id, from: 0, to: 0, time: 0 } })
      alert('you lost by timeout')
      setClock(0)
      dispatch(endGame())
      deleteGameState()
    }
  }, [clock])

  useEffect(() => {
    if (game.gameOn) {
      // only white creates drawn games
      if (isDrawByLackOflegalMoves(game.playerToMove, game.board, game.enPassant)) {
        if (game.myColor === 'white' && game.opponent && game.opponent.id != 'computer') 
          createGame({ variables: { input: { whiteId: user.id, blackId: game.opponent.id, winner: '', moves: game.moves } }})
        alert('Draw')
        dispatch(endGame())
        deleteGameState()
      } else if (isDrawByInsufficientMaterial(game.board)) {
        if (game.myColor === 'white' && game.opponent && game.opponent.id != 'computer') 
          createGame({ variables: { input: { whiteId: user.id, blackId: game.opponent.id, winner: '', moves: game.moves } }})
        alert('Draw! Insufficient material')
        dispatch(endGame())
        deleteGameState()
      } else if (isCheckMated(game.playerToMove, game.board, game.enPassant)) {
        if (game.playerToMove === game.myColor) {
          alert('You lost')
          dispatch(endGame())
          deleteGameState()
        }
        else {
          const whiteId = game.myColor === 'white' ? user.id : game.opponent.id
          const blackId = game.myColor === 'black' ? user.id : game.opponent.id
          const winner = game.myColor
          //only the winner creates a new game
          if (game.opponent.id !== 'computer') {
            createGame({ variables: { input: { whiteId, blackId, winner, moves: game.moves } }})
          }
          dispatch(endGame())
          alert('You won')
          deleteGameState()
          return;
        }
      } else {
        const gameState = {
          ...game,
          timeStamp: Date.now(),
        }
        saveGameState(gameState)
        if (game.opponent && game.opponent.id === 'computer' && game.playerToMove !== game.myColor) {
          const fen = toFen(game.board, game.playerToMove, game.longCastleWhite, game.shortCastleWhite, game.longCastleBlack, game.shortCastleBlack, game.enPassant)
          console.log('fen',fen)
          if (fen) {
            const variables = { fen }
            console.log('variables',variables)
            getComputerMove({ variables })
          }
        }
      }
    }
  }, [game.board, game.gameOn])

  useEffect(() => {
    console.log('getComputerMoveResult',getComputerMoveResult)
    if (getComputerMoveResult.called && !getComputerMoveResult.loading) {
      const move = getComputerMoveResult.data.getComputerMove
      console.log('move', move)
      if (game.gameOn && game.opponent && game.opponent.id === 'computer') {
        dispatch(setMovingPiece(move))
        setTimeout(() => {
          dispatch(setMovingPiece(null))
          dispatch(movePieceRedux({...move, promotion: 'Q', time: opponentsClock}))                    //??????????????
        },0)
      }
    }
  }, [getComputerMoveResult.data])

  useEffect(() => {
    console.log('game.gameOn',game.gameOn)
    if (game.gameOn) setActiveMenuItem('game')
    else setActiveMenuItem('players') 
  }, [game.gameOn])

  const handleShow = (color) => {
    if (attackedSquares == null) {
      setAttackedSquares(getAttackedSquares(game.board, color))
    } else {
      setAttackedSquares(null)
    }
  }
  const handleResignation = () => {
    if (game.opponent && game.opponent.id !== 'computer') {
      console.log('resign', user.id)
      resign({ variables: { userId: user.id}})
    }
    alert('You resigned')
    dispatch(endGame())
    deleteGameState()
  }
  const playComputer = (timeControl, myColor) => {
    dispatch(initGame({
      opponent: { username: 'Computer', id: 'computer'},
      clockRunning: myColor === 'white',
      opponentsClockRunning: myColor === 'black',
      myColor
    }))
    setClock(timeControl)
    setOpponentsClock(timeControl)
  }

  return (
    <div style={{ padding: 30, display: 'flex', flexDirection: 'row'}}>
      <div style={{ padding: 30}}>
      
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          { game.opponent &&
            <Label image>
              <img src='https://react.semantic-ui.com/images/avatar/small/joe.jpg' />
              {game.opponent.username}
            </Label>
          }
          <Clock time={opponentsClock}/>
        </div>
        <Board 
          attackedSquares={attackedSquares}
          gameSettings={gameSettings}
          clock={clock}
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
        {false && 
        <div>
          {!attackedSquares && <button onClick={() => handleShow('black')}>show black's attack</button>}
          {!attackedSquares && <button onClick={() => handleShow('white')}>show white's attack</button>}
          {attackedSquares && <button onClick={() => handleShow('')}>hide attack</button>}
          <button onClick={() => isInCheck('black', game.board)}>is black in check</button>
        </div>
        }
        </div>
      <Button circular inverted icon='setting' onClick={()=>setSettingsModalOpen(true)}/>
      <div style={{ backgroundColor: 'white'}}>
        <Menu attached='top' inverted>
          { game.gameOn &&
            <Menu.Item
              name='Game'
              active={activeMenuItem === 'game'}
              onClick={() => setActiveMenuItem('game')}
            />
          }
          {!game.gameOn && 
            <Menu.Item
              name='players'
              active={activeMenuItem === 'players'}
              onClick={() => setActiveMenuItem('players')}
            />
          }
          <Menu.Item
            name='chat'
            active={activeMenuItem === 'chat'}
            onClick={() => setActiveMenuItem('chat')}
          />
        </Menu>
        {activeMenuItem === 'players' && !game.gameOn
          && <div> 
            <Users me={user} />
            {(user && !pendingChallenge) &&
              <Button onClick={() => setChallengeComputerModalOpen(true)}>Play against computer</Button>
            }
          </div> 
        }
        {activeMenuItem === 'chat' && user
          && <Chat/>
        }
        {activeMenuItem === 'game' && game.gameOn
          && <Button onClick={handleResignation}>Resign</Button>
        }
        
      </div>
      
      <SettingsModal
        modalOpen={settingsModalOpen}
        close={() => setSettingsModalOpen(false)}
        settings={gameSettings}
        setSettings={setGameSettings}
      />
      <ChallengeModal
        modalOpen={challengeComputerModalOpen}
        close={() => setChallengeComputerModalOpen(false)}
        opponent={{ id: 'computer', username: 'Computer' }}
        playComputer={playComputer}
      /> 
    </div>
  );
}
export default Game;



