import React from 'react'
import PropTypes from 'prop-types'
import { useCombobox } from 'downshift'
import Fuse from 'fuse.js'

export default function Combobox({ values, matches, setMatches }) {
  const fuse = React.useRef(new Fuse(values, fuseOptions))
  const ds = useCombobox({
    items: matches,
    itemToString: (item) => (item ? item.name : ''),
    onInputValueChange: ({ inputValue, isOpen }) => {
      setMatches(isOpen ? fuse.current.search(inputValue) : [])
    },
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
          matches.map((item, index) => (
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
  matches: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.string,
      longitude: PropTypes.string,
    }),
  ).isRequired,
  setMatches: PropTypes.func.isRequired,
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
