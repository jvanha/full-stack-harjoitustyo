const { ApolloServer, gql, PubSub, withFilter, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const pubsub = new PubSub()
const jwt = require('jsonwebtoken')
const User = require('./models/user')
const { argsToArgsConfig } = require('graphql/type/definition')

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
  type Opponents {
    challenger: User!
    challenged: User! 
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
  
  type MoveUnit {
    userId: String
    move: Move!
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
      userId: String!
      from: Int!
      to: Int!
    ): Move
    challenge(
      username: String!
      id: String!
    ): User!
    acceptChallenge(
      username: String!
      id: String!
    ): User!
    cancelChallenge(
      username: String!
      id: String!
    ): User!
    declineChallenge(
      username: String!
      id: String!
    ): User!
  }
  type Subscription {
    moveMade(opponentId: String): MoveUnit
    userLoggedIn: User
    userLoggedOut: User
    challengeIssued(playerId: String): Opponents
    challengeCancelled(playerId: String): Opponents
    challengeAccepted(playerId: String): Opponents
    challengeDeclined(playerId: String): Opponents
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
    challenge: (root, args, context) => {
      console.log('challenge resolver')
      console.log('context.currentUser', context.currentUser)
      console.log('args',args)
      console.log()
      const payload = {
        challengeIssued: {
          challenger: context.currentUser,
          challenged: args,
        }
      }
      pubsub.publish('CHALLENGE_ISSUED', payload)
      return args
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
      const payload = { 
        challengeAccepted: {
          challenger: args,
          challenged: context.currentUser
        }}
      pubsub.publish('CHALLENGE_ACCEPTED', payload)
      return args
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
      const { userId, from, to } = args
      const move = { from, to }
      const payload = {
        moveMade: { userId, move }
      }
      console.log('makeAMove resolver')
      console.log('payload', payload)
      pubsub.publish('MOVE_MADE', payload)
      return move
    },
  },
  Subscription: {
    moveMade: {
      subscribe: withFilter(() => pubsub.asyncIterator(['MOVE_MADE']), (payload, variables) => {
        console.log('move made')
        console.log('payload', payload)
        console.log('variables', variables)
        return payload.moveMade.userId === variables.opponentId
      })
    },
    challengeIssued: {
      subscribe: withFilter(() => pubsub.asyncIterator(['CHALLENGE_ISSUED']), (payload, variables) => {
        console.log('challenge issued')
        console.log('payload', payload)
        console.log('variables', variables)
        console.log(payload.challengeIssued.challenged.id === variables.playerId)
        console.log()
        return payload.challengeIssued.challenged.id === variables.playerId
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
        return payload.challengeAccepted.challenger.id === variables.playerId
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
