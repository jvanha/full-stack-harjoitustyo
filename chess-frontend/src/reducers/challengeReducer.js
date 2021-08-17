const challengeReducer = (state=null, action) => {
  switch (action.type) {
    case 'SET_CHALLENGE': {
      return action.data
    }
    case 'CLEAR_CHALLENGE': {
      console.log('CLEAR_CHALLENGE')
      return null;
    }
    default:
      return state
  }
}

export const setChallengePending = (id) => {
  return {
    type: 'SET_CHALLENGE',
    data: id,
  }
}

export const clearChallenge = () => {
  return {
    type: 'CLEAR_CHALLENGE',
  }
}

export default challengeReducer