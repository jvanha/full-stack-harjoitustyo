import React from 'react'
import { Container, Header, Table } from 'semantic-ui-react'

const UserDetails = ({ user }) => {
  console.log(user)
  return (
    <div style={{ backgroundColor: 'white'}}>
    <Container>
      <Header>{user.username}</Header>
      <p>{user.id}</p>
      <Table selectable compact >
        <Table.Header>
          My Games
          <Table.Row>
            <Table.HeaderCell>Players</Table.HeaderCell>
            <Table.HeaderCell>Result</Table.HeaderCell>
            <Table.HeaderCell>Moves</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {user.games.map(game => (
            <Table.Row key={game.id} onClick={()=>console.log('click!')}>
              <Table.Cell><div>{game.white.username}</div><div>{game.black.username}</div></Table.Cell>
              <Table.Cell><div>{game.winner==='white'?1:0}</div><div>{game.winner==='black'?1:0}</div></Table.Cell>
              <Table.Cell>{game.moves.length}</Table.Cell>
              <Table.Cell>{game.date}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Container>
    </div>
  ) 
}

export default UserDetails