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
  const [comboboxState, setComboboxState] = useState({ inputValue: '' });
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

  // ENFORCE NON-DEFAULT BEHAVIOR: Reset inputValue any time user leaves input
  useEffect(() => {
    const { isOpen, selectedItem } = comboboxState;
    const originalSelection = (selectedItem || deployment.base).name || '';

    if (!isOpen) setControlledInput(originalSelection);
  }, [comboboxState.isOpen]);

  useEffect(() => {
    const { inputValue, isOpen, selectedItem } = comboboxState;
    const selectionMade = selectedItem && selectedItem.id !== deployment.base.id;
    const inputAbandoned = !isOpen && !selectionMade;

    // FIXME? Selecting an item triggers this effect hook TWICE:
    //
    // * onSelectedItemChange (with { inputValue, isOpen, highlightedIndex, selectedItem })
    // * when dispatchDeployments triggers re-render (with only { inputValue })
    //
    // Ignore this second state change.
    if ('isOpen' in comboboxState) {
      if (selectionMade) {
        setStatus('complete');
        setUIFocus({ on: 'date picker', id: deployment.id });
      } else {
        // inputValue may be non-empty when blurring via <Tab>/click
        inputDebouncer.current({ query: inputAbandoned ? '' : inputValue });

        // active UI feedback for debouncer
        if (isOpen && inputValue.trim().length) {
          setStatus('debouncing');
        } else {
          inputDebouncer.current.flush();
        }
      }
    }
  }, [comboboxState.inputValue, comboboxState.isOpen]);

  // onHighlightedIndexChange
  useEffect(() => {
    const { highlightedIndex, isOpen } = comboboxState;

    if (isOpen && uiFocus.on === 'search results') {
      setUIFocus({
        on: 'search results',
        results: uiFocus.results,
        result: highlightedIndex > -1
          ? uiFocus.results[highlightedIndex]
          : null,
      });
    }
  }, [comboboxState.highlightedIndex, comboboxState.isOpen]);

  // onSelectedItemChange
  useEffect(() => {
    if (comboboxState.selectedItem) {
      dispatchDeployments({
        type: 'modify',
        id: deployment.id,
        key: 'base',
        value: comboboxState.selectedItem,
      });
    }
  }, [(comboboxState.selectedItem || {}).id]);

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
