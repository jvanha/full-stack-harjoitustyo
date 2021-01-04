import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { CHALLENGE } from '../graphql/mutations'

const User = ({ user }) => {
  const [ challenge, result ] = useMutation(CHALLENGE) 
  const [ challenged, setChallenged ] = useState(false)
  useEffect(() => {
    if (result.called && !result.loading) {
      console.log('challenge result data',result.data)
      setChallenged(true)
    }
    
  }, [result.data])
  const handleChallence = () => {
    challenge({ variables: { id: user.id, username: user.username}})
  }
  return (
    <div>
      {user.username}
      {challenged 
        ? <span style={{ margin: 5, color: 'green'}}>waiting</span>
        : <button onClick={handleChallence}>challence</button>
      }
    </div>
  )
}
const Users = ({ users }) => {
  return (
    <div style={{ margin: 10}}>
      {users.map(user => 
        <User key={user.id} user={user} />
      )}
    </div>
  )
}
export default Users