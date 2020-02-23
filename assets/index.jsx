import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import SearchForm from './components/SearchForm'
import Map from './components/Map'

function App() {
  return (
    <div className="app container__bifold">
      <SearchForm />
      <Map />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
