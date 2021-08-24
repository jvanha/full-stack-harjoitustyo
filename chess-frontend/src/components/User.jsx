import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, List } from 'semantic-ui-react'
import { CANCEL_CHALLENGE } from '../graphql/mutations'
import { clearChallenge, setChallengePending } from '../reducers/challengeReducer'
import ChallengeModal from './ChallengeModal'

const User = ({ user, me }) => {
  const pendingChallenge = useSelector(state => state.challenge)
  const [ cancelChallenge, cancelChallengeResult] = useMutation(CANCEL_CHALLENGE)
  const [challengeModalOpen, setChallengeModalOpen] = useState(false)

  const dispatch = useDispatch()

  useEffect(() => {
    if (cancelChallengeResult.called && !cancelChallengeResult.loading) {
      console.log('cancelChallenge result data',cancelChallengeResult.data)
      dispatch(clearChallenge())              //REDUX
    }
    
  }, [cancelChallengeResult.data])


  const handleCancel = () => {
    cancelChallenge({ variables: { id: user.id, username: user.username } })
  }

  return (
    <List.Item >
      {me && me.id !== user.id
        &&
        <List.Content floated='right'>
          {pendingChallenge=== user.id 
            && 
            <>
              <span style={{ margin: 5, color: 'green'}}>waiting</span>
              <Button compact onClick={handleCancel}>cancel</Button>
            </>
          }
          {!pendingChallenge
            && <Button compact onClick={() => setChallengeModalOpen(true)}>challence</Button>
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
      <ChallengeModal
        modalOpen={challengeModalOpen}
        close={() => setChallengeModalOpen(false)}
        opponent={user}
      /> 
    </List.Item>
  )
}
export default User