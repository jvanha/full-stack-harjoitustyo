import React from 'react'
import { Modal } from 'semantic-ui-react'
import ChallengeForm from './ChallengeForm'

const ChallengeModal = ({ opponent, close, modalOpen, playComputer }) => {
  return (
    <Modal size='tiny' closeIcon open={modalOpen} onClose={close}>
      <Modal.Header>Challenge {opponent.username}</Modal.Header>
      <Modal.Content>
        <ChallengeForm 
          close={close} 
          opponent={opponent}
          playComputer={playComputer}
        />
      </Modal.Content>
    </Modal>
  )
}
export default ChallengeModal