import React, { useState } from 'react'
import { Button, Checkbox, Modal } from 'semantic-ui-react'
import Settings from './Settings'

const SettingsModal = ({ close, modalOpen, settings, setSettings }) => {
  const [autoQueen, setAutoQueen ] = useState(false)
  const handleChange = () => {
    console.log(autoQueen)
    setAutoQueen(!autoQueen)
  }
  return (
    <Modal size='tiny' closeIcon open={modalOpen} onClose={close}>
      <Modal.Header>Settings</Modal.Header>
      <Modal.Content>
        <Settings settings={settings} setSettings={setSettings} close={close}/>
      </Modal.Content>
      <Modal.Actions>
        <Button positive >Save</Button>
        <Button secondary >Cancel</Button>
      </Modal.Actions>
    </Modal>
  )
}

export default SettingsModal