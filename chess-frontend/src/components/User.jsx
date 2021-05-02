import { useMutation } from '@apollo/client'
import React, { useEffect } from 'react'
import { Button, List } from 'semantic-ui-react'
import { CHALLENGE, CANCEL_CHALLENGE } from '../graphql/mutations'

const User = ({ user, me, challengeWaiting, setChallengeWaiting }) => {
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
    <List.Item >
      {me && me.id !== user.id
        &&
        <List.Content floated='right'>
          {challengeWaiting === user.id 
            && 
            <>
              <span style={{ margin: 5, color: 'green'}}>waiting</span>
              <Button compact onClick={handleCancel}>cancel</Button>
            </>
          }
          {!challengeWaiting
            && <Button compact onClick={handleChallence}>challence</Button>
          }
        </List.Content>
      }
      <List.Content>
        <List.Header>
          {user.username}
        </List.Header>
        <List.Description>
          
        </List.Description>
      </List.Content>
      
      
    </List.Item>
  )
}
export default User