import React, { useReducer, useState } from 'react';
import uid from 'uid';
import 'antd/dist/antd.css';
import classNames from 'classnames';
import '../assets/index.css';
import SearchPanel from './components/SearchPanel';
import Map from './components/Map';
import ExposureSummary from './components/ExposureSummary';
import GuidedTour from './components/GuidedTour';

function deploymentsReducer(state, action) {
  const target = state.find((el) => el.id === action.id);

  switch (action.type) {
    case 'remove':
      return state.filter((deployment) => deployment.id !== action.id);
    case 'modify':
      target[action.key] = action.value;

      if (state.every(({ base }) => base.id)) {
        state.push({ id: uid(), base: {}, period: null });
      }

      return state.slice(0);
    case 'reset':
      return state.slice(-1);
    default:
      return state.slice(0);
  }
}

export default function App() {
  const [userFlow, setUserFlow] = useState({ mode: 'deployment builder' });
  const [deployments, dispatchDeployments] = useReducer(deploymentsReducer, [
    { id: uid(), base: {}, period: null },
  ]);
  const [exposureHistory, setExposureHistory] = useState({});

  return (
    <>
      <SearchPanel
        {...{
          userFlow,
          setUserFlow,
          deployments,
          dispatchDeployments,
          setExposureHistory,
        }}
      />
      <div
        className={classNames(
          'content-window',
          {
            'slide-right': userFlow.mode === 'deployment builder',
            'slide-left': userFlow.mode === 'exposure report',
          },
        )}
      >
        <Map
          {...{
            deployments,
            userFlow,
            setUserFlow,
          }}
        />
        <ExposureSummary
          {...{
            exposureHistory,
          }}
        />
      </div>
      <GuidedTour
        {...{
          userFlow,
          setUserFlow,
          dispatchDeployments,
        }}
        sampleDeployment={deployments.find(({ id }) => id === userFlow.deploymentId)}
      />
    </>
  );
}
