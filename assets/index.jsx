import React from 'react'
import ReactDOM from 'react-dom'
import uid from 'uid'
import './index.css'
import 'antd/dist/antd.css'
import SearchForm from './components/SearchForm'
import Map from './components/Map'

function App() {
  const [searchResults, setSearchResults] = React.useState([])
  const [focusedResult, setFocusedResult] = React.useState(-1)
  const [deployments, dispatchDeployments] = React.useReducer(
    (state, action) => {
      switch (action.type) {
        case 'remove':
          state.splice(action.index, 1)
          return state.slice(0)
        case 'modify':
          state[action.index][action.key] = action.value
          if (state.every(({ base }) => base))
            state.push({ id: uid(), base: null, period: null })
          return state.slice(0)
      }
    },
    [{ id: uid(), base: null, period: null }],
  )

  return (
    <div className="app container__bifold">
      <SearchForm
        {...{
          deployments,
          dispatchDeployments,
          searchResults,
          setSearchResults,
          setFocusedResult,
        }}
      />
      <Map {...{ searchResults, focusedResult, deployments }} />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
