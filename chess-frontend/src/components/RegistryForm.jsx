import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { CREATE_USER } from '../graphql/mutations'

const RegistryForm = () => {
  const [username, setUsername] = useState('')
  
  const [createUser] = useMutation(CREATE_USER)
  const submit = (event) => {
    event.preventDefault()
    createUser({ variables: { username }})
    setUsername('')
  } 
  return (
    <div style={{ margin: 10}}>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <div>
          username
          <input 
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <button type='submit'>Register</button>
      </form>
    </div>
  )
}

export default RegistryForm