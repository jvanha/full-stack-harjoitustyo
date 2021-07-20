const gameReducer = (state = {}, action) => {
  console.log(action)
  switch (action.type) {
    case 'SET_GAME':
      return action.data
    case 'SET_BOARD':
      const board = action.data.board
      return { board, ...state }
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

export const setBoard = (board) => {
  return {
    type: 'SET_BOARD',
    data: board,
  }
}

export default gameReducer