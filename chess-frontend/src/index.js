import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, split } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from 'apollo-link-context'
import 'semantic-ui-css/semantic.min.css'
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux'
import { combineReducers, createStore} from 'redux'
import gameReducer from './reducers/gameReducer';
import userReducer from './reducers/userReducer';
import replayReducer from './reducers/replayReducer';
import challengeReducer from './reducers/challengeReducer';
import boardReducer from './reducers/boardReducer';

console.log = () => {}

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('chess-user-token')
  console.log('authLink',token)
  return {
    headers: {
      ...headers,
      authorization: token ? `bearer ${token}` : null
    }
  }
})

const wsLink = new WebSocketLink({
  //uri: 'ws://localhost:4000/graphql',
  uri: 'ws://enigmatic-taiga-64004.herokuapp.com/graphql',
  options: {
    reconnect: true
  }
})

const httpLink = new HttpLink({
  //uri: 'http://localhost:4000',
  uri: 'https://enigmatic-taiga-64004.herokuapp.com/',
})

const splitLink = split(({query}) => {
  const definition = getMainDefinition(query)
  return (
    definition.kind === 'OperationDefinition' &&
    definition.operation === 'subscription'
  )
}, wsLink, authLink.concat(httpLink))

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink
})

const reducer = combineReducers({
  game: gameReducer,
  user: userReducer,
  replay: replayReducer,
  challenge: challengeReducer,
  board: boardReducer,
})
const store = createStore(reducer);

store.subscribe(() => {
  const storeNow = store.getState()
  console.log('store now', storeNow)
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </ApolloProvider>,
  document.getElementById('root')
);
