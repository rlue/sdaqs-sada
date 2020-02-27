import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import SearchForm from './components/SearchForm'
import Map from './components/Map'

function App() {
  const [matches, setMatches] = React.useState([])

  return (
    <div className="app container__bifold">
      <SearchForm {...{ matches, setMatches }} />
      <Map {...{ matches }} />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
