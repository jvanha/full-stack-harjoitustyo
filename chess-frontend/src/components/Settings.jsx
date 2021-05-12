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
      <Checkbox
          checked={autoQueen}
          label='Always promote to queen'
          toggle
          onChange={handleChange}
      />
      <Checkbox
          checked={autoQueen}
          label='Always promote to queen'
          toggle
      />
      <Segment.Inline>
        <Button toggle>Save</Button>
      </Segment.Inline>
      
    </Segment>
  )
}

export default Settings