import React from 'react'
import { Portal, Segment } from 'semantic-ui-react'
import Piece from './Piece'

const PromotionPortal = ({ open, handleClose, color, setPromotion }) => {
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
      <div onClick={()=>console.log('CLICK')}>
      <Piece piece={{ type: 'Q', color}}/>
      </div>
      <div onClick={()=>console.log('CLICK')}>
      <Piece piece={{ type: 'N', color}}/>
      </div>
      <div onClick={()=>console.log('CLICK')}>
      <Piece piece={{ type: 'B', color}}/>
      </div>
      <div onClick={()=>console.log('CLICK')}>
      <Piece piece={{ type: 'R', color}}/>
      </div>

      
    </Segment>
  </Portal>

   )
}
export default PromotionPortal