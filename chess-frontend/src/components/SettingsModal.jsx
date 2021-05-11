import React from 'react'
import { Modal } from 'semantic-ui-react'
import Settings from './Settings'

const SettingsModal = ({ close, modalOpen }) => {
  return (
    <Modal closeIcon open={modalOpen} onClose={close}>
      <Modal.Header>Settings</Modal.Header>
      <Modal.Content>
        <Settings close={close} />
      </Modal.Content>
      
    </Modal>
  )
}

export default SettingsModal