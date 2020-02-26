import React from 'react'
import { useCombobox } from 'downshift'
import Fuse from 'fuse.js'
import sites from '../data/sites.json'

export default function Combobox() {
  const fuse = React.useRef(new Fuse(sites, fuseOptions))
  const [inputItems, setInputItems] = React.useState(fuse.current.list)
  const ds = useCombobox({
    items: inputItems,
    itemToString: (item) => (item ? item.name : ''),
    onInputValueChange: ({ inputValue }) => {
      setInputItems(fuse.current.search(inputValue))
    },
  })

  return (
    <>
      <label {...ds.getLabelProps()}>Choose an element:</label>
      <div {...ds.getComboboxProps()}>
        <input {...ds.getInputProps()} />
        <button {...ds.getToggleButtonProps()} aria-label={'toggle menu'}>
          &#8595;
        </button>
      </div>
      <ul {...ds.getMenuProps()}>
        {ds.isOpen &&
          inputItems.map((item, index) => (
            <li
              {...ds.getItemProps({ item, index })}
              key={`${item}${index}`}
              style={
                ds.highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}
              }
            >
              {item.name}
            </li>
          ))}
      </ul>
    </>
  )
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
