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
  myColor: 'white',
  playerToMove: null,
  clock: 0,
  opponentsClock: 0,
  board: initBoard,
  opponent: null,
  longCastleBlack: true,
  longCastleWhite: true,
  shortCastleBlack: true,
  shortCastleWhite: true,
  enPassant: null,
  clockRunning: false,
  opponentsClockRunning: false,
}

const gameReducer = (state = initialState, action) => {
  console.log(action)
  switch (action.type) {
    case 'SET_GAME':
      return action.data
    case 'SET_BOARD': {
      const board = action.data.board
      return { board, ...state }
    }
    case 'UPDATE_GAME': {
      return {...state, ...action.data}
    }
    default:
      return state
  }
}

export const setGameState = (newGameState) =>{
  return {
    type: 'SET_GAME',
    data: newGameState,
  }
}

export const updateGameState = (params) => {
  return {
    type: 'UPDATE_GAME',
    data: params
  }
}
export const setBoard = (board) => {
  return {
    type: 'SET_BOARD',
    data: board,
  }
}

export default gameReducer