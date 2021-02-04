import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { CREATE_USER } from '../graphql/mutations'
import { Button, Form, Input} from 'semantic-ui-react'

const RegistryForm = ({ close }) => {
  const [username, setUsername] = useState('')
  
  const [createUser] = useMutation(CREATE_USER)
  const submit = (event) => {
    event.preventDefault()
    createUser({ variables: { username }})
    setUsername('')
    close()
  }

  return (
    <Form onSubmit={submit}> 
      <Form.Field
        control={Input}
        name='username'
        label='Username'
        placeholder='Username'
        value={username}
        onChange={(e, { value }) => setUsername(value)}
      />
      <Form.Field
        control={Input}
        label='Password'
        placeholder='Password'
        type='password'
      />
      <Form.Group>
        <Button 
          type='submit'
          color='green'
        >
          Register
        </Button>
      </Form.Group>
      
      
    </Form>
  )
}

export default RegistryForm