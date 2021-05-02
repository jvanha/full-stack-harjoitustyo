import { useApolloClient, useQuery, useSubscription } from '@apollo/client'
import React from 'react'
import { List } from 'semantic-ui-react'
import { ALL_USERS } from '../graphql/queries'
import { USER_LOGGED_IN, USER_LOGGED_OUT } from '../graphql/subscriptions'
import User from './User'


const Users = ({ challengeWaiting, setChallengeWaiting, me}) => {
  const client = useApolloClient()
  const result = useQuery(ALL_USERS)

  useSubscription(USER_LOGGED_IN, {
    onSubscriptionData: ({ subscriptionData}) => {
      console.log('subscriptionData',subscriptionData)
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
      console.log('subscriptionData',subscriptionData)
      const loggedOutUser = subscriptionData.data.userLoggedOut
      const usersInStorage = client.readQuery({ query: ALL_USERS })
      client.writeQuery({
        query: ALL_USERS,
        data: { allUsers: usersInStorage.allUsers.filter(user => user.id === loggedOutUser.id)}
      })
    }
  })
  console.log('Users result',result)
  if (result.loading) return <div>loading users...</div>
  if (!result.data || !result.data.allUsers || result.data.allUsers.length === 0)
    return <div>No users online</div>
  
  return (
    <List relaxed celled>
      <List.Header as='h3'>
        Users
      </List.Header>
      {result.data.allUsers.map(user => 
        <User 
          key={user.id}
          user={user}
          challengeWaiting={challengeWaiting}
          setChallengeWaiting={setChallengeWaiting}
          me={me}
        />
      )}
    </List>
  )
}

export default Users