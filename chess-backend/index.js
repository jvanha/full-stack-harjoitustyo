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
    value: String!
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
    hah: String!
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
  }
  type Subscription {
    moveMade(playerId: String): Move
    userLoggedIn: User
    userLoggedOut: User
  }

`

const resolvers = {
  Query: {
    allUsers: () => usersLoggedIn,
    
    hah: () => 'hah'
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
      usersLoggedIn = [...usersLoggedIn, user]
      console.log(usersLoggedIn)
      const userForPublish = {
        username: user.username,
        id_: user._id
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
      usersLoggedIn = userLoggedIn.filter(user => user.id !== currentUser.id)
      pubsub.publish('USER_LOGGED_OUT', { userLoggedIn: currentUser})
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
    userLoggedIn: {
      subscribe: () => pubsub.asyncIterator(['USER_LOGGED_IN'])
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
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at`, url)
  console.log('Subscriptions ready at', subscriptionsUrl)
})
