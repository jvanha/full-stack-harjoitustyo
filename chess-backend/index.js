const { ApolloServer, gql, PubSub, withFilter, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('./models/user')
const Game = require('./models/game')
const bcrypt = require('bcrypt')
const stockfish = require('stockfish')

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
  }
  type Opponents {
    challenger: User!
    challenged: User! 
  }
  type Challenge {
    opponents: Opponents!
    timeControl: Int!
  }
  type Token {
    value: String
  }
  type Piece {
    pieceType: String!
    color: String!
  }
  type Square {
    position: Int!
    piece: Piece
  }
  type Message {
    writer: User!
    content: String!
  }
  type Move {
    from: Int!
    to: Int!
    time: Int
    promotion: String
  }
  type MoveUnit {
    userId: String
    move: Move!
  }
  type Game {
    blackId: String!
    whiteId: String!
    winner: String!
  }

  type Query {
    me: User
    allUsers: [User]
    allMessages: [Message]
    
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
    ): Challenge!
    
    acceptChallenge(
      username: String!
      id: String!
      timeControl: Int
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

    createGame(
      whiteId: String!
      blackId: String!
      winner: String!
    ): Game!
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
      console.log('context.currentUser',context.currentUser)
      return context.currentUser
    },
    allMessages: () => {
      return []
    }
  },
  Mutation: {
    createUser: async (root, args) => {
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
      console.log('createUser args', args)
      const white = await User.findById(args.whiteId)
      const black = await User.findById(args.blackId)
      //console.log('black', black)
      //console.log('white', white)
      const game = new Game({ ...args })
      console.log('white.games', white.games)
      white.games = white.games.concat(game._id)
      await white.save()
      console.log('black.games', black.games)
      black.games = black.games.concat(game._id)
      await black.save()

      return game.save()
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
      engines.push(engine)
      const bestMove = {
        id: user._id,
        bestMove: null
      }
      bestMoves.push(bestMove)
      return { value: jwt.sign(userForToken, JWT_SECRET)}
    },
    logout: (root, args, context) => {
      const currentUser = context.currentUser
      console.log(currentUser.username,'logged out')
      usersLoggedIn = usersLoggedIn.filter(user => user.id !== currentUser.id)
      console.log('engines', engines)
      const currentEngine = engines.find(engine => engine.id == currentUser.id)
      console.log('currentEngine', currentEngine)
      if (currentEngine) currentEngine.engine.postMessage("quit")
      engines =  engines.filter(engine => {
        console.log(engine)
        console.log(engine.id, currentUser.id)
        return engine.id != currentUser.id
      })
      console.log('engines', engines)
      //usersLoggedIn.filter(user => user.id !== currentUser.id)
      pubsub.publish('USER_LOGGED_OUT', { userLoggedOut: currentUser})
      //console.log('usersLoggedIn', usersLoggedIn.map(user => user.username))
      return currentUser
    },
    challenge: (root, args, context) => {
      console.log('challenge resolver')
      console.log('context.currentUser', context.currentUser)
      console.log('args',args)
      const currentUser = context.currentUser
      const challenger = {
        username: currentUser.username,
        id: currentUser.id,
      }
      const { username, id, timeControl } = args;
      const challenge = {
        opponents: { 
          challenger,
          challenged: { username, id },
        },
        timeControl,
      }
      const payload = { challengeIssued: { ...challenge } }
      pubsub.publish('CHALLENGE_ISSUED', payload)
      return challenge
    },
    cancelChallenge: (rootm, args, context) => {
      console.log('cancelChallenge resolver')
      console.log('context.currentUser', context.currentUser)
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
      console.log('context.currentUser',context.currentUser)
      console.log('args', args)
      console.log()
      const currentUser = context.currentUser
      const challenged = {
        username: currentUser.username,
        id: currentUser.id,
      }
      const { username, id, timeControl } = args;
      const challenge = {
        opponents: { 
          challenger: { username, id },
          challenged,
        },
        timeControl,
      }
      const payload = { challengeAccepted: {...challenge } }
      console.log('payload', payload)
      pubsub.publish('CHALLENGE_ACCEPTED', payload)
      return challenge
    },
    declineChallenge: (root, args, context) => {
      console.log('declineChallenge resolver')
      console.log('context.currentUser',context.currentUser)
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
      //console.log('makeAMove resolver')
      //console.log('payload', payload)
      pubsub.publish('MOVE_MADE', payload)
      return move
    },
    resign: (root, args) => {
      console.log(args, 'resigned')
      return args.userId
    },
    addMessage: (root, args, context) => {
      const writer = context.currentUser
      const content = args.message
      const payload = {
        messageAdded: { writer, content }
      }
      console.log('addMessage')
      console.log('payload', payload)
      console.log()
      pubsub.publish('MESSAGE_ADDED', payload)
      return { writer, content }
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
      const from = (8-parseInt(fenMove[1]))*8 + fenMove.charCodeAt(0) - 97
      const to = (8-parseInt(fenMove[3]))*8 + fenMove.charCodeAt(2) - 97
      const move = { from, to }
      
      return move
    },
  },
  Subscription: {
    moveMade: {
      subscribe: withFilter(() => pubsub.asyncIterator(['MOVE_MADE']), (payload, variables) => {
        //console.log('move made')
        //console.log('payload', payload)
        //console.log('variables', variables)
        //console.log()
        return payload.moveMade.userId === variables.opponentId
      })
    },
    challengeIssued: {
      subscribe: withFilter(() => pubsub.asyncIterator(['CHALLENGE_ISSUED']), (payload, variables) => {
        console.log('challenge issued')
        console.log('payload', payload)
        console.log('variables', variables)
        console.log(payload.challengeIssued.opponents.challenged.id === variables.playerId)
        console.log()
        return payload.challengeIssued.opponents.challenged.id === variables.playerId
      })
    },
    challengeCancelled: {
      subscribe: withFilter(() => pubsub.asyncIterator(['CHALLENGE_CANCELLED']), (payload, variables) => {
        console.log('challenge cancelled')
        console.log('payload', payload)
        console.log('variables', variables)
        console.log(payload.challengeCancelled.challenged.id === variables.playerId)
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
      subscribe: () => pubsub.asyncIterator(['MESSAGE_ADDED'])

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
      const currentUser = await User.findById(decodedToken.id)
      //console.log('currentUser',currentUser)
      return { 
        currentUser: {
          username: currentUser.username,
          id: currentUser._id.toString()
        }
      }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at`, url)
  console.log('Subscriptions ready at', subscriptionsUrl)
})
