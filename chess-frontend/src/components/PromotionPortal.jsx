import React from 'react'
import { Portal, Segment } from 'semantic-ui-react'

const imgStyle = {
  marginTop: 5, 
  height: '90%',
  width: '90%',
}

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
        <img style={imgStyle} src={`${color}${'Q'}.png`} alt='' />
      </div>
      <div onClick={()=>select('N')}>
      <img style={imgStyle} src={`${color}${'N'}.png`} alt='' />
      </div>
      <div onClick={()=>select('B')}>
      <img style={imgStyle} src={`${color}${'B'}.png`} alt='' />
      </div>
      <div onClick={()=>select('R')}>
      <img style={imgStyle} src={`${color}${'R'}.png`} alt='' />
      </div>

      
    </Segment>
  </Portal>

   )
}
export default PromotionPortal