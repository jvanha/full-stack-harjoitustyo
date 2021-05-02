import React from 'react'
import { Container, Header } from 'semantic-ui-react'

const UserDetails = ({ user }) => {
  return (
    <div style={{ backgroundColor: 'white'}}>
    <Container>
      <Header>{user.username}</Header>
      <p>{user.id}</p>
    </Container>
    </div>
  ) 
}

export default UserDetails