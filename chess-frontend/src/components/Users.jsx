import { useQuery } from '@apollo/client'
import React from 'react'
import { useSelector } from 'react-redux'
import { List } from 'semantic-ui-react'
import { ALL_USERS } from '../graphql/queries'
import User from './User'


const Users = ({ challengeWaiting, setChallengeWaiting, me}) => {
  const result = useQuery(ALL_USERS)
  const pendingChallenge = useSelector(state => state.challenge)
  //console.log('Users result',result)
  if (result.loading) return <div>loading users...</div>
  if (!result.data || !result.data.allUsers || result.data.allUsers.length === 0)
    return <div>No users online</div>
  
  return (
    <div>
      <List relaxed celled>
        <List.Header as='h3'>
          Users
        </List.Header>
        {result.data.allUsers.map(user => 
          <User 
            key={user.id}
            user={user}
            challengeWaiting={pendingChallenge}
            setChallengeWaiting={setChallengeWaiting}
            me={me}
          />
        )}
      </List>      
    </div>
  )
}

export default Users