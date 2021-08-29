const boardReducer = (state = { movingPiece: null }, action) => {
  switch (action.type) {
    case 'SET_MOVING_PIECE': {
      return { ...state, movingPiece: action.data }
    }
    default:
      return state
  }
}

export const setMovingPiece = (data) => {
  return {
    type: 'SET_MOVING_PIECE',
    data
  }
}
export default boardReducer