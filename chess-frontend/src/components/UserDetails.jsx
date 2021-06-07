import React from 'react'
import { Container, Header, List } from 'semantic-ui-react'

const UserDetails = ({ user }) => {
  console.log(user)
  return (
    <div style={{ backgroundColor: 'white'}}>
    <Container>
      <Header>{user.username}</Header>
      <p>{user.id}</p>
      <List>
        <List.Header>
          My Games
        </List.Header>
        {user.games ?
        user.games.map(game => (
          <List.Item key={game.id}>
            {game.winner}  
          </List.Item>
        ))
        :
        <div>no games</div>
        }
      </List>
    </Container>
    </div>
  ) 
}

export default UserDetails