const { ApolloServer, gql, PubSub, withFilter, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const pubsub = new PubSub()
const jwt = require('jsonwebtoken')
const User = require('./models/user')

let usersLoggedIn = []


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

  type Move {
    from: Int!
    to: Int!
  }

  type Query {
    me: User
    allUsers: [User]
  }

  type Mutation {
    createUser(
      username: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
    logout: User
    makeAMove(
      opponentId: String!
      from: Int!
      to: Int!
      ): Move
    challenge(
      username: String!
      id: String!
    ): User!
  }
  type Subscription {
    moveMade(playerId: String): Move
    userLoggedIn: User
    userLoggedOut: User
    challengeIssued(playerId: String): User
  }

`
const resolvers = {
  Query: {
    allUsers: () => usersLoggedIn,
    
    me: async (root, args, context) => {
      console.log('context.currentUser',context.currentUser)
      return context.currentUser
    }
  },
  Mutation: {
    createUser: (root, args) => {
      const user = new User({ ...args })
      return user.save()
    },
    login: async (root, args) => {
      const { username, password } = args
      const user = await User.findOne({ username })
      if (!user || password != '1234') {
        throw new UserInputError('Bad credentials')
      }
      if (!usersLoggedIn.map(user => user.id).includes(user.id))
        usersLoggedIn = [...usersLoggedIn, user]
      console.log(usersLoggedIn)
      const userForPublish = {
        username: user.username,
        id: user._id
      }
      pubsub.publish('USER_LOGGED_IN', { userLoggedIn: userForPublish})
      const userForToken = {
        username: user.username,
        id:  user._id
      }
      return { value: jwt.sign(userForToken, JWT_SECRET)}
    },
    logout: async (root, args, context) => {
      const currentUser = context.currentUser
      console.log(currentUser,'logged out')
      usersLoggedIn = usersLoggedIn.filter(user => user.id !== currentUser.id)
      usersLoggedIn.filter(user => user.id !== currentUser.id)
      //const user = {
      //  username: currentUser.username,
      //  id: currentUser._id
      //}
      pubsub.publish('USER_LOGGED_OUT', { userLoggedOut: currentUser})
      return currentUser
    },

    challenge: (root, args) => {
      console.log('challenge resolver')
      console.log('args',args)
      const payload = { challengeIssued: args }
      pubsub.publish('CHALLENGE_ISSUED', payload)
      return args
    },

    makeAMove: (root, args) => {
      const { opponentId, from, to } = args
      const move = { from, to }
      pubsub.publish('MOVE_MADE', { opponentId, moveMade: move })
      return move
    },
  },
  Subscription: {
    moveMade: {
      subscribe: withFilter(() => pubsub.asyncIterator('MOVE_MADE'), (payload, variables) => {
        return payload.opponentId === variables.playerId
      })
    },
    challengeIssued: {
      subscribe: withFilter(() => pubsub.asyncIterator(['CHALLENGE_ISSUED']), (payload, variables) => {
        console.log('challenge issued')
        console.log('payload', payload)
        console.log('variables', variables)
        return payload.challengeIssued.id === variables.playerId
      })
    },
    userLoggedIn: {
      subscribe: () => {
        return pubsub.asyncIterator(['USER_LOGGED_IN'])
      }
    },
    userLoggedOut: {
      subscribe: () => pubsub.asyncIterator(['USER_LOGGED_OUT'])
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
      console.log('currentUser',currentUser)
      return { 
        currentUser: {
          username: currentUser.username,
          id: currentUser._id
      
        }
      }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at`, url)
  console.log('Subscriptions ready at', subscriptionsUrl)
})
