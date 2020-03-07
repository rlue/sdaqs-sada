import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import SearchForm from './components/SearchForm'
import Map from './components/Map'

function App() {
  const [searchSuggestions, setSearchSuggestions] = React.useState([])

  return (
    <div className="app container__bifold">
      <SearchForm {...{ searchSuggestions, setSearchSuggestions }} />
      <Map {...{ searchSuggestions }} />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
