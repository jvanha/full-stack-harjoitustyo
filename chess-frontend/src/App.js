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
import { ACCEPT_CHALLENGE, DECLINE_CHALLENGE, LOGOUT } from './graphql/mutations'
import { ALL_MESSAGES, ALL_USERS, ME } from './graphql/queries'
import { CHALLENGE_ACCEPTED, CHALLENGE_DECLINED, CHALLENGE_ISSUED, MESSAGE_ADDED, MOVE_MADE, USER_LOGGED_IN, USER_LOGGED_OUT } from './graphql/subscriptions'
import { clearChallenge } from './reducers/challengeReducer'
import { initGame, updateGame } from './reducers/gameReducer'
import { setUserRedux } from './reducers/userReducer'

const App = () => {
  const dispatch = useDispatch()
  const game = useSelector(state => state.game)
  const reduxuser = useSelector(state => state.user)
  const pendingChallenge = useSelector(state => state.challenge)
  const history = useHistory()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registryModalOpen, setRegistryModalOpen] = useState(false)

  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const client = useApolloClient()

  const [getUser, meResult] = useLazyQuery(ME, { fetchPolicy: 'network-only' }) 
  const [ logout, logoutResult ] = useMutation(LOGOUT)
  const [ acceptChallenge, acceptChallengeResult ] = useMutation(ACCEPT_CHALLENGE)
  const [ declineChallenge, declineChallengeResult ] = useMutation(DECLINE_CHALLENGE)
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
    variables: { playerId: reduxuser ? reduxuser.id : ''},
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
      } else {
        declineChallenge({ variables: { username: challenger.username, id: challenger.id }})
        console.log('YOU DECLINED THE CHALLENGE')
      }
    }
  })

  useSubscription(CHALLENGE_ACCEPTED, {
    variables: { playerId: reduxuser ? reduxuser.id : ''},
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('subscriptionData', subscriptionData)
      const challenge = subscriptionData.data.challengeAccepted
      if (pendingChallenge === challenge.opponents.challenged.id) {
        //dispatch(clearChallenge())              TESTING
        dispatch(initGame({
          opponent: challenge.opponents.challenged,
          myColor: challenge.color,
          clock: challenge.timeControl,
          opponentsClock: challenge.timeControl,
          opponentsClockRunning: true,

        }))
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
      console.log('(App) MOVE MADE', subscriptionData)
      const {from, to, time, promotion } = subscriptionData.data.moveMade.move  
      const {board, myColor, moves, opponent, ...rest } = game 
      if (time === 0) {
        const whiteId = myColor === 'white' ? user.id : opponent.id
        const blackId = myColor === 'black' ? user.id : opponent.id
        const winner = myColor
        
        //only the winner creates a new game
        //createGame({ variables: { input: { whiteId, blackId, winner, moves} }})
        alert('(App) You won by timeout')
        dispatch(updateGame({
          clockRunning: false,
          playerToMove: null,
          opponentsClockRunning: false,
          opponentsClock: time
        }))
        //deleteGameState()

      } else {
        //setMoves(moves.concat({from, to, time, promotion, takenPiece: board[to][1]}))
        //setMoveMade({from, to, time, promotion})
        dispatch(updateGame({
          moves: moves.concat({from, to, time, promotion, takenPiece: board[to][1]}),
          clockRunning: true,
          opponentsClockRunning: false,
          opponentsClock: time
        }))
      }
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
    //console.log('logoutResult',logoutResult)
    if (logoutResult.called && !logoutResult.loading) {
      //console.log('CLEAR LOCAL STORAGE')
      localStorage.clear()
      setUser(null)
      client.resetStore()
    }
    
  }, [logoutResult.data])

  useEffect(() => {
    console.log('meResult changed', meResult.data)
    if (meResult.data && meResult.data.me) {
      //console.log('meResult.data.me',meResult.data.me)
      const itsme = meResult.data.me
      //console.log({ id: itsme.id, username: itsme.username })
      setUser(itsme)
      dispatch(setUserRedux(meResult.data.me))
      //console.log('user', user)
      
    }
  }, [meResult])

  useEffect(() => {
    console.log('(App) useEfect')
    if (acceptChallengeResult.called && !acceptChallengeResult.loading) {
      
      console.log('(App) acceptChallengeResult',acceptChallengeResult)
      const challenge = acceptChallengeResult.data.acceptChallenge
      const opponent = challenge.opponents.challenger
      const timeControl = challenge.timeControl
      /*
      setOpponent(challenge.opponents.challenger)
      setMyColor(challenge.color==='white' ? 'black' : 'white')
      setClock(challenge.timeControl)
      setOpponentsClock(challenge.timeControl)
      setClockRunning(true)
      setPlayerToMove('white')
      setBoard(initBoard)
      */
      console.log('(App) opponent', opponent)
      dispatch(initGame({
        opponent,
        clock: timeControl,
        opponentsClock: timeControl,
        clockRunning: true,
        opponentsClockRunning: true,
        playerToMove: 'white',
      }))

    }
  }, [acceptChallengeResult.data])

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
          {user && 
            <Menu.Item as='a' onClick={() => history.push('/rules')}>
              <Icon name='chess board'/>
              Rules
            </Menu.Item>
          }
          <Menu.Item as='a' onClick={() => history.push('/replay')}>
            <Icon name='chess'/>
            Replay
          </Menu.Item>
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
              <Route path='/rules'>
                <div style={{ color: 'white' }}>työn alla</div>
                <ChallengeForm />
              </Route>
              <Route path='/home'>
                {user 
                  ? 
                  <UserDetails user={user}/>
                  :
                  <Segment inverted>
                    <Header>tervetuloa</Header>
                    Login to play or register first if you haven't already.
                  </Segment>
                }
              </Route>
              <Route path='/play'>
                <Game user={user}/>
              </Route>
              <Route path='/replay'>
                <ReplayBoard/>
              </Route>
              <Route path='/'>
                <Segment inverted>
                  <Header>tervetuloo</Header>
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

//backgroundColor: '#0e140c'