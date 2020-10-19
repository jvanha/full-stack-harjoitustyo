import React from 'react';
import Board from './components/Board'
let squares = Array(64)//[...Array(64).keys()] 
let i
for (i=0; i<64; i++) {
  squares[i] = [i, null]
}
squares[6] = [6, { type: 'P', color: 'white'}]
console.log(squares)

function App() {
  return (
    <div>
      <Board squares={squares}/>
    </div>
  );
}

export default App;
