import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { CHALLENGE, CANCEL_CHALLENGE } from '../graphql/mutations'

const User = ({ user, challengeWaiting, setChallengeWaiting }) => {
  const [ challenge, challengeResult ] = useMutation(CHALLENGE)
  const [ cancelChallenge, cancelChallengeResult] = useMutation(CANCEL_CHALLENGE)

  useEffect(() => {
    if (challengeResult.called && !challengeResult.loading) {
      console.log('challenge result data',challengeResult.data)
      setChallengeWaiting(user.id)
    }
    
  }, [challengeResult.data])

  useEffect(() => {
    if (cancelChallengeResult.called && !cancelChallengeResult.loading) {
      console.log('cancelChallenge result data',cancelChallengeResult.data)
      setChallengeWaiting(null)
    }
    
  }, [cancelChallengeResult.data])
  
  const handleChallence = () => {
    challenge({ variables: { id: user.id, username: user.username } })
  }

  const handleCancel = () => {
    cancelChallenge({ variables: { id: user.id, username: user.username } })
  }

  return (
    <div>
      {user.username}
      {challengeWaiting === user.id 
        && 
        <>
          <span style={{ margin: 5, color: 'green'}}>waiting</span>
          <button onClick={handleCancel}>cancel</button>
        </>
      }
      {!challengeWaiting
        && <button onClick={handleChallence}>challence</button>
      }
    </div>
  )
}
const Users = ({ users, challengeWaiting, setChallengeWaiting}) => {
  return (
    <div style={{ margin: 10}}>
      {users.map(user => 
        <User 
          key={user.id}
          user={user}
          challengeWaiting={challengeWaiting}
          setChallengeWaiting={setChallengeWaiting}
        />
      )}
    </div>
  )
}
export default Users