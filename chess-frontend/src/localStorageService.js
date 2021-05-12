export const saveGameState = (state) => {
  console.log('SAVING gameState')
  const stateStr = JSON.stringify(state)
  localStorage.setItem('game-state', stateStr)
}

export const loadGameState = () => {
  console.log('LOADING gameState')
  const state = localStorage.getItem('game-state')
  if (state) return JSON.parse(state)
  return undefined
}

export const deleteGameState = () => {
  console.log('DELETING gameState')
  localStorage.removeItem('game-state')
}

export const saveGameSettings = (settings) => {
  const settingsStr = JSON.stringify(settings)
  localStorage.setItem('game-settings', settingsStr)
}

export const loadGameSettings = () => {
  const settings = localStorage.getItem('game-settings')
  if (settings) return JSON.parse(settings)
  return undefined
}