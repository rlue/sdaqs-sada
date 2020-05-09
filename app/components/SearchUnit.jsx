import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useCombobox } from 'downshift';
import { DatePicker } from 'antd';
import classNames from 'classnames';
import debounce from 'lodash.debounce';
import { DeleteFilled } from '@ant-design/icons';
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
  const [comboboxState, setComboboxState] = useState({ inputValue: deployment.base.name || '' });

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
    inputValue: comboboxState.inputValue,
    selectedItem: comboboxState.selectedItem,
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
      setComboboxState({ inputValue: selectedItem.name });
      setStatus('complete');
      setUIFocus({ on: 'deployment details', id: deployment.id });
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

    switch (type) { // eslint-disable-line default-case
      case '__input_blur__':
      case '__input_keydown_enter__':
        if (selectionMade) break;
      case '__input_keydown_escape__': // eslint-disable-line no-fallthrough
        if (deployment.base.id) {
          setComboboxState({ inputValue: deployment.base.name });
          setUIFocus({ on: 'deployment details', id: deployment.id });
        } else {
          setComboboxState({ inputValue: '' });
          inputDebouncer.current({ query: '' });
          inputDebouncer.current.flush();
        }
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
      // FIXME: popup lingers on page when user clicks elsewhere on the SearchPanel
      onFocus={() => {
        if (deployment.base.id) {
          setUIFocus({ on: 'deployment details', id: deployment.id });
        } else {
          setUIFocus({});
        }
      }}
    >
      <div className="search-unit__header">
        <label // eslint-disable-line jsx-a11y/label-has-associated-control
          className="search-unit__combobox-label"
          {...ds.getLabelProps()}
        >
          Search bases
        </label>
        <div
          className="search-unit__combobox"
          {...ds.getComboboxProps()}
        >
          <input
            {...ds.getInputProps({
              onChange: (event) => {
                setComboboxState({ type: '__input_change__', inputValue: event.target.value });
              },
              onKeyPress: (event) => {
                const keypressEnter = event.charCode === 13;
                const implicitSelection = uiFocus.results && ds.highlightedIndex === -1;

                if (keypressEnter && implicitSelection) {
                  setComboboxState({ type: '__input_keydown_enter__', selectedItem: uiFocus.results[0] });
                }
              },
            })}
            placeholder="Search bases"
          />

          <button
            className={classNames(
              'search-unit__close-button',
              { 'search-unit__close-button--hidden': !deployment.base.id },
            )}
            type="button"
            onClick={removeHandler}
          >
            <DeleteFilled />
          </button>
        </div>

        <ul className="search-results" {...ds.getMenuProps()}>
          <SearchResults status={status}>
            {(uiFocus.results || []).map((item, index) => (
              <li
                {...ds.getItemProps({ item, index })}
                key={`${item.id}`}
                className={classNames('search-result', { highlight: ds.highlightedIndex === index })}
              >
                <div className="search-result__country">{item.country}</div>
                <div className="search-result__name">{item.name}</div>
              </li>
            ))}
          </SearchResults>
        </ul>
      </div>

      <div
        className={classNames(
          'search-unit__details',
          { 'search-unit__details--hidden': uiFocus.on !== 'deployment details' || uiFocus.id !== deployment.id },
        )}
      >
        <DatePicker.RangePicker
          picker="month"
          format="MMM YYYY"
          disabledDate={(current) => current
            && !current.isBetween(new Date(2002, 0, 1), Date.now())}
          defaultValue={deployment.period}
          onChange={(dates) => {
            dispatchDeployments({
              type: 'modify',
              id: deployment.id,
              key: 'period',
              value: dates,
            });

            if (dates) {
              setUIFocus({});
            }
          }}
        />
      </div>
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
    id: PropTypes.string,
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
