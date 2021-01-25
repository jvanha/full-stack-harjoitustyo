import { useApolloClient, useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
  useHistory,
  withRouter
} from 'react-router-dom'
import { Button, Container, Divider, Grid, Header, Icon, Menu, Segment, Sidebar} from 'semantic-ui-react'
import Game from './components/Game'
import LoginModal from './components/LoginModal'
import MySideBar from './components/MySideBar'
import RegistryModal from './components/RegistryModal'
import { LOGOUT } from './graphql/mutations'

const App = () => {
  const history = useHistory()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registryModalOpen, setRegistryModalOpen] = useState(false)
  const [token, setToken] = useState(null)
  const client = useApolloClient()
  const linkStyle = {
    padding: 5
  }
  
  const [ logout, logoutResult ] = useMutation(LOGOUT)

  useEffect(() => {
    localStorage.clear()
    setToken(null)
    client.resetStore()
  }, [])

  useEffect(() => {
    console.log('token', token)
  }, [token])

  useEffect(() => {
    console.log('logoutResult',logoutResult)
    if (logoutResult.called && !logoutResult.loading) {
      localStorage.clear()
      setToken(null)
      client.resetStore()
    }
    
  }, [logoutResult.data])

  return (
    <Sidebar.Pushable>
        <Sidebar
          as={Menu}
          inverted
          vertical
          visible
          width='thin'
          
        >
          <Menu.Item as='a' onClick={() => history.push('/')}>
            <Icon name='home'/>
            Home
          </Menu.Item>
          <Menu.Item as='a' onClick={() => history.push('/play')}>
            <Icon name='chess'/>
            Play
          </Menu.Item>
          <Menu.Item as='a' onClick={() => history.push('/play')}>
            <Icon name='rule'/>
            Rules
          </Menu.Item>
          <Divider />
          <div>
            {token 
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
          <Switch>
            <Route path='/play'>
              <Game token={token}/>
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