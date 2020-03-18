import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useCombobox } from 'downshift'
import debounce from 'lodash.debounce'
import SearchResults from './SearchResults'

const DEBOUNCE_WAIT = 300

export default function Combobox({
  fuse,
  index,
  selection,
  dispatchDeployments,
  searchResults,
  setSearchResults,
  setFocusedResult,
}) {
  const [status, setStatus] = useState('ready')
  const [controlledInput, setControlledInput] = useState(selection.name || '')

  const inputDebouncer = useRef(
    debounce(({ inputValue, isOpen }) => {
      const results = fuse.search(inputValue)

      if (!isOpen || inputValue === '') {
        setSearchResults([])
        setStatus('ready')
      } else if (!results.length) {
        setSearchResults([])
        setStatus('no results')
      } else {
        setSearchResults(results)
        setStatus('success')
      }
    }, DEBOUNCE_WAIT),
  )

  const ds = useCombobox({
    items: searchResults,
    itemToString: (item) => (item ? item.name : ''),
    inputValue: controlledInput,
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

        setControlledInput((selectedItem || selection).name || '')
      }
    },
    onHighlightedIndexChange: ({ highlightedIndex }) => {
      setFocusedResult(highlightedIndex)
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
              onChange: (event) => setControlledInput(event.target.value),
            })}
            id="military-base"
            placeholder="Search bases"
          />
        </div>
      </label>
      {selection.id && (
        <button
          type="button"
          onClick={() => dispatchDeployments({ type: 'remove', index })}
        >
          x
        </button>
      )}
      <ul {...ds.getMenuProps()}>
        <SearchResults status={status}>
          {searchResults.map((item, index) => (
            <li
              {...ds.getItemProps({ item, index })}
              key={`${item.id}`}
              className={ds.highlightedIndex === index ? 'highlight' : null}
            >
              {item.name}
            </li>
          ))}
        </SearchResults>
      </ul>
    </>
  )
}

Combobox.propTypes = {
  fuse: PropTypes.shape({
    search: PropTypes.func.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  selection: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }).isRequired,
  dispatchDeployments: PropTypes.func.isRequired,
  searchResults: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      latitude: PropTypes.string.isRequired,
      longitude: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  setSearchResults: PropTypes.func.isRequired,
  setFocusedResult: PropTypes.func.isRequired,
}
