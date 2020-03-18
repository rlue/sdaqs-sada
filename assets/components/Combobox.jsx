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

function useInputDebounce(fuse, setSearchSuggestions, setStatus) {
  return useRef(
    debounce(({ inputValue, isOpen }) => {
      const results = fuse.current.search(inputValue)

      if (!isOpen || inputValue === '') {
        setSearchSuggestions([])
        setStatus('ready')
      } else if (!results.length) {
        setSearchSuggestions([])
        setStatus('no results')
      } else {
        setSearchSuggestions(results)
        setStatus('success')
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
  const [status, setStatus] = useState('ready')
  const [inputValue, setInputValue] = useState(selection ? selection.name : '')
  const fuse = useFuse(values)
  const inputDebouncer = useInputDebounce(fuse, setSearchSuggestions, setStatus)
  const ds = useCombobox({
    items: searchSuggestions,
    itemToString: (item) => (item ? item.name : ''),
    inputValue,
    onInputValueChange: ({ inputValue, isOpen }) => {
      inputDebouncer.current({ inputValue, isOpen })

      if (isOpen) {
        // The debouncer should also be flushed when !isOpen
        // (i.e., hitting <Esc> to cancel input),
        // but that's currently handled by onIsOpenChange(),
        // which also covers other blur events.
        if (inputValue === '') {
          inputDebouncer.current.flush()
        } else {
          setStatus('debouncing')
        }
      }
    },
    onIsOpenChange: ({ isOpen, selectedItem }) => {
      // This flushes the debouncer for both blur event triggers:
      //   * hitting <Tab> or <Esc> to cancel input, and
      //   * clicking outside the form element.
      //
      // It doesn't cover when the input field is reset but stays in focus;
      // that's up to onInputValueChange().
      if (!isOpen) {
        inputDebouncer.current({ inputValue: '', isOpen })
        inputDebouncer.current.flush()

        setInputValue((selectedItem || selection || { name: '' }).name)
      }
    },
    onHighlightedIndexChange: ({ highlightedIndex }) => {
      setFocusedSuggestion(highlightedIndex)
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        dispatchDeployments({
          type: 'modify',
          index,
          key: 'base',
          value: selectedItem,
        })
      }
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
        {status === 'debouncing' && <li>Searching...</li>}
        {status === 'no results' && <li>No results.</li>}
        {status === 'success'
          && searchSuggestions.map((item, i) => (
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
