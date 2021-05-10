import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { Button, Dropdown, Form } from 'semantic-ui-react'
import { CANCEL_CHALLENGE, CHALLENGE } from '../graphql/mutations'
const options = [
  { key: 0, text: '10 sec', value: 10},
  { key: 1, text: '1 min', value: 60 },
  { key: 3, text: '3 min', value: 180 },
  { key: 5, text: '5 min', value: 300 },
  { key: 10, text: '10 min', value: 600 },

]
const ChallengeForm = ({ opponent, setChallengeWaiting, close }) => {
  const [ timeControl, setTimeControl ] = useState(5)
  const [ challenge, challengeResult ] = useMutation(CHALLENGE)
  const [ cancelChallenge, cancelChallengeResult] = useMutation(CANCEL_CHALLENGE)

  useEffect(() => {
    if (challengeResult.called && !challengeResult.loading) {
      console.log('challenge result data',challengeResult.data)
      setChallengeWaiting(opponent.id)
      close()
    }
    
  }, [challengeResult.data])

  useEffect(() => {
    if (cancelChallengeResult.called && !cancelChallengeResult.loading) {
      console.log('cancelChallenge result data',cancelChallengeResult.data)
      setChallengeWaiting(null)
    }
    
  }, [cancelChallengeResult.data])

  console.log(timeControl)

  const submit = (event) => {
    event.preventDefault()
    challenge({ variables: { id: opponent.id, username: opponent.username, timeControl } })
  }
  return (
    <Form onSubmit={submit}>
      <Dropdown 
        selection
        fluid
        options={options}
        placeholder='5 min'
        value={timeControl}
        onChange={(e, { value }) => setTimeControl(value)}/>
      <Button 
        type='submit'
        color='green'
      >
        Challenge
      </Button>
    </Form>
  )
}

export default ChallengeForm