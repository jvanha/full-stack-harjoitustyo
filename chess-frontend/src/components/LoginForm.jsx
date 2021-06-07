import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { LOGIN } from '../graphql/mutations'
import { Button, Form, Input} from 'semantic-ui-react'

const LoginForm = ({ setToken, close }) => {
  const history = useHistory()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      console.log('error')
      console.log(error)
    }
  })
  
  useEffect(() => {
    if (result.data) {
      console.log(result.data)
      const token = result.data.login
      console.log(token)
      localStorage.setItem('chess-user-token', token.value)
      setToken(token)
      history.push('/')
      close()
    }
  }, [result.data])

  const submit = (event) => {
    event.preventDefault()
    login({ variables: { username, password }})
    setUsername('')
    setPassword('')
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
        value={password}
        onChange={(e, { value }) => setPassword(value)}
      />
      <Form.Group>
        <Button 
          type='submit'
          color='green'
        >
          Login
        </Button>
      </Form.Group>
      
      
    </Form>
  )
}

export default LoginForm