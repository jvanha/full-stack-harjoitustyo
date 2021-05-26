import { useApolloClient, useLazyQuery, useMutation, useSubscription } from '@apollo/client'
import React, { useEffect, useState } from 'react'
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
import MySideBar from './components/MySideBar'
import RegistryModal from './components/RegistryModal'
import UserDetails from './components/UserDetails'
import { LOGOUT } from './graphql/mutations'
import { ALL_USERS, ME } from './graphql/queries'
import { USER_LOGGED_IN, USER_LOGGED_OUT } from './graphql/subscriptions'

const App = () => {
  const history = useHistory()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registryModalOpen, setRegistryModalOpen] = useState(false)

  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const client = useApolloClient()
  const linkStyle = {
    padding: 5
  }
  
  const [getUser, meResult] = useLazyQuery(ME, { fetchPolicy: 'network-only' }) 
  const [ logout, logoutResult ] = useMutation(LOGOUT)
/*
  useEffect(() => {
    localStorage.clear()
    setToken(null)
    client.resetStore()
  }, [])
*/
/*
useSubscription(MESSAGE_ADDED, {
  onSubscriptionData: ({ subscriptionData}) => {
    console.log('MESSAGE_ADDED subscriptionData',subscriptionData)
    const addedMessage = subscriptionData.data.messageAdded
    const messagesInStorage = client.readQuery({ query: ALL_MESSAGES })
    if (!usersInStorage.allUsers.map(user => user.id).includes(loggedInUser.id)) {
      client.writeQuery({
        query: ALL_USERS,
        data: { allUsers: usersInStorage.allUsers.concat(loggedInUser)}
      })
    }
  }
})
*/
  useSubscription(USER_LOGGED_IN, {
    onSubscriptionData: ({ subscriptionData}) => {
      console.log('USER_LOGGED_IN subscriptionData',subscriptionData)
      const loggedInUser = subscriptionData.data.userLoggedIn
      const usersInStorage = client.readQuery({ query: ALL_USERS })
      if (!usersInStorage.allUsers.map(user => user.id).includes(loggedInUser.id)) {
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
  useEffect(() => {
    getUser()
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
    //console.log('meResult changed', meResult.data)
    if (meResult.data && meResult.data.me) {
      //console.log('meResult.data.me',meResult.data.me)
      const itsme = meResult.data.me
      //console.log({ id: itsme.id, username: itsme.username })
      setUser({ id: itsme.id, username: itsme.username })
      //console.log('user', user)
      
    }
  }, [meResult])

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