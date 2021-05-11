import React from 'react'
import { Portal, Segment } from 'semantic-ui-react'
import Piece from './Piece'

const PromotionPortal = ({ open, handleClose, color, setPromotion }) => {
  const select = (type) => {
    setPromotion(type)
    handleClose()
  }
  return (
    <Portal onClose={handleClose} open={open}>
      <Segment
        style={{
          left: '40%',
          position: 'fixed',
          top: '10%',
          zIndex: 1000,
        }}
      >
      <div onClick={()=>select('Q')}>
      <Piece piece={{ type: 'Q', color}}/>
      </div>
      <div onClick={()=>select('N')}>
      <Piece piece={{ type: 'N', color}}/>
      </div>
      <div onClick={()=>select('B')}>
      <Piece piece={{ type: 'B', color}}/>
      </div>
      <div onClick={()=>select('R')}>
      <Piece piece={{ type: 'R', color}}/>
      </div>

      
    </Segment>
  </Portal>

   )
}
export default PromotionPortal