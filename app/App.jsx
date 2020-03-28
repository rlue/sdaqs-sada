import React from 'react'
import uid from 'uid'
import '../assets/index.css'
import 'antd/dist/antd.css'
import SearchForm from './components/SearchForm'
import Map from './components/Map'

export default function App() {
  const [prompt, setPrompt] = React.useState({})
  const [searchResults, setSearchResults] = React.useState([])
  const [focusedResult, setFocusedResult] = React.useState(-1)
  const [deployments, dispatchDeployments] = React.useReducer(
    (state, action) => {
      const target = state[action.index]

      switch (action.type) {
        case 'remove':
          state.splice(action.index, 1)
          return state.slice(0)
        case 'modify':
          target[action.key] = action.value

          if (action.key === 'base' && !target.period) {
            setPrompt({ for: 'period', targetIndex: action.index })
          }

          if (state.every(({ base }) => base.id)) {
            state.push({ id: uid(), base: {}, period: null })
          }

          return state.slice(0)
        default:
          return state.slice(0)
      }
    },
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
