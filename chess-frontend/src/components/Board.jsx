import React from 'react'

const boardStyle = {
  height: 500,
  width: 500,
  display: 'flex',
  flexWrap: 'wrap'
}

const squareStyle = {
  height: '12.5%',
  width: '12.5%'
}
const MySquare = ({ content }) => {
  //console.log('square', content)
  const index = content[0]

  const color = ((index + Math.floor(index/8))%2)===0 ? 'white' : 'black'
  return (
    <div style={{ ...squareStyle, backgroundColor: color}}>
      {content[0]}
      {content[1] && `${content[1].type}, ${content[1].color}`}
    </div>
  )
}


const Board = ({ squares }) => {
  console.log(squares)
  return (
    <div style={boardStyle}>
      {squares.map(element => (
        <MySquare key={element[0]} content={element}/>  
      ))}
    </div>
  )
}

export default Board