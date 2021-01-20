import React, { useState } from 'react'
import { Modal } from 'semantic-ui-react'
import RegistryForm from './RegistryForm'

const RegistryModal = ({ close, modalOpen }) => {
  return (
    <Modal closeIcon open={modalOpen} onClose={close}>
      <Modal.Header>Register</Modal.Header>
      <Modal.Content>
        <RegistryForm close={close} />
      </Modal.Content>
      
    </Modal>
  )
}

export default RegistryModal