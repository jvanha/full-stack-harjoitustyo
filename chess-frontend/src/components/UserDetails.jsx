import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Container, Header, Table } from 'semantic-ui-react'
import { setReplayState } from '../reducers/replayReducer'

const UserDetails = ({ user }) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const handleShow = (game) => {
    const replayState = {
      moves: game.moves
    }
    dispatch(setReplayState(replayState))
    history.push('/replay')
    
  }
  console.log(user)
  
  return (
    <div style={{ color: 'white' }}>
      <Container>
        <h1>{user.username}</h1>
        <p>Joined {user.registrationDate}</p>
        <Table selectable compact inverted>
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
              <Table.Row key={game.id} onClick={() => handleShow(game)}>
                <Table.Cell><div>{game.white.username}</div><div>{game.black.username}</div></Table.Cell>
                <Table.Cell><div>{game.winner===''?'1/2':(game.winner==='white'?1:0)}</div><div>{game.winner===''?'1/2':(game.winner==='black'?1:0)}</div></Table.Cell>
                <Table.Cell>{game.moves.length}</Table.Cell>
                <Table.Cell>{game.date}</Table.Cell>
                <Table.Cell as='a' onClick={() => handleShow(game)}>show</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>
    </div>
  ) 
}

export default UserDetails