import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import 'antd/dist/antd.css'
import SearchForm from './components/SearchForm'
import Map from './components/Map'

function App() {
  const [searchSuggestions, setSearchSuggestions] = React.useState([])
  const [focusedSuggestion, setFocusedSuggestion] = React.useState(-1)

  return (
    <div className="app container__bifold">
      <SearchForm
        {...{ searchSuggestions, setSearchSuggestions, setFocusedSuggestion }}
      />
      <Map {...{ searchSuggestions, focusedSuggestion }} />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
