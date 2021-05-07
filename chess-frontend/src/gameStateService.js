export const saveGameState = (state) => {
  console.log('saveGameStete')
  const stateStr = JSON.stringify(state)
  localStorage.setItem('game-state', stateStr)
}

export const loadGameState = () => {
  const state = localStorage.getItem('game-state')
  if (state) return JSON.parse(state)
  return undefined
}