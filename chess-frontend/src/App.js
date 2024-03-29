import { useApolloClient, useLazyQuery, useMutation, useSubscription } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Route,
  Switch,
  useHistory,
  withRouter
} from 'react-router-dom'
import { Button, Divider, Header, Icon, Menu, Segment, Sidebar} from 'semantic-ui-react'
import ChallengeForm from './components/ChallengeForm'
import Game from './components/Game'
import LoginModal from './components/LoginModal'
import RegistryModal from './components/RegistryModal'
import ReplayBoard from './components/ReplayBoard'
import UserDetails from './components/UserDetails'
import { ACCEPT_CHALLENGE, CREATE_GAME, DECLINE_CHALLENGE, LOGOUT } from './graphql/mutations'
import { ALL_MESSAGES, ALL_USERS, ME } from './graphql/queries'
import { CHALLENGE_ACCEPTED, CHALLENGE_DECLINED, CHALLENGE_ISSUED, GAME_CREATED, MESSAGE_ADDED, MOVE_MADE, OPPONENT_RESIGNED, USER_LOGGED_IN, USER_LOGGED_OUT } from './graphql/subscriptions'
import { deleteGameState } from './localStorageService'
import { setMovingPiece } from './reducers/boardReducer'
import { clearChallenge } from './reducers/challengeReducer'
import { endGame, initGame, movePieceRedux } from './reducers/gameReducer'
import { clearUser, setUserRedux } from './reducers/userReducer'

const App = () => {
  const dispatch = useDispatch()
  const game = useSelector(state => state.game)
  const user = useSelector(state => state.user.user)
  const pendingChallenge = useSelector(state => state.challenge)

  const history = useHistory()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registryModalOpen, setRegistryModalOpen] = useState(false)
  const [clock, setClock] = useState(300)
  const [opponentsClock, setOpponentsClock] = useState(300)
  const [token, setToken] = useState(null)

  const client = useApolloClient()

  const [getUser, meResult] = useLazyQuery(ME, { fetchPolicy: 'network-only' }) 
  const [ logout, logoutResult ] = useMutation(LOGOUT)
  const [ acceptChallenge, acceptChallengeResult ] = useMutation(ACCEPT_CHALLENGE)
  const [ declineChallenge ] = useMutation(DECLINE_CHALLENGE)
  const [ createGame ] = useMutation(CREATE_GAME, {
    refetchQueries: [  {query: ME} ],
  })

  /*
  useEffect(() => {
    localStorage.clear()
    setToken(null)
    client.resetStore()
  }, [])
*/

useSubscription(MESSAGE_ADDED, {
  onSubscriptionData: ({ subscriptionData}) => {
    console.log('MESSAGE_ADDED subscriptionData',subscriptionData)
    const addedMessage = subscriptionData.data.messageAdded
    const messagesInStorage = client.readQuery({ query: ALL_MESSAGES })
    if (!messagesInStorage.allMessages.map(message => message.id).includes(addedMessage.id)) {
      client.writeQuery({
        query: ALL_MESSAGES,
        data: { allMessages: messagesInStorage.allMessages.concat(addedMessage)}
      })
    }
  }
})
  
  useSubscription(USER_LOGGED_IN, {
    onSubscriptionData: ({ subscriptionData}) => {
      console.log('USER_LOGGED_IN subscriptionData',subscriptionData)
      const loggedInUser = subscriptionData.data.userLoggedIn
      const usersInStorage = client.readQuery({ query: ALL_USERS })
      if (usersInStorage && !usersInStorage.allUsers.map(user => user.id).includes(loggedInUser.id)) {
        client.writeQuery({
          query: ALL_USERS,
          data: { allUsers: usersInStorage.allUsers.concat(loggedInUser)}
        })
      }
    }
  })
  
  useSubscription(USER_LOGGED_OUT, {
    onSubscriptionData: ({ subscriptionData}) => {
      console.log('USER_LOGGED_OU subscriptionData',subscriptionData)
      const loggedOutUser = subscriptionData.data.userLoggedOut
      const usersInStorage = client.readQuery({ query: ALL_USERS })
      client.writeQuery({
        query: ALL_USERS,
        data: { allUsers: usersInStorage.allUsers.filter(user => user.id !== loggedOutUser.id)}
      })
    }
  })

  useSubscription(CHALLENGE_ISSUED, {
    variables: { playerId: user ? user.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('App CHALLENGE ISSUED',subscriptionData)
      const challenger = subscriptionData.data.challengeIssued.opponents.challenger
      const timeControl = subscriptionData.data.challengeIssued.timeControl
      const color = subscriptionData.data.challengeIssued.color
      const message = timeControl%60 
        ? `You have been challenged for ${timeControl} second game by ${challenger.username} as ${color==='white' ? 'black' : 'white'}. Accept the challenge?`
        : `You have been challenged for ${timeControl/60} minute game by ${challenger.username} as ${color==='white' ? 'black' : 'white'}. Accept the challenge?`
      console.log('challenger',challenger)
      if (window.confirm(`(App) ${message}`)) {
        console.log('challenger', challenger)
        acceptChallenge({ variables: { username: challenger.username, id: challenger.id, timeControl, color }})
        history.push('/play')
      } else {
        declineChallenge({ variables: { username: challenger.username, id: challenger.id }})
        console.log('YOU DECLINED THE CHALLENGE')
      }
    }
  })

  useSubscription(CHALLENGE_ACCEPTED, {
    variables: { playerId: user ? user.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('subscriptionData', subscriptionData)
      const challenge = subscriptionData.data.challengeAccepted
      if (pendingChallenge === challenge.opponents.challenged.id) {
        console.log('LETS PLAY!')
        dispatch(clearChallenge())
        const myTurn = challenge.color === 'white'
        setClock(challenge.timeControl)
        setOpponentsClock(challenge.timeControl)
        dispatch(initGame({
          opponent: challenge.opponents.challenged,
          myColor: challenge.color,
          clock: challenge.timeControl,
          clockRunning: myTurn,
          opponentsClock: challenge.timeControl,
          opponentsClockRunning: !myTurn,
          playerToMove: 'white'
        }))
        history.push('/play')
      }
    }
  })
  
  useSubscription(CHALLENGE_DECLINED, {
    variables: { playerId: user ? user.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('(App) CHALLENGE DECLINED',subscriptionData)
      alert("(App) Your challenge has been declined")
      dispatch(clearChallenge())
    }
  })

  useSubscription(MOVE_MADE, {
    variables: { opponentId: game.opponent ? game.opponent.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      if (!game.gameOn) return 
      console.log('(App) MOVE MADE', subscriptionData)
      const { from, to, time, promotion } = subscriptionData.data.moveMade.move  
      const { myColor, moves, opponent } = game 
      if (time === 0) {
        const whiteId = myColor === 'white' ? user.id : opponent.id
        const blackId = myColor === 'black' ? user.id : opponent.id
        const winner = myColor
        
        //only the winner creates a new game
        createGame({ variables: { input: { whiteId, blackId, winner, moves} }})
        alert('(App) You won by timeout')
        dispatch(endGame({ opponentsClock: 0 }))
        deleteGameState()

      } else {
        dispatch(setMovingPiece({from, to}))
        setTimeout(() => {
          dispatch(setMovingPiece(null))
          dispatch(movePieceRedux({ from, to, promotion }))
        },0)
      }
    } 
  })

  useSubscription(GAME_CREATED, {
    variables: { playerId: user ? user.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('subscriptionData', subscriptionData)
      const createdGame = subscriptionData.data.gameCreated
      const userInStorage = client.readQuery({ query: ME })
      console.log('userInStorage', userInStorage)
      if (!userInStorage.me.games.map(game => game.id).includes(createdGame.id)) {
        console.log('writing query')
        client.writeQuery({
          query: ME,
          data: { 
            me: {...userInStorage.me, games: userInStorage.me.games.concat(createdGame)}}
        })
      }
    }
  })

  useSubscription(OPPONENT_RESIGNED, {
    variables: { opponentId: game.opponent ? game.opponent.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('OPPONENT RESIGNED',subscriptionData)
      const whiteId = game.myColor === 'white' ? user.id : game.opponent.id
      const blackId = game.myColor === 'black' ? user.id : game.opponent.id
      const winner = game.myColor
      //only the winner creates a new game
      createGame({ variables: { input: { whiteId, blackId, winner, moves: game.moves} }})
      dispatch(endGame())
      alert("You won by resignation")
      deleteGameState()
    }
  })


  
  useEffect(() => {
    if (token) {
      console.log('token.expiresIn',token.expiresIn)
      getUser()
      setTimeout(() => {
        logout()
        setLoginModalOpen(true)
      }, token.expiresIn*1000)
    }
  },[token])

  useEffect(() => {
    getUser()
  },[])

  useEffect(() => {
    if (logoutResult.called && !logoutResult.loading) {
      localStorage.clear()
      dispatch(clearUser())
      client.resetStore()
    }
    
  }, [logoutResult.data])

  useEffect(() => {
    console.log('meResult changed', meResult.data)
    if (meResult.data && meResult.data.me) {
      dispatch(setUserRedux(meResult.data.me))
    }
  }, [meResult])

  useEffect(() => {
    if (acceptChallengeResult.called && !acceptChallengeResult.loading) {
      console.log('(App) acceptChallengeResult',acceptChallengeResult)
      const challenge = acceptChallengeResult.data.acceptChallenge
      const opponent = challenge.opponents.challenger
      const timeControl = challenge.timeControl
      const myTurn = challenge.color === 'black'

      dispatch(initGame({
        opponent,
        clock: timeControl,
        opponentsClock: timeControl,
        clockRunning: myTurn,
        opponentsClockRunning: !myTurn,
        playerToMove: 'white',
        myColor: challenge.color==='white' ? 'black' : 'white',
      }))
      setClock(timeControl)
      setOpponentsClock(timeControl)
    }
  }, [acceptChallengeResult.data])

  useEffect(() => {
    if (game.clockRunning) {
      const interval = setInterval(() => {
        setClock(clock => clock - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [game.clockRunning])

  useEffect(() => {
    if (game.opponentsClockRunning) {
      const interval = setInterval(() => {
        setOpponentsClock(opponentsClock => opponentsClock - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [game.opponentsClockRunning])


  const date = new Date()
  return (
    <Sidebar.Pushable>
        <Sidebar
          as={Menu}
          inverted
          vertical
          visible
          width='thin'
        >
          <Menu.Item as='a' onClick={() => history.push('/home')}>
            <Icon name='home'/>
            Home
          </Menu.Item>
          <Menu.Item as='a' onClick={() => history.push('/play')}>
            <Icon name='chess'/>
            Play
          </Menu.Item>
          {false &&
          <Menu.Item as='a' onClick={() => history.push('/replay')}>
            <Icon name='chess'/>
            Replay
          </Menu.Item>
          }
          <Divider />
          <div>
            {user
              ? <Button inverted onClick={logout}>Logout</Button>
              : <Button.Group compact>
                  <Button inverted onClick={() => setLoginModalOpen(true)}>login</Button>
                  <Button.Or />
                  <Button inverted onClick={() => setRegistryModalOpen(true)}>register</Button>
                </Button.Group>
            }
          </div> 
        </Sidebar>
        <Sidebar.Pusher>
          <div style={{minHeight: '100vh', backgroundColor: '#0e140c'}}>
            <div style={{color: 'white'}}>{date.toDateString()}</div>
            <Switch>
              <Route path='/home'>
                {user 
                  ? 
                  <UserDetails user={user}/>
                  :
                  <Segment inverted>
                    <Header>Tervetuloa</Header>
                    Login to play or register first if you haven't already.
                  </Segment>
                }
              </Route>
              <Route path='/play'>
                <Game
                  clock={clock}
                  opponentsClock={opponentsClock}
                  setClock={setClock}
                  setOpponentsClock={setOpponentsClock}
                 />
              </Route>
                <Route path='/replay'>
                  <ReplayBoard/>
                </Route>
              <Route path='/'>
                <Segment inverted>
                  <Header>Tervetuloa</Header>
                    Login to play or register first if you haven't already.
                </Segment>
              </Route>
            </Switch>
          </div>
        </Sidebar.Pusher>
        <LoginModal
            setToken={setToken}
            modalOpen={loginModalOpen}
            close={() => setLoginModalOpen(false)}
          />
          <RegistryModal
            modalOpen={registryModalOpen}
            close={() => setRegistryModalOpen(false)}
          />
    </Sidebar.Pushable>
  )
}

export default withRouter(App)
