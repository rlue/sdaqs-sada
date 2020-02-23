import React from 'react'
import { useCombobox } from 'downshift'
import sites from '../data/sites.json'

export default function Combobox() {
  const items = sites.map((site) => site.name)
  const [inputItems, setInputItems] = React.useState(items)
  const ds = useCombobox({
    items: inputItems,
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        items.filter((item) =>
          item.toLowerCase().startsWith(inputValue.toLowerCase()),
        ),
      )
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
              {item}
            </li>
          ))}
      </ul>
    </>
  )
}
