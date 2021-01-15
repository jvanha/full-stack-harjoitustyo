import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { LOGIN } from '../graphql/mutations'

const LoginForm = ({ setToken }) => {
  const history = useHistory()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    }
  })
  
  useEffect(() => {
    if (result.data) {
      console.log(result.data)
      const token = result.data.login.value
      console.log(token)
      localStorage.setItem('chess-user-token', token)
      setToken(token)
      history.push('/')
    }
  }, [result.data])

  const submit = async (event) => {
    event.preventDefault()
    login({ variables: { username, password }})
    setUsername('')
    setPassword('')
    
  }
  return (
    <div style={{ margin: 10}}>
      <form onSubmit={submit}>
        <div>
          username
          <input 
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input 
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>Login</button>
    </form>
    </div>
  )
}

export default LoginForm