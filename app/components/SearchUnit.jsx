import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useCombobox } from 'downshift';
import debounce from 'lodash.debounce';
import { humanMonthRange } from '../utils/dateHelper';
import SearchResults from './SearchResults';

const DEBOUNCE_WAIT = 300;

export default function SearchUnit({
  fuse,
  deployment,
  dispatchDeployments,
  uiFocus,
  setUIFocus,
}) {
  const [status, setStatus] = useState('ready');
  const [comboboxState, setComboboxState] = useState({});
  const [controlledInput, setControlledInput] = useState(deployment.base.name || '');

  const inputDebouncer = useRef(
    debounce(({ query }) => {
      const results = fuse.search(query).slice(0, 20);

      if (!query.trim().length) {
        setStatus('ready');
        setUIFocus({});
      } else if (!results.length) {
        setStatus('no results');
        setUIFocus({});
      } else {
        setStatus('success');
        setUIFocus({ on: 'search results', results });
      }
    }, DEBOUNCE_WAIT),
  );

  const ds = useCombobox({
    items: uiFocus.results || [],
    itemToString: (item) => (item ? item.name : ''),
    inputValue: controlledInput,
    onStateChange: setComboboxState,
  });

  // What happens when you enter text?
  useEffect(() => {
    const { inputValue, type } = comboboxState;

    // without `type === '__input_change__'`, this effect fires on highlightedIndexChange
    if ('inputValue' in comboboxState && type === '__input_change__') {
      inputDebouncer.current({ query: inputValue });

      // active UI feedback for debouncer
      if ((inputValue).trim().length) {
        setStatus('debouncing');
      } else {
        inputDebouncer.current.flush();
      }
    }
  }, [comboboxState.inputValue]);

  // What happens when you hover/highlight results?
  useEffect(() => {
    const { highlightedIndex, selectedItem } = comboboxState;
    const selectionMade = selectedItem && selectedItem.id !== deployment.base.id;

    if ('highlightedIndex' in comboboxState && !selectionMade && uiFocus.results) {
      setUIFocus({
        on: 'search results',
        results: uiFocus.results,
        result: highlightedIndex > -1
          ? uiFocus.results[highlightedIndex]
          : null,
      });
    }
  }, [comboboxState.highlightedIndex]);

  // What happens when you make a selection?
  useEffect(() => {
    const { selectedItem } = comboboxState;
    const selectionMade = selectedItem && selectedItem.id !== deployment.base.id;

    if (selectionMade) {
      setControlledInput(selectedItem.name);
      setStatus('complete');
      setUIFocus({ on: 'date picker', id: deployment.id });
      dispatchDeployments({
        type: 'modify',
        id: deployment.id,
        key: 'base',
        value: comboboxState.selectedItem,
      });
    }
  }, [(comboboxState.selectedItem || {}).id]);

  // What happens when you abandon input? (un-combobox-like behavior!)
  useEffect(() => {
    const { type, selectedItem } = comboboxState;
    const selectionMade = selectedItem && selectedItem.id !== deployment.base.id;
    const originalInputValue = (selectedItem || deployment.base).name || '';

    switch (type) { // eslint-disable-line default-case
      case '__input_blur__':
        if (selectionMade) break;
      case '__input_keydown_escape__': // eslint-disable-line no-fallthrough
        setControlledInput(originalInputValue);
        inputDebouncer.current({ query: '' });
        inputDebouncer.current.flush();
    }
  }, [comboboxState.type]);

  function removeHandler() {
    setUIFocus({});
    dispatchDeployments({ type: 'remove', id: deployment.id });
  }

  function setHoveredSelection() {
    if (deployment.base.id && !uiFocus.on) {
      setUIFocus({ on: 'hovered deployment', deploymentId: deployment.id });
    }
  }

  function unsetHoveredSelection() {
    if (deployment.base.id && uiFocus.on === 'hovered deployment') {
      setUIFocus({});
    }
  }

  return (
    <li // eslint-disable-line jsx-a11y/mouse-events-have-key-events
      className="search-unit"
      onMouseOver={setHoveredSelection}
      onMouseOut={unsetHoveredSelection}
    >
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
                  setUIFocus({ on: 'date picker', id: deployment.id });
                } else {
                  setUIFocus({});
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
      <ul className="search-results" {...ds.getMenuProps()}>
        <SearchResults status={status}>
          {(uiFocus.results || []).map((item, index) => (
            <li
              {...ds.getItemProps({ item, index })}
              key={`${item.id}`}
              className={ds.highlightedIndex === index ? 'highlight' : null}
            >
              <div className="search-result__country">{item.country}</div>
              <div className="search-result__name">{item.name}</div>
            </li>
          ))}
        </SearchResults>
      </ul>
    </li>
  );
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
};
