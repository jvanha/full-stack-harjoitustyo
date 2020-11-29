import { useSubscription } from '@apollo/client'
import React, { useState } from 'react'

const User = ({ user }) => {
  const [ challenged, setChallenged ] = useState(false)
  const handleChallence = () => {
    setChallenged(true)
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