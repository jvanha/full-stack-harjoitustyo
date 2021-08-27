const userReducer = (state={user: null, token: null}, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {...state, user: action.data}
    case 'CLEAR_USER':
      return {user: null, token: null}
    default:
      return state
    }
}

export const setUserRedux = (user) => {
  return {
    type: 'SET_USER',
    data: user
  }
}

export const clearUser = () => {
  return {
    type: 'CLEAR_USER',
  }
}

export default userReducer