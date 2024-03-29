import React from 'react'
import { Modal } from 'semantic-ui-react'
import LoginForm from './LoginForm'

const LoginModal = ({ setToken, close, modalOpen }) => {
  return (
    <Modal size='tiny' closeIcon open={modalOpen} onClose={close}>
      <Modal.Header>Login</Modal.Header>
      <Modal.Content>
        <LoginForm setToken={setToken} close={close}/>
      </Modal.Content>
      
    </Modal>
  )
}

export default LoginModal