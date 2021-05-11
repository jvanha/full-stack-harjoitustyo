import React, { useState } from 'react'
import { Button, Checkbox, Segment } from 'semantic-ui-react'

const Settings = () => {
  const [autoQueen, setAutoQueen ] = useState(false)
  const handleChange = () => {
    console.log(autoQueen)
    setAutoQueen(!autoQueen)
  }
  return (
    <Segment placeholder>
      <Segment.Checkbox
          checked={autoQueen}
          label='Always promote to queen'
          toggle
          onChange={handleChange}
        />
      <Segment.Inline>
        <Button toggle>Save</Button>
      </Segment.Inline>
      
    </Segment>
  )
}

export default Settings