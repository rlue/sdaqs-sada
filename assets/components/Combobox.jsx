import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useCombobox } from 'downshift'
import Fuse from 'fuse.js'
import debounce from 'lodash.debounce'

function useFuse(values) {
  return useRef(
    new Fuse(values, {
      shouldSort: true,
      threshold: 0.25,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['name'],
    }),
  )
}

function useInputDebounce(fuse, setSearchSuggestions) {
  return useRef(
    debounce(({ inputValue, isOpen }) => {
      const results = isOpen ? fuse.current.search(inputValue) : []
      setSearchSuggestions(results)

      if (isOpen && inputValue !== '' && !results.length) {
        console.log('nothing to see here!') // FIXME
      }
    }, 300),
  )
}

export default function Combobox({
  values,
  index,
  selection,
  dispatchDeployments,
  searchSuggestions,
  setSearchSuggestions,
  setFocusedSuggestion,
}) {
  const fuse = useFuse(values)
  const inputDebouncer = useInputDebounce(fuse, setSearchSuggestions)
  const [inputValue, setInputValue] = useState(selection ? selection.name : '')
  const ds = useCombobox({
    items: searchSuggestions,
    itemToString: (item) => (item ? item.name : ''),
    inputValue,
    onInputValueChange: inputDebouncer.current,
    onIsOpenChange: ({ isOpen, selectedItem }) => {
      if (!isOpen) {
        inputDebouncer.current.cancel()
        setSearchSuggestions([])

        if (selectedItem) {
          setInputValue(selectedItem.name)
          dispatchDeployments({
            type: 'modify',
            index,
            key: 'base',
            value: selectedItem,
          })
        } else {
          setInputValue(selection ? selection.name : '')
        }
      }
    },
    onHighlightedIndexChange: ({ highlightedIndex }) => {
      setFocusedSuggestion(highlightedIndex)
    },
  })

  return (
    <>
      <label
        {...ds.getLabelProps()}
        htmlFor="military-base"
        style={{ display: 'inline-block' }}
      >
        <div {...ds.getComboboxProps()}>
          <input
            {...ds.getInputProps({
              onChange: (event) => setInputValue(event.target.value),
            })}
            id="military-base"
            placeholder="Search bases"
          />
        </div>
      </label>
      {selection && (
        <button
          type="button"
          onClick={() => dispatchDeployments({ type: 'remove', index })}
        >
          x
        </button>
      )}
      <ul {...ds.getMenuProps()}>
        {ds.isOpen &&
          searchSuggestions.map((item, i) => (
            <li
              {...ds.getItemProps({ item, i })}
              key={`${item.name}${item.latitude}`}
              style={
                ds.highlightedIndex === i ? { backgroundColor: '#bde4ff' } : {}
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
  index: PropTypes.number.isRequired,
  selection: PropTypes.shape({
    name: PropTypes.string,
    latitude: PropTypes.string,
    longitude: PropTypes.string,
  }),
  dispatchDeployments: PropTypes.func.isRequired,
  searchSuggestions: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.string,
      longitude: PropTypes.string,
    }),
  ).isRequired,
  setSearchSuggestions: PropTypes.func.isRequired,
  setFocusedSuggestion: PropTypes.func.isRequired,
}
