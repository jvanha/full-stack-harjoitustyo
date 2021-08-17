import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Button, Dropdown, Form } from 'semantic-ui-react'
import { CANCEL_CHALLENGE, CHALLENGE } from '../graphql/mutations'
import { setChallengePending } from '../reducers/challengeReducer'

const timeOptions = [
  { key: 0, text: '10 sec', value: 10},
  { key: 1, text: '1 min', value: 60 },
  { key: 3, text: '3 min', value: 180 },
  { key: 5, text: '5 min', value: 300 },
  { key: 10, text: '10 min', value: 600 },

]
const colorOptions = [
  { key: 0, text: 'Black', value: 'black' },
  { key: 1, text: 'White', value: 'white' },
  { key: 2, text: 'Random', value: 'random'},
]
const ChallengeForm = ({ opponent, setChallengeWaiting, close }) => {
  const [ timeControl, setTimeControl ] = useState(300)
  const [ color, setColor ] = useState('white') 
  const [ challenge, challengeResult ] = useMutation(CHALLENGE)

  const dispatch = useDispatch()

  useEffect(() => {
    if (challengeResult.called && !challengeResult.loading) {
      console.log('challenge result data',challengeResult.data)
      //setChallengeWaiting(opponent.id)
      dispatch(setChallengePending(opponent.id))              //REDUX
      close()
    }
    
  }, [challengeResult.data])

  const submit = (event) => {
    event.preventDefault()
    challenge({
     variables: {
       id: opponent.id,
       username: opponent.username,
       timeControl,
       color: color === 'random' ? ['black','white'][Math.floor(Math.random() * 2)] : color,
      } 
    })
  }
  return (
    <Form onSubmit={submit}>
      <Dropdown 
        selection
        fluid
        options={timeOptions}
        placeholder='5 min'
        value={timeControl}
        onChange={(e, { value }) => setTimeControl(value)}/>
      Play as
      <Dropdown
        selection
        fluid
        options={colorOptions}
        placeholder='White'
        value={color}
        onChange={(e, { value }) => setColor(value)}/>
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