import React from 'react'
import { Modal } from 'semantic-ui-react'
import Settings from './Settings'

const SettingsModal = ({ close, modalOpen, settings, setSettings }) => {
  return (
    <Modal size='tiny' closeIcon open={modalOpen} onClose={close}>
      <Modal.Header>Settings</Modal.Header>
      <Modal.Content>
        <Settings settings={settings} setSettings={setSettings} close={close}/>
      </Modal.Content>
    </Modal>
  )
}

export default SettingsModal