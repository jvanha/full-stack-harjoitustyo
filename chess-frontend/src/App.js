import React from 'react';
import Board from './components/Board'
const squares = [...Array(64).keys()] 
function App() {
  return (
    <div>
      <Board squares={squares}/>
    </div>
  );
}

export default App;
