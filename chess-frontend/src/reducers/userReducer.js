const userReducer = (state=null, action) => {
  switch (action.type) {
    case 'SET_USER':
      return action.data
    }
}

export const setUser = (user) => {
  return {
    type: 'SET_USER',
    data: user
  }
}

export default userReducer