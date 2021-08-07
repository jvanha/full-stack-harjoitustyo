let initBoard = Array(64)
for (let i=0; i<64; i++) {
  initBoard[i] = [i, null]
}
initBoard[0] = [0, { type: 'R', color: 'black' }]
initBoard[1] = [1, { type: 'N', color: 'black' }]
initBoard[2] = [2, { type: 'B', color: 'black' }]
initBoard[3] = [3, { type: 'Q', color: 'black' }]
initBoard[4] = [4, { type: 'K', color: 'black' }]
initBoard[5] = [5, { type: 'B', color: 'black' }]
initBoard[6] = [6, { type: 'N', color: 'black' }]
initBoard[7] = [7, { type: 'R', color: 'black' }]
initBoard[8] = [8, { type: 'P', color: 'black' }]
initBoard[9] = [9, { type: 'P', color: 'black' }]
initBoard[10] = [10, { type: 'P', color: 'black' }]
initBoard[11] = [11, { type: 'P', color: 'black' }]
initBoard[12] = [12, { type: 'P', color: 'black' }]
initBoard[13] = [13, { type: 'P', color: 'black' }]
initBoard[14] = [14, { type: 'P', color: 'black' }]
initBoard[15] = [15, { type: 'P', color: 'black' }]

initBoard[48] = [48, { type: 'P', color: 'white' }]
initBoard[49] = [49, { type: 'P', color: 'white' }]
initBoard[50] = [50, { type: 'P', color: 'white' }]
initBoard[51] = [51, { type: 'P', color: 'white' }]
initBoard[52] = [52, { type: 'P', color: 'white' }]
initBoard[53] = [53, { type: 'P', color: 'white' }]
initBoard[54] = [54, { type: 'P', color: 'white' }]
initBoard[55] = [55, { type: 'P', color: 'white' }]
initBoard[56] = [56, { type: 'R', color: 'white' }]
initBoard[57] = [57, { type: 'N', color: 'white' }]
initBoard[58] = [58, { type: 'B', color: 'white' }]
initBoard[59] = [59, { type: 'Q', color: 'white' }]
initBoard[60] = [60, { type: 'K', color: 'white' }]
initBoard[61] = [61, { type: 'B', color: 'white' }]
initBoard[62] = [62, { type: 'N', color: 'white' }]
initBoard[63] = [63, { type: 'R', color: 'white' }]

const initialState = {
  color: 'white',
  whiteClock: 0,
  blackClock: 0,
  board: initBoard,
  opponent: null,
  moves: [
    {from: 48, to: 40, time: 10, promotion: null, takenPiece: null},
    {from: 1, to: 18, time: 11, promotion: null, takenPiece: null},
    {from: 40, to: 32, time: 12, promotion: null, takenPiece: null},
    {from: 0, to: 1, time: 13, promotion: null, takenPiece: null},
    {from: 32, to: 24, time: 15, promotion: null, takenPiece: null},
    {from: 18, to: 24, time: 11, promotion: null, takenPiece: { type: 'P', color: 'white' }},
  ],
  counter: 0
}

const replayReducer = (state = initialState, action) => {
  console.log(action)
  const { board, color, moves, counter, ...rest } = state
  console.log('moves',moves)
  switch (action.type) {
    case 'SET_REPLAY':
      return action.data
    case 'SET_BOARD':
      return { 
        board: action.data.board,
        ...state 
      }
    case 'NEXT': {
      
      if (!moves || counter === moves.length) return state
      const { from, to, time, promotion } = moves[counter]
      const squareFrom = board[from]
      console.log('squareFrom', squareFrom)
      const newBoard = board.map(square => {
        if (square[0] === from) return [square[0], null]
        if (square[0] === to) {
          if (promotion) return [square[0], { type: promotion, color}]
          return [square[0], {type: squareFrom[1].type, color}]
        }
        return square
      })
      console.log('newBoard', newBoard)
      return {
        ...state,
        board: newBoard,
        color: color==='white' ? 'black': 'white',
        counter: counter + 1,
        
      }
    }
    case 'PREVIOUS': {
      if (!moves || counter === 0) return state
      const { from, to, time, promotion, takenPiece } = moves[counter - 1]
      const activeColor = color==='white' ? 'black': 'white'
      const squareTo = board[to]
      console.log('squareTo', squareTo)
      const newBoard = board.map(square => {
        if (square[0] === to) return [square[0], takenPiece]
        if (square[0] === from) {
          if (promotion) return [square[0], { type: 'P', color: activeColor}]
          return [square[0], { type: squareTo[1].type, color: activeColor}]
        }
        return square
      })
      return {
        ...state,
        board: newBoard,
        color: activeColor,
        counter: counter - 1,
      }
    }
    default:
      return state
  }
}

export const setReplayState = (newReplayState) =>{
  return {
    type: 'SET_REPLAY',
    data: {...initialState, ...newReplayState},
  }
}

export const setReplayBoard = (board) => {
  return {
    type: 'SET_BOARD',
    data: board,
  }
}

export const nextPos = () => {
  console.log('nextPos')
  return {
    type: 'NEXT',
    data: null
  }
}

export const prevPos = () => {
  console.log('nextPos')
  return {
    type: 'PREVIOUS',
    data: null
  }
}

export default replayReducer