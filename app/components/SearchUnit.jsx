import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useCombobox } from 'downshift';
import { DatePicker } from 'antd';
import moment from 'moment';
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
  userFlow,
  setUserFlow,
}) {
  const [status, setStatus] = useState('ready');
  const [controlledInput, setControlledInput] = useState(deployment.base.name || '');
  const componentRoot = useRef(null);
  const inputField = useRef(null);
  const datePicker = useRef(null);

  const inputDebouncer = useRef(
    debounce(({ query }) => {
      const results = fuse.search(query).slice(0, 20);

      if (!query.trim().length) {
        setStatus('ready');
        setUserFlow({ mode: 'map' });
      } else if (!results.length) {
        setStatus('no results');
        setUserFlow({ mode: 'map' });
      } else {
        setStatus('success');
        setUserFlow({
          mode: 'map',
          action: 'search bases',
          results,
        });
      }
    }, INPUT_DEBOUNCE_WAIT),
  );

  const ds = useCombobox({
    items: userFlow.results || [],
    itemToString: (item) => (item ? item.name : ''),
    inputValue: controlledInput,
    onInputValueChange: ({ inputValue }) => setControlledInput(inputValue),
    stateReducer: (_state, { type, changes }) => {
      const { selectedItem } = changes;
      const selectionMade = selectedItem && selectedItem.id !== deployment.base.id;
      const types = useCombobox.stateChangeTypes;

      switch (type) {
        // What happens when you make a selection?
        case types.FunctionSelectItem:
        case types.ItemClick:
        case types.InputKeyDownEnter:
          if (selectionMade) {
            changes.inputValue = selectedItem.name;
            break; // Keep this INSIDE the `if` clause (we're relying on case fallthrough)
          }

        // What happens when you abandon input? (un-combobox-like behavior!)
        case types.InputBlur: // previously would `break` if (selectionMade)???
        case types.InputKeyDownEscape:
          changes.inputValue = deployment.base.name || '';
      }

      return changes;
    },
    onStateChange: (state) => {
      const { type, inputValue, highlightedIndex, selectedItem } = state;
      const selectionMade = selectedItem && selectedItem.id !== deployment.base.id;
      const types = useCombobox.stateChangeTypes;

      switch (type) {
        // What happens when you enter text?
        case types.InputChange:
          inputDebouncer.current({ query: inputValue || '' });

          // active UI feedback for debouncer
          if (inputValue?.trim().length) {
            setStatus('debouncing');
          } else {
            inputDebouncer.current.flush();
          }
          break;

        // What happens when you hover/highlight results?
        case types.InputKeyDownArrowUp:
        case types.InputKeyDownArrowDown:
        case types.InputKeyDownHome:
        case types.InputKeyDownEnd:
        case types.ItemMouseMove:
        case types.MenuMouseLeave:
        case types.FunctionSetHighlightedIndex:
          if (!selectionMade && userFlow.results) {
            setUserFlow({
              mode: 'map',
              action: 'search bases',
              results: userFlow.results,
              result: highlightedIndex > -1
                ? userFlow.results[highlightedIndex]
                : null,
            });
          }

          break;

        // What happens when you make a selection?
        case types.FunctionSelectItem:
        case types.ItemClick:
        case types.InputKeyDownEnter:
          if (selectionMade) {
            setUserFlow({
              mode: 'map',
              action: 'edit deployment',
              deploymentId: deployment.id,
            });
            dispatchDeployments({
              type: 'modify',
              id: deployment.id,
              key: 'base',
              value: selectedItem,
            });

            setStatus('complete');

            // FIXME: Can we auto-open the dropdown instead of just focusing the input?
            if (!deployment.period) datePicker.current.focus();

            break; // Keep this INSIDE the `if` clause (we're relying on case fallthrough)
          }

        // What happens when you abandon input? (un-combobox-like behavior!)
        case types.InputBlur: // previously would break if (selectionMade)???
        case types.InputKeyDownEscape:
          if (deployment.base.id) {
            setUserFlow({
              mode: 'map',
              action: 'review deployments',
              deploymentId: deployment.id,
            });
            setStatus('ready');
          } else {
            inputDebouncer.current({ query: '' });
            inputDebouncer.current.flush();
          }
      }
    },
  });

  // manage current UI focus
  useEffect(() => {
    const selectedForFocus = userFlow.action === 'edit deployment'
      && userFlow.deploymentId === deployment.id;
    const hasFocus = componentRoot.current.contains(document.activeElement);

    if (selectedForFocus && !hasFocus) inputField.current.focus();
  }, [userFlow.action, userFlow.deploymentId]);

  // keep `controlledInput` in sync with `deployment.base.name`
  // when paging back and forth through browser history.
  useEffect(() => {
    setControlledInput(deployment.base.name || '');
  }, [deployment]);

  function removeHandler() {
    const noDeploymentsRemain = !deployments.filter((d) => d.id !== deployment.id && d.base.id)
      .length;

    setUserFlow(
      noDeploymentsRemain
        ? { mode: 'map' }
        : { mode: 'map', action: 'review deployments' },
    );
    dispatchDeployments({ type: 'remove', id: deployment.id });
  }

  return (
    <li // eslint-disable-line jsx-a11y/mouse-events-have-key-events
      className={`search-unit-${deployment.id} space-y-2`}
      ref={componentRoot}
      onMouseOver={() => {
        if (!userFlow.action && deployment.base.id) {
          setUserFlow({
            mode: 'map',
            action: 'preview deployment',
            deploymentId: deployment.id,
          });
        }
      }}
      onMouseOut={({ clientX, clientY }) => {
        const hoveredElement = document.elementFromPoint(clientX, clientY);
        const falsePositive = componentRoot.current.contains(hoveredElement);

        if (userFlow.action === 'preview deployment' && !falsePositive) {
          setUserFlow({ mode: 'map' });
        }
      }}
      onFocus={({ target }) => {
        const deferToRemoveHandler = target.classList.contains('js-search-unit-delete');
        const alreadyFocused = userFlow.action === 'edit deployment'
          && userFlow.deploymentId === deployment.id;
        const focusJumpRaceCondition = status === 'success';

        if (deferToRemoveHandler) return;

        if (deployment.base.id && !alreadyFocused) {
          setUserFlow({
            mode: 'map',
            action: 'review deployments',
            deploymentId: deployment.id,
          });
        } else if (userFlow.action === 'review deployments' && !focusJumpRaceCondition) {
          setUserFlow({ mode: 'map', action: 'none' });
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
              ref: inputField,
              onKeyPress: (event) => {
                const keypressEnter = event.charCode === 13;
                const implicitSelection = userFlow.results && ds.highlightedIndex === -1;

                if (keypressEnter && implicitSelection)
                  ds.selectItem(userFlow.results[0]);
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
              {(userFlow.results || []).map((item, index) => (
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
          className={classNames(
            'px-2',
            'focus:outline-none',
            { hidden: !deployment.base.id || status.match(/^(debouncing|no results|success)$/) },
            'js-search-unit-delete',
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
          disabledDate={(current) => {
            return current?.isBefore(new Date(2002, 0, 1))
              || current?.isAfter(new Date(2019, 0, 0));
          }}
          value={deployment.period?.map((date) => moment(date))}
          onChange={(dates) => {
            dispatchDeployments({
              type: 'modify',
              id: deployment.id,
              key: 'period',
              value: dates ? [dates[0].toDate(), dates[1].endOf('month').toDate()] : dates,
            });

            if (dates) setUserFlow({ mode: 'map' });
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
      id: PropTypes.string,
      name: PropTypes.string,
    }).isRequired,
    period: PropTypes.array,
  }).isRequired,
  deployments: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatchDeployments: PropTypes.func.isRequired,
  userFlow: PropTypes.shape({
    mode: PropTypes.string,
    action: PropTypes.string,
    deploymentId: PropTypes.string,
    results: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        lat: PropTypes.string,
        lng: PropTypes.string,
      }),
    ),
  }).isRequired,
  setUserFlow: PropTypes.func.isRequired,
};
