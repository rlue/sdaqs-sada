import React from 'react'
import Combobox from './Combobox'

export default function SearchForm() {
  return (
    <div className="item__bifold-left">
      <h1>Look up exposure history</h1>
      <form>
        <Combobox />
      </form>
    </div>
  )
}
