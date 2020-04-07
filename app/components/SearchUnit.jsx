import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useCombobox } from 'downshift'
import debounce from 'lodash.debounce'
import { humanMonthRange } from '../utils/dateHelper'
import SearchResults from './SearchResults'

const DEBOUNCE_WAIT = 300

export default function SearchUnit({
  fuse,
  deployment,
  dispatchDeployments,
  setFocusedResult,
  uiFocus,
  setUIFocus,
}) {
  const [status, setStatus] = useState('ready')
  const [comboboxState, setComboboxState] = useState({ inputValue: '' })
  const [controlledInput, setControlledInput] = useState(deployment.base.name || '')

  const inputDebouncer = useRef(
    debounce(({ inputValue, isOpen, selectedItem }) => {
      const results = fuse.search(inputValue)

      if (!isOpen && selectedItem && selectedItem.id) {
        setStatus('complete')
        setUIFocus({ on: 'date picker', id: deployment.id })
      } else if (!isOpen || inputValue.match(/^\s*$/)) {
        setStatus('ready')
        setUIFocus({})
      } else if (!results.length) {
        setStatus('no results')
        setUIFocus({})
      } else {
        setStatus('success')
        setUIFocus({ on: 'search results', results })
      }
    }, DEBOUNCE_WAIT),
  )

  const ds = useCombobox({
    items: uiFocus.results || [],
    itemToString: (item) => (item ? item.name : ''),
    inputValue: controlledInput,
    onStateChange: setComboboxState,
  })

  // onInputValueChange
  useEffect(() => {
    const { isOpen, inputValue, selectedItem } = comboboxState

    inputDebouncer.current({ inputValue, isOpen, selectedItem })

    if (isOpen && inputValue.match(/\S/)) {
      setStatus('debouncing')
    } else {
      inputDebouncer.current.flush()
    }
  }, [comboboxState.inputValue])

  // onIsOpenChange
  //
  // ENFORCE NON-DEFAULT BEHAVIOR:
  // Reset inputValue/items any time user abandons input
  // (<Esc>/<Tab>/<S-Tab>/click-out instead of making a selection)
  useEffect(() => {
    const { isOpen, inputValue, selectedItem } = comboboxState

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
  }, [comboboxState.isOpen])

  // onHighlightedIndexChange
  useEffect(() => {
    const { highlightedIndex, isOpen } = comboboxState

    if (isOpen) setFocusedResult(highlightedIndex)
  }, [comboboxState.highlightedIndex, comboboxState.isOpen])

  // onSelectedItemChange
  useEffect(() => {
    if (comboboxState.selectedItem) {
      dispatchDeployments({
        type: 'modify',
        id: deployment.id,
        key: 'base',
        value: comboboxState.selectedItem,
      })
    }
  }, [(comboboxState.selectedItem || {}).id])

  function removeHandler() {
    setUIFocus({})
    dispatchDeployments({ type: 'remove', id: deployment.id })
  }

  return (
    <div>
      <label
        {...ds.getLabelProps()}
        htmlFor="military-base"
        style={{ display: 'inline-block' }}
      >
        <div {...ds.getComboboxProps()}>
          <input
            {...ds.getInputProps({
              onChange: (event) => setControlledInput(event.target.value),
              // FIXME: popup lingers on page when user clicks elsewhere on the SearchPanel
              onFocus: () => {
                if (deployment.base.id) {
                  setUIFocus({ on: 'date picker', id: deployment.id })
                } else {
                  setUIFocus({})
                }
              },
            })}
            id="military-base"
            placeholder="Search bases"
          />
        </div>
      </label>
      <span className="combobox__period">
        {deployment.base.id && humanMonthRange(deployment.period)}
      </span>
      {deployment.base.id
        && <button type="button" onClick={removeHandler}>x</button>}
      <ul {...ds.getMenuProps()}>
        <SearchResults status={status}>
          {(uiFocus.results || []).map((item, index) => (
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
    </div>
  )
}

SearchUnit.propTypes = {
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
  setFocusedResult: PropTypes.func.isRequired,
  uiFocus: PropTypes.shape({
    on: PropTypes.string,
    results: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        lat: PropTypes.string,
        lng: PropTypes.string,
      }),
    ),
  }).isRequired,
  setUIFocus: PropTypes.func.isRequired,
}
