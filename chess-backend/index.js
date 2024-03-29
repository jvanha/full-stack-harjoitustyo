const { ApolloServer, gql, PubSub, withFilter, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('./models/user')
const Game = require('./models/game')
const Message = require('./models/message')
const bcrypt = require('bcrypt')
const stockfish = require('stockfish')
const game = require('./models/game')
const user = require('./models/user')

const pubsub = new PubSub()
let usersLoggedIn = []
let engines = []
let bestMoves = []
const onMessage = (engine, message) => {
  console.log(message)
  if (message.startsWith('uciok')) engine.engine.postMessage('isready')
  if (message.startsWith('readyok')) {
    engine.engine.postMessage('setoption name Skill Level value 1')
  }
  if (message.startsWith('bestmove')) {
    bestMoves = bestMoves.map(bestMove => bestMove.id == engine.id ? {id: bestMove.id, bestMove: message.substring(9,13)} : bestMove)
  } 

}

const getbestmove = (id) => {
  return new Promise((resolve, reject) =>{
    setTimeout(()=> {
      let move
      const bestMove = bestMoves.find(bestMove => bestMove.id == id)
      console.log('BEST MOVE', bestMove)
      console.log('BEST MOVES', bestMoves)
      if (bestMove && bestMove.bestMove) {
        move = bestMove.bestMove
        bestMoves = bestMoves.map(bestMove => bestMove.id == id ? {bestMove: null, ...bestMove} : bestMove)
      }
      console.log('move',move)
      resolve(move)
    },3000)
    
  })
}

const JWT_SECRET = 'suusialas'
const MONGODB_URI = 'mongodb+srv://fullstack:poalkj@cluster0.j1rcu.mongodb.net/chess?retryWrites=true&w=majority'

console.log('connecting to', MONGODB_URI)
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB', error.message)

  })

const typeDefs = gql`
  type User {
    username: String!
    id: ID!
    registrationDate: String
    games: [Game]
  }
  type Opponents {
    challenger: User!
    challenged: User! 
  }
  type Challenge {
    opponents: Opponents!
    timeControl: Int!
    color: String!
  }
  type Token {
    value: String
    expiresIn: Int
  }
  type Piece {
    type: String!
    color: String!
  }
  type Square {
    position: Int!
    piece: Piece
  }
  type Message {
    id: String 
    writer: User!
    content: String
    date: String
  }
  type Move {
    from: Int!
    to: Int!
    time: Int
    promotion: String
    takenPiece: Piece
    enPassant: Boolean
  }
  type MoveUnit {
    userId: String
    move: Move!
  }
  type Game {
    id: ID!
    black: User!
    white: User!
    winner: String!
    moves: [Move]
    date: String
  }
  
  type Query {
    me: User
    allUsers: [User]
    allMessages: [Message]
    game(id: String!): Game
    user(id: String!): User
    
  }
  
  type Mutation {
    createUser(
      username: String!
      password: String!
    ): User
    
    login(
      username: String!
      password: String!
    ): Token
    logout: User
    
    makeAMove(
      userId: String!
      from: Int!
      to: Int!
      time: Int!
      promotion: String
    ): Move

    resign(
      userId: String!
    ): String

    challenge(
      username: String!
      id: String!
      timeControl: Int
      color: String
    ): Challenge!
    
    acceptChallenge(
      username: String!
      id: String!
      timeControl: Int
      color: String
    ): Challenge!
    
    cancelChallenge(
      username: String!
      id: String!
    ): User!
    
    declineChallenge(
      username: String!
      id: String!
    ): User!
    
    addMessage(
      message: String
    ): Message!

    createGame(input: CreateGameInput): Game
    getComputerMove(fen: String): Move
  }

  type Subscription {
    moveMade(opponentId: String): MoveUnit
    userLoggedIn: User
    userLoggedOut: User
    challengeIssued(playerId: String): Challenge
    challengeCancelled(playerId: String): Opponents
    challengeAccepted(playerId: String): Challenge
    challengeDeclined(playerId: String): Opponents
    messageAdded: Message
    opponentResigned(opponentId: String): String
    gameCreated(playerId: String): Game
  }

  input CreateGameInput {
    whiteId: String!
    blackId: String!
    winner: String
    moves: [MoveInput]!
  }
  input MoveInput {
    from: Int
    to: Int
    time: Int
    promotion: String
    takenPiece: PieceInput
    enPassant: Boolean

  }
  input PieceInput {
    type: String!
    color: String!
  }

`


const resolvers = {
  Query: {
    allUsers: () => {
      console.log('allUsers', usersLoggedIn.map(user=>user.username))
      if (!usersLoggedIn) return []
      return usersLoggedIn
    },
    me: async (root, args, context) => {
      return context.currentUser
    },
    allMessages: async () => {
      const messages = await Message.find().sort({_id:-1}).limit(10).populate('writer')
      return messages.reverse()
    },
    game: async (root, args) => {
      const id = args.id
      return game.findById(id)
    },
    user: async (root, args) => {
      const id = args.id
      const u = await user.findById(id).populate({
        path: 'games',
        populate: ['black', 'white']
      })
      console.log('user',u)
      return u
    }
  },
  Mutation: {
    createUser: async (root, args) => {
      console.log('create user args', args)
      const passwordHash = await bcrypt.hash(args.password, 10)
      const date = new Date
      const user = new User({
        username: args.username,
        passwordHash,
        registrationDate: date.toDateString()
      })
      return user.save()
    },
    createGame: async (root, args) => {
      console.log('createGame args', args)
      console.log()
      const { blackId, whiteId, winner, moves } = args.input
      const white = await User.findById(whiteId)
      const black = await User.findById(blackId)
      const date = new Date
      const newGame = {
        black: blackId,
        white: whiteId,
        winner,
        moves,
        date: date.toDateString()
      }
      const game = new Game({ ...newGame })
      white.games = white.games.concat(game._id)
      await white.save()
      black.games = black.games.concat(game._id)
      await black.save()
      const savedGame = await game.save()
      const populatedGame = await Game.findById(game._id).populate(['black', 'white'])
      const payload = { gameCreated: populatedGame }
      pubsub.publish('GAME_CREATED', payload)

      return savedGame
    },
    login: async (root, args) => {
      const { username, password } = args
      const user = await User.findOne({ username })
      if (!user || !await bcrypt.compare(password, user.passwordHash)) {
        throw new UserInputError('Bad credentials')
      }

      if (!usersLoggedIn.map(user => user._id).includes(user._id)) //HUOM!
        usersLoggedIn = [...usersLoggedIn, user]
      const userForPublish = {
        username: user.username,
        id: user._id
      }
      pubsub.publish('USER_LOGGED_IN', { userLoggedIn: userForPublish})
      const userForToken = {
        username: user.username,
        id:  user._id
      }
      console.log('userLoggedIn',user.username)
      console.log('usersLoggedIn',usersLoggedIn.map(user=>user.username))

      const newEngine = stockfish()
      const engine = {
        id: user._id,
        engine: newEngine,
      }

      newEngine.onmessage = (message) => onMessage(engine,message)
      newEngine.postMessage('uci')
      engines.filter(engine => engine.id !== user._id) 
      engines.push(engine)
      
      const bestMove = {
        id: user._id,
        bestMove: null
      }
      bestMoves.filter(bestMove => bestMove.id !== user._id)
      bestMoves.push(bestMove)
      const token = { 
        value: jwt.sign(userForToken, JWT_SECRET),
        expiresIn: 60*60
      }
      console.log('token', token)
      return token
    },
    logout: (root, args, context) => {
      const currentUser = context.currentUser
      console.log(currentUser.username,'logged out')
      usersLoggedIn = usersLoggedIn.filter(user => user.id !== currentUser.id)
      console.log('engines', engines)
      const currentEngine = engines.find(engine => engine.id == currentUser.id)
      console.log('currentEngine', currentEngine)
      if (currentEngine) currentEngine.engine.postMessage("quit")
      engines =  engines.filter(engine => engine.id.toString() !== currentUser.id)
      bestMoves = bestMoves.filter(bestMove => bestMove.id.toString() !== currentUser.id)
      console.log('engines', engines)
      console.log('bestMoves', bestMoves)
      console.log()
      pubsub.publish('USER_LOGGED_OUT', { userLoggedOut: currentUser})
      return currentUser
    },
    challenge: (root, args, context) => {
      console.log('challenge resolver')
      console.log('args',args)
      const currentUser = context.currentUser
      const challenger = {
        username: currentUser.username,
        id: currentUser.id,
      }
      const { username, id, timeControl, color } = args;
      const challenge = {
        opponents: { 
          challenger,
          challenged: { username, id },
        },
        timeControl,
        color,
      }
      const payload = { challengeIssued: { ...challenge } }
      pubsub.publish('CHALLENGE_ISSUED', payload)
      return challenge
    },
    cancelChallenge: (rootm, args, context) => {
      console.log('cancelChallenge resolver')
      console.log('args',args)
      console.log()
      const payload = {
        challengeCancelled: {
          challenger: context.currentUser,
          challenged: args,
        }
      }
      pubsub.publish('CHALLENGE_CANCELLED', payload)
      return args
      
    },
    acceptChallenge: (root, args, context) => {
      console.log('acceptChallenge resolver')
      console.log('args', args)
      console.log()
      const currentUser = context.currentUser
      const challenged = {
        username: currentUser.username,
        id: currentUser.id,
      }
      const { username, id, timeControl, color } = args;
      const challenge = {
        opponents: { 
          challenger: { username, id },
          challenged,
        },
        timeControl,
        color,
      }
      const payload = { challengeAccepted: {...challenge } }
      console.log('payload', payload)
      pubsub.publish('CHALLENGE_ACCEPTED', payload)
      return challenge
    },
    declineChallenge: (root, args, context) => {
      console.log('declineChallenge resolver')
      console.log('args', args)
      console.log()
      const payload = { 
        challengeDeclined: {
          challenger: args,
          challenged: context.currentUser
        }}
      pubsub.publish('CHALLENGE_DECLINED', payload)
      return args
    },
    makeAMove: (root, args) => {
      const { userId, from, to, time, promotion } = args
      const move = { from, to, time, promotion}
      const payload = {
        moveMade: { userId, move }
      }
      console.log('makeAMove resolver')
      console.log('payload', payload)
      pubsub.publish('MOVE_MADE', payload)
      return move
    },
    resign: (root, args) => {
      console.log(args, 'resigned')
      const opponentId = args.userId
      const payload = { opponentResigned: opponentId }
      console.log('resign payload', payload)
      console.log()
      pubsub.publish('OPPONENT_RESIGNED',payload)
      return args.userId
    },
    addMessage: async (root, args, context) => {
      const writer = context.currentUser.id
      const content = args.message
      const date = new Date
      const message = new Message({
        writer,
        content,
        date: date.toString()
      })
      
      const savedMessage = await message.save()
      const finalMessage = await Message.findById(savedMessage.id).populate('writer')
      const payload = {
        messageAdded: { finalMessage }
      }
      console.log('savedMessage', savedMessage)
      console.log('payload', payload)
      console.log()
      pubsub.publish('MESSAGE_ADDED', { messageAdded: finalMessage })
      return finalMessage
    },
    getComputerMove: async (root, args, contex) => {
      const currentUser = contex.currentUser 
      console.log('args', args)
      const fen = args.fen
      console.log('fen:',fen)
      const engine = engines.find(e => e.id == currentUser.id)
      console.log(engine)
      
      engine.engine.postMessage(`position fen ${fen}`)
      engine.engine.postMessage(`go`)
      
      const fenMove = await getbestmove(currentUser.id)
      console.log('fenMove', fenMove)
      const from = (8-parseInt(fenMove[1]))*8 + fenMove.charCodeAt(0) - 97
      const to = (8-parseInt(fenMove[3]))*8 + fenMove.charCodeAt(2) - 97
      const move = { from, to }
      
      
      return move
    },
  },
  Subscription: {
    moveMade: {
      subscribe: withFilter(() => pubsub.asyncIterator(['MOVE_MADE']), (payload, variables) => {
        console.log('move made')
        console.log('payload', payload)
        console.log('variables', variables)
        console.log()
        return payload.moveMade.userId === variables.opponentId
      })
    },
    challengeIssued: {
      subscribe: withFilter(() => pubsub.asyncIterator(['CHALLENGE_ISSUED']), (payload, variables) => {
        console.log('challenge issued')
        console.log('payload', payload)
        console.log('variables', variables)
        console.log()
        return payload.challengeIssued.opponents.challenged.id === variables.playerId
      })
    },
    challengeCancelled: {
      subscribe: withFilter(() => pubsub.asyncIterator(['CHALLENGE_CANCELLED']), (payload, variables) => {
        console.log('challenge cancelled')
        console.log('payload', payload)
        console.log('variables', variables)
        console.log()
        return payload.challengeCancelled.challenged.id === variables.playerId
      })
    },
    challengeAccepted: {
      subscribe: withFilter(() => pubsub.asyncIterator(['CHALLENGE_ACCEPTED']), (payload, variables) => {
        console.log('challenge accepted')
        console.log('payload', payload)
        console.log('variables', variables)
        console.log()
        return payload.challengeAccepted.opponents.challenger.id === variables.playerId
      })
    },
    challengeDeclined: {
      subscribe: withFilter(() => pubsub.asyncIterator(['CHALLENGE_DECLINED']), (payload, variables) => {
        console.log('challenge declined')
        console.log('payload', payload)
        console.log('variables', variables)
        console.log()
        return payload.challengeDeclined.challenger.id === variables.playerId
      })
    },
    userLoggedIn: {
      subscribe: () => {
        return pubsub.asyncIterator(['USER_LOGGED_IN'])
      }
    },
    userLoggedOut: {
      subscribe: () => pubsub.asyncIterator(['USER_LOGGED_OUT'])
    },
    messageAdded: {
      subscribe: () => {
        return pubsub.asyncIterator(['MESSAGE_ADDED'])
      }
    },
    opponentResigned: {
      subscribe: withFilter(() => pubsub.asyncIterator(['OPPONENT_RESIGNED']), (payload, variables) => {
        console.log('opponent resigned')
        console.log('payload', payload)
        console.log('variables', variables)
        console.log()
        return payload.opponentResigned === variables.opponentId
      })
    },
    gameCreated: {
      subscribe: withFilter(() => pubsub.asyncIterator(['GAME_CREATED']), (payload, variables) => {
        console.log('game created')
        console.log('payload', payload)
        console.log('variables', variables)
        console.log()
        const { black, white, winner } = payload.gameCreated
        const opponent = winner === '' ? black : (winner==='white'?black:white)
        console.log('opponent', opponent.toString())
        return opponent._id.toString() === variables.playerId
      })
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null

    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id)
        .populate({
          path: 'games',
          populate: ['black', 'white']
        })
      console.log('currentUser',currentUser)
      return { 
        currentUser: {
          username: currentUser.username,
          id: currentUser._id.toString(),
          registrationDate: currentUser.registrationDate,
          games: currentUser.games
        }
      }
    }
  },
})
const PORT = process.env.PORT || 4000
server.listen(PORT).then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at`, url)
  console.log('Subscriptions ready at', subscriptionsUrl)
})
