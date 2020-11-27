const { ApolloServer, gql, PubSub, withFilter, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const pubsub = new PubSub()
const jwt = require('jsonwebtoken')
const User = require('./models/user')

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
  }

  type Mutation {
    createUser(
      username: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
    makeAMove(
      opponentId: String!
      from: Int!
      to: Int!
      ): Move
  }
  type Subscription {
    moveMade(playerId: String): Move
    userLoggedIn: User
  }

`

const resolvers = {
  Query: {
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
      
      pubsub.publish('USER_LOGGED_IN', { userLoggedIn: user})
      const userForToken = {
        username: user.username,
        id:  user._id
      }
      return { value: jwt.sign(userForToken, JWT_SECRET)}
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
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
