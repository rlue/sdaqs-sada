import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useCombobox } from 'downshift';
import { DatePicker } from 'antd';
import classNames from 'classnames';
import debounce from 'lodash.debounce';
import { DeleteFilled } from '@ant-design/icons';
import SearchResults from './SearchResults';

const INPUT_DEBOUNCE_WAIT = 300;

export default function SearchUnit({
  fuse,
  deployment,
  deployments,
  dispatchDeployments,
  uiFocus,
  setUIFocus,
}) {
  const [status, setStatus] = useState('ready');
  const [comboboxState, setComboboxState] = useState({ inputValue: deployment.base.name || '' });
  const componentRoot = useRef(null);
  const inputField = useRef(null);
  const datePicker = useRef(null);

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
    }, INPUT_DEBOUNCE_WAIT),
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

      if (!deployment.period) {
        // FIXME: Can we auto-open the dropdown instead of just focusing the input?
        datePicker.current.focus();
      }
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
          setUIFocus({ on: 'selected bases', id: deployment.id });
          setStatus('ready');
        } else {
          setComboboxState({ inputValue: '' });
          inputDebouncer.current({ query: '' });
          inputDebouncer.current.flush();
        }
    }
  }, [comboboxState.type]);

  // What happens when deployment.base is independently updated (e.g., during guided tour)?
  useEffect(() => {
    setComboboxState({ inputValue: deployment.base.name });
  }, [deployment.base.id]);

  // manage current UI focus
  useEffect(() => {
    const selectedForFocus = uiFocus.on === 'deployment details'
      && uiFocus.id === deployment.id;
    const hasFocus = componentRoot.current.contains(document.activeElement);

    if (selectedForFocus && !hasFocus) inputField.current.focus();
  }, [uiFocus.on, uiFocus.id]);

  function removeHandler() {
    const noDeploymentsRemain = !deployments.filter((d) => d.id !== deployment.id && d.base.id)
      .length;

    setUIFocus(noDeploymentsRemain ? {} : { on: 'selected bases' });
    dispatchDeployments({ type: 'remove', id: deployment.id });
  }

  return (
    <li // eslint-disable-line jsx-a11y/mouse-events-have-key-events
      className={`search-unit-${deployment.id} space-y-2`}
      ref={componentRoot}
      onMouseOver={() => {
        if (!uiFocus.on && deployment.base.id) {
          setUIFocus({ on: 'hovered deployment', deploymentId: deployment.id });
        }
      }}
      onMouseOut={({ clientX, clientY }) => {
        const hoveredElement = document.elementFromPoint(clientX, clientY);
        const falsePositive = componentRoot.current.contains(hoveredElement);

        if (uiFocus.on === 'hovered deployment' && !falsePositive) {
          setUIFocus({});
        }
      }}
      onFocus={({ target }) => {
        const deferToRemoveHandler = target.matches('button[id$="__delete"]');
        const alreadyFocused = uiFocus.on === 'deployment details'
          && uiFocus.id === deployment.id;
        const focusJumpRaceCondition = status === 'success';

        if (deferToRemoveHandler) return;

        if (deployment.base.id && !alreadyFocused) {
          setUIFocus({ on: 'selected bases', id: deployment.id });
        } else if (uiFocus.on === 'selected bases' && !focusJumpRaceCondition) {
          setUIFocus({ on: 'nothing' });
        }
      }}
    >
      <div
        className={classNames(
          'relative',
          'flex',
          { 'shadow-md': status.match(/^(debouncing|no results|success)$/) },
        )}
      >
        <label // eslint-disable-line jsx-a11y/label-has-associated-control
          className="hidden"
          {...ds.getLabelProps()}
        >
          Search bases
        </label>
        <div
          className="w-full"
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
            className={classNames(
              'min-w-0',
              'w-full',
              'px-2',
              'py-1',
              'rounded-tl',
              { 'rounded-bl': status.match(/^(ready|complete)$/) },
              { 'rounded-tr': !deployment.base.id || status.match(/^(debouncing|no results|success)$/) },
              { 'rounded-br': !deployment.base.id && status.match(/^(ready|complete)$/) },
              'border',
              { 'border-b-0': status.match(/^(debouncing|no results|success)$/) },
              'focus:outline-none',
            )}
            ref={inputField}
            placeholder="Search bases"
          />

          <ul
            {...ds.getMenuProps()}
            className={classNames(
              'absolute',
              'z-10',
              'shadow-md',
              'w-full',
              'bg-white',
              'rounded-b',
              { border: status.match(/^(debouncing|no results|success)$/) },
              'border-t-0',
            )}
          >
            <SearchResults status={status}>
              {(uiFocus.results || []).map((item, index) => (
                <li
                  {...ds.getItemProps({ item, index })}
                  key={`${item.id}`}
                  className={classNames(
                    'px-2',
                    'py-1',
                    { 'bg-gray-200': ds.highlightedIndex === index },
                  )}
                >
                  <div className="float-right whitespace-no-wrap text-xs italic text-gray-500">
                    {item.country}
                  </div>
                  <div className="truncate">{item.name}</div>
                </li>
              ))}
            </SearchResults>
          </ul>
        </div>

        <button
          id={`search-unit-${deployment.id}__delete`}
          className={classNames(
            'px-2',
            'focus:outline-none',
            { hidden: !deployment.base.id || status.match(/^(debouncing|no results|success)$/) },
          )}
          type="button"
          onClick={removeHandler}
        >
          <DeleteFilled />
        </button>
      </div>

      <div
        className={classNames(
          'search-unit__details',
          { 'search-unit__details--hidden': !deployment.base.id },
        )}
      >
        <DatePicker.RangePicker
          ref={datePicker}
          className={classNames(
            'w-full',
            { 'search-unit__date-picker--incomplete': !deployment.period },
          )}
          picker="month"
          format="MMM YYYY"
          disabledDate={(current) => current
            && !current.isBetween(new Date(2002, 0, 1), Date.now())}
          defaultValue={deployment.period}
          value={deployment.period}
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
  deployments: PropTypes.arrayOf(PropTypes.object).isRequired,
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
