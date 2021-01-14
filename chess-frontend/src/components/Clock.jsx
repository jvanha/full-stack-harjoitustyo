import React from 'react'
const clockStyle = {
}

const trimTime = (n) => {
  if (n<10) {
    if (n<0) return "00"
    return '0' + n
  }
  return n
}
const Clock = ({ time }) => {
  const minutes = trimTime(Math.floor(time/60))
  const seconds = trimTime(time%60)
  return (
    <div style={clockStyle}>
      {`${minutes}:${seconds}`}
    </div>
  )
}

export default Clock