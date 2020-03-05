import React from 'react'
import PropTypes from 'prop-types'
import { useCombobox } from 'downshift'
import Fuse from 'fuse.js'
import debounce from 'lodash.debounce'

export default function Combobox({
  values,
  searchSuggestions,
  setSearchSuggestions,
  setFocusedSuggestion,
}) {
  const fuse = React.useRef(new Fuse(values, fuseOptions))
  const inputDebouncer = React.useRef(
    debounce(({ inputValue, isOpen }) => {
      setSearchSuggestions(isOpen ? fuse.current.search(inputValue) : [])
    }, 300),
  )
  const ds = useCombobox({
    items: searchSuggestions,
    itemToString: (item) => (item ? item.name : ''),
    onInputValueChange: inputDebouncer.current,
    onHighlightedIndexChange: ({ highlightedIndex }) =>
      setFocusedSuggestion(highlightedIndex),
  })

  return (
    <>
      <label {...ds.getLabelProps()} htmlFor="military-base">
        Search bases
        <div {...ds.getComboboxProps()}>
          <input {...ds.getInputProps()} id="military-base" />
          <button
            {...ds.getToggleButtonProps()}
            aria-label="toggle menu"
            type="button"
          >
            Go!
          </button>
        </div>
      </label>
      <ul {...ds.getMenuProps()}>
        {ds.isOpen &&
          searchSuggestions.map((item, index) => (
            <li
              {...ds.getItemProps({ item, index })}
              key={`${item.name}${item.latitude}`}
              style={
                ds.highlightedIndex === index
                  ? { backgroundColor: '#bde4ff' }
                  : {}
              }
            >
              {item.name}
            </li>
          ))}
      </ul>
    </>
  )
}

Combobox.propTypes = {
  values: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.string,
      longitude: PropTypes.string,
    }),
  ).isRequired,
  searchSuggestions: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.string,
      longitude: PropTypes.string,
    }),
  ).isRequired,
  setSearchSuggestions: PropTypes.func.isRequired,
}

const fuseOptions = {
  shouldSort: true,
  threshold: 0.25,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ['name'],
}
