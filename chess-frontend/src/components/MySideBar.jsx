import React from 'react'
import { useHistory } from 'react-router-dom'
import { Container, Menu, MenuHeader, Segment, Sidebar } from 'semantic-ui-react'

const MySideBar = () => {
  const history = useHistory()
  return (
      <Menu inverted vertical >
        <Menu.Item
          icon='home'
          name='Home'
          onClick={() => history.push('/')}
        />
        <Menu.Item
          icon='chess'
          name='Play'
          onClick={() => history.push('/play')}
        />
      </Menu>
  )
}

export default MySideBar