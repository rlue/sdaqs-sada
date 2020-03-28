import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useCombobox } from 'downshift'
import debounce from 'lodash.debounce'
import SearchResults from './SearchResults'

const DEBOUNCE_WAIT = 300

export default function Combobox({
  fuse,
  deployment,
  dispatchDeployments,
  searchResults,
  setSearchResults,
  setFocusedResult,
  setPrompt,
}) {
  const [status, setStatus] = useState('ready')
  const [controlledInput, setControlledInput] = useState(deployment.base.name || '')

  const inputDebouncer = useRef(
    debounce(({ inputValue, isOpen }) => {
      const results = fuse.search(inputValue)

      if (!isOpen || inputValue.match(/^\s*$/)) {
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
    onInputValueChange: ({ isOpen, inputValue }) => {
      inputDebouncer.current({ inputValue, isOpen })

      if (isOpen && inputValue.match(/\S/)) {
        setStatus('debouncing')
      } else {
        inputDebouncer.current.flush()
      }
    },
    // ENFORCE NON-DEFAULT BEHAVIOR:
    // Reset inputValue/items any time user abandons input
    // (<Esc>/<Tab>/<S-Tab>/click-out instead of making a selection)
    onIsOpenChange: ({ isOpen, selectedItem, inputValue }) => {
      if (!isOpen) {
        const blur = !!inputValue.length // <Tab>/<S-Tab>/click-out, but not <Esc>
        const inputAbandoned = (selectedItem || {}).id === deployment.base.id

        // We must handle <Esc> here (because of our controlled input)...
        setControlledInput((selectedItem || deployment.base).name || '')

        // ...but not here (it triggers onInputValueChange, and blur does not).
        if (blur && inputAbandoned) {
          inputDebouncer.current({ inputValue: '', isOpen: false })
          inputDebouncer.current.flush()
        }
      }
    },
    onHighlightedIndexChange: ({ highlightedIndex }) => {
      setFocusedResult(highlightedIndex)
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        dispatchDeployments({
          type: 'modify',
          id: deployment.id,
          key: 'base',
          value: selectedItem,
        })
        setPrompt({ for: 'period', id: deployment.id }) // TODO: Make this idempotent?
      }
    },
  })

  function removeHandler() {
    setPrompt({})
    dispatchDeployments({ type: 'remove', id: deployment.id })
  }

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
              // FIXME: popup lingers on page when user clicks elsewhere on the SearchForm
              onFocus: () => {
                if (deployment.base.id) {
                  setPrompt({ for: 'period', id: deployment.id })
                } else {
                  setPrompt({})
                }
              },
            })}
            id="military-base"
            placeholder="Search bases"
          />
        </div>
      </label>
      <span className="combobox__period">
        {deployment.base.id
          && (deployment.period
            ? deployment.period.map((date) => date.format('MMM YYYY')).join('–')
            : 'No dates selected')}
      </span>
      {deployment.base.id
        && <button type="button" onClick={removeHandler}>x</button>}
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
  deployment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    base: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }).isRequired,
    period: PropTypes.array,
  }).isRequired,
  dispatchDeployments: PropTypes.func.isRequired,
  searchResults: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      lat: PropTypes.string.isRequired,
      lng: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  setSearchResults: PropTypes.func.isRequired,
  setFocusedResult: PropTypes.func.isRequired,
  setPrompt: PropTypes.func.isRequired,
}
