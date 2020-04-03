import React from 'react'
import uid from 'uid'
import '../assets/index.css'
import 'antd/dist/antd.css'
import SearchForm from './components/SearchForm'
import Map from './components/Map'

function deploymentsReducer(state, action) {
  const target = state.find((el) => el.id === action.id)

  switch (action.type) {
    case 'remove':
      return state.filter((deployment) => deployment.id !== action.id)
    case 'modify':
      target[action.key] = action.value

      if (state.every(({ base }) => base.id)) {
        state.push({ id: uid(), base: {}, period: null })
      }

      return state.slice(0)
    default:
      return state.slice(0)
  }
}

export default function App() {
  const [prompt, setPrompt] = React.useState({})
  const [searchResults, setSearchResults] = React.useState([])
  const [focusedResult, setFocusedResult] = React.useState(-1)
  const [deployments, dispatchDeployments] = React.useReducer(
    deploymentsReducer,
    [{ id: uid(), base: {}, period: null }],
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
          setPrompt,
        }}
      />
      <Map
        {...{
          searchResults,
          focusedResult,
          deployments,
          prompt,
        }}
      />
    </div>
  )
}
