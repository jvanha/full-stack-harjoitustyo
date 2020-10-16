import React from 'react';
import Board from './components/Board'
const squares = [
  [[1,1],[1,2],[1,3]],
  [[2,1],[2,2],[2,3]],
  [[3,1],[3,2],[3,3]],
  
] 
function App() {
  return (
    <div>
      <Board squares={squares}/>
    </div>
  );
}

export default App;
