const { ApolloServer, gql, PubSub, withFilter } = require('apollo-server')

const pubsub = new PubSub()

const typeDefs = gql`
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
    makeAMove(opponentId: String! from: Int! to: Int!): Move
  }
  type Subscription {
    moveMade(playerId: String): Move
  }
`





const resolvers = {
  Query: {
    hah: () => 'hah'
  },
  Mutation: {
    makeAMove: (root, args) => {
      //const {opponentId, from, to} = args
      const from = args.from
      const to = args.to
      const move = { from, to }
      console.log(move)
      const opponentId = args.opponentId
      pubsub.publish('MOVE_MADE', { opponentId, moveMade: move })
      return move
    }
  },
  Subscription: {
    moveMade: {
      subscribe: withFilter(() => pubsub.asyncIterator('MOVE_MADE'), (payload, variables) => {
        return payload.opponentId === variables.playerId
      })
    //  subscribe: () => pubsub.asyncIterator(['MOVE_MADE'])
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

/*
const { ApolloServer, gql } = require('apollo-server')

const typeDefs = gql`

`
const resolvers = {
  
}

const server = new ApolloServer([
  typeDefs,
  resolvers,
])

server.listen().then(({ url }) => {
  console.log('Server ready at', url)
})
*/