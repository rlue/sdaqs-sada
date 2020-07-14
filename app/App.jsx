import React, { useReducer, useState } from 'react';
import uid from 'uid';
import 'antd/dist/antd.css';
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
  const [uiFocus, setUIFocus] = useState({});
  const [deployments, dispatchDeployments] = useReducer(deploymentsReducer, [
    { id: uid(), base: {}, period: null },
  ]);
  const [exposureHistory, setExposureHistory] = useState({});

  return (
    <>
      <SearchPanel
        {...{
          uiFocus,
          setUIFocus,
          deployments,
          dispatchDeployments,
          setExposureHistory,
        }}
      />
      <div className="content-window">
        <Map
          {...{
            deployments,
            uiFocus,
            setUIFocus,
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
          uiFocus,
          setUIFocus,
          dispatchDeployments,
        }}
        sampleDeployment={deployments.find(({ id }) => id === uiFocus.id)}
      />
    </>
  );
}
