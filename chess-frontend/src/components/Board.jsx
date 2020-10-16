import React from 'react'

const MySquare = ({ color }) => {
  console.log('square')
  return (
    <div style={{ backgroundColor: color}}>
      t
    </div>
  )
}


const Board = ({ squares }) => {
   
  return (
    <div>
      <p>toimii</p>
      {squares.map(element => {
        console.log(element)
        return (
          <div key={element[0][0]}>
          {element.map(e => {
            console.log(e)
            return (
              <div key={e[1]} className={{display: 'flex', flexDirection: 'row'}}>
                <MySquare color={(e[0]-e[1])%2===0 ? 'white' : 'black'}/>
              </div>
            )
          })}
          </div>
        ) 
      })
    }
    </div>
  )
}

export default Board