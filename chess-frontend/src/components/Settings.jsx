import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Form } from 'semantic-ui-react'
import { saveGameSettings } from '../localStorageService'

const Settings = ({settings, close, setSettings}) => {
  const [autoQueen, setAutoQueen] = useState(false)
  const [showLegalMoves, setShowLegalMoves] = useState(false)

  useEffect(() => {
    console.log('settings',settings)
    if (settings) {
      setAutoQueen(settings.autoQueen)
      setShowLegalMoves(settings.showLegalMoves)
    }
  },[settings])
  
  const submit = (event) => {
    event.preventDefault()
    const settings = { autoQueen, showLegalMoves }
    saveGameSettings(settings)
    setSettings(settings)
    close()
  }

  return (
    <Form onSubmit={submit}>
      <Form.Field>
        <Checkbox
          checked={autoQueen}
          label='Always promote to queen'
          toggle
          onChange={() => setAutoQueen(!autoQueen)}
        />
      </Form.Field>
      <Form.Field>
        <Checkbox
          checked={showLegalMoves}
          label='Show legal moves'
          toggle
          onChange={() => setShowLegalMoves(!showLegalMoves)}
        />
      </Form.Field>
      
      <Button positive submit>Save</Button>
    </Form>
    
  )
}

export default Settings