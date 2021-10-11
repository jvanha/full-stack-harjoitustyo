import { deleteGameState } from "../localStorageService"
import { setMovingPiece } from "./boardReducer"

let testBoard = Array(64)
for (let i=0; i<64; i++) {
  testBoard[i] = [i, null]
}

testBoard[0] = [0, { type: 'K', color: 'black' }]
testBoard[60] = [60, { type: 'K', color: 'white' }]
testBoard[62] = [62, { type: 'Q', color: 'white' }]

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
  gameOn: false,
  myColor: 'white',
  playerToMove: null,
  clock: 0,
  opponentsClock: 0,
  //board: initBoard,
  board: testBoard,
  opponent: null,
  longCastleBlack: true,
  longCastleWhite: true,
  shortCastleBlack: true,
  shortCastleWhite: true,
  enPassant: null,
  clockRunning: false,
  opponentsClockRunning: false,
  moves: [],
}
const checkIfCastled = (playerToMove, to, board, longCastleBlack, longCastleWhite, shortCastleBlack, shortCastleWhite) => {
  if (playerToMove === 'white') {
    if (longCastleWhite && to === 58) {
      return board.map(square => {
        if (square[0] === 59) return [59, { type: 'R', color: 'white'}]
        if (square[0] === 56) return [56, null]
        return square
      })
    }
    if (shortCastleWhite && to === 62) {
      return board.map(square => {
        if (square[0] === 61) return [61, { type: 'R', color: 'white'}]
        if (square[0] === 63) return [63, null]
        return square
      })
    }
  }
  if (playerToMove === 'black') {
    if (longCastleBlack && to === 2) {
      return board.map(square => {
        if (square[0] === 3) return [3, { type: 'R', color: 'black'}]
        if (square[0] === 0) return [0, null]
        return square
      }) 
    }
    if (shortCastleBlack && to === 6) {
      return board.map(square => {
        if (square[0] === 5) return [5, { type: 'R', color: 'black'}]
        if (square[0] === 7) return [7, null]
        return square
      })
    }
  }
  return board
}
const checkEnPassant = (to, from) => {
  console.log('check en passant', Math.abs(to-from))
  if (Math.abs(to-from) == 16) return Math.abs((to+from)/2)
  return null
}
const gameReducer = (state = initialState, action) => {
  console.log('gameReducer',action)
  switch (action.type) {
    case 'INIT_GAME': {
      return {
        ...initialState,
        ...action.data,
        gameOn: true,
        playerToMove: 'white',
      }
    }
    case 'SET_GAME':
      return action.data
    case 'SET_BOARD': {
      const board = action.data.board
      return { board, ...state }
    }
    case 'UPDATE_GAME': {
      return {...state, ...action.data}
    }
    case 'MOVE_PIECE': {
      const {
        board,
        playerToMove,
        myColor,
        enPassant,
        longCastleBlack,
        shortCastleBlack,
        longCastleWhite,
        shortCastleWhite,
      } = state

      const { from, to, time, promotion } = action.data
      const promoted = state.board[from][1].type === 'P' && (Math.floor(to/8) === 0 || Math.floor(to/8) === 7)
      const myTurn = playerToMove === myColor

      const squareFrom = board[from]
      const type = squareFrom[1].type
      const nextPlayerToMove = playerToMove === 'white' ? 'black' : 'white'
      const newMove = {
        ...action.data,
        time,
        promotion: promoted ? promotion : null, 
        takenPiece: to === enPassant ? board[Math.floor(from/8)*8 + to%8][1] : board[to][1],
        enPassant: to === enPassant
      }
      const newBoard = board.map(square => {
        if (square[0] === to) {
          if (type === 'P' && (square[0] < 8 || square[0] > 55))
            return [to, { type: promotion, color: playerToMove }] 
          return [to, squareFrom[1]]
        }
        if (square[0] === from) return [from, null]
        if (to === enPassant && square[0] === Math.floor(from/8)*8 + to%8)
          return [square[0], null]
        return square
      })

      if (type==='K') {
        return {
          ...state,
          moves: [
            ...state.moves,
            newMove,
          ],
          board: checkIfCastled(playerToMove, to, newBoard, longCastleBlack, longCastleWhite, shortCastleBlack, shortCastleWhite),
          longCastleBlack: playerToMove === 'black' ? false : longCastleBlack,
          shortCastleBlack: playerToMove === 'black' ? false : shortCastleBlack,
          longCastleWhite: playerToMove === 'white' ? false : longCastleBlack,
          shortCastleWhite: playerToMove === 'white' ? false : shortCastleBlack,
          opponentsClockRunning: myTurn,
          clockRunning: !myTurn,
          enPassant: null,
          playerToMove: nextPlayerToMove,
        }
      }
      if (type === 'R') {
        return {
          ...state,
          moves: [
            ...state.moves,
            newMove,
          ],
          board: newBoard,
          longCastleBlack: playerToMove === 'black' && squareFrom[0] === 0 ? false : longCastleBlack,
          shortCastleBlack: playerToMove === 'black' && squareFrom[0] === 7 ? false : shortCastleBlack,
          longCastleWhite: playerToMove === 'white' && squareFrom[0] === 56 ? false : longCastleBlack,
          shortCastleWhite: playerToMove === 'white' && squareFrom[0] === 63 ? false : shortCastleBlack,
          opponentsClockRunning: myTurn,
          clockRunning: !myTurn,
          enPassant: null,
          playerToMove: nextPlayerToMove,
        }
      }

      return {
        ...state,
        board: newBoard,
        moves: [
          ...state.moves,
          newMove
        ],
        enPassant: type === 'P' ? checkEnPassant(to, from) : null,
        opponentsClockRunning: myTurn,
        clockRunning: !myTurn,
        playerToMove: nextPlayerToMove,
      }
    }
    case 'DECREMENT_CLOCK': {
      return {...state, clock: state.clock-1}
    }
    case 'END_GAME': {
      return {
        ...state,
        playerToMove: null,
        clockRunning: false,
        opponentsClockRunning: false,
        gameOn: false,
        ...action.data
      }
    }
    default:
      return state
  }
}

export const initGame = (params) => {
  return {
    type: 'INIT_GAME',
    data: params,
  }
}

export const setGameState = (newGameState) =>{
  return {
    type: 'SET_GAME',
    data: newGameState,
  }
}

export const updateGame = (params) => {
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
export const movePieceRedux = (move) => {
  
  return {
    type: 'MOVE_PIECE',
    data: move,
  }
}

export const decrementClock = () => {
  return {
    type: 'DECREMENT_CLOCK',
  }
}

export const endGame = (data) => {
  deleteGameState()
  return {
    type: 'END_GAME',
    data
  }
}

export default gameReducer