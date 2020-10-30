import React, { useReducer, useState, useEffect } from 'react';
import 'antd/dist/antd.css';
import classNames from 'classnames';
import '../assets/index.css';
import SearchPanel from './components/SearchPanel';
import Map from './components/Map';
import ChartPage from './components/ChartPage';
import GuidedTour from './components/GuidedTour';
import { exposureQuery } from './utils/urlHelper';
import {
  createDeployment,
  deploymentsReducer,
  loadHashParams,
} from './utils/globalStateHelper';

export default function App() {
  const [userFlow, setUserFlow] = useState({ mode: 'map' });
  const [deployments, dispatchDeployments] = useReducer(
    deploymentsReducer,
    [createDeployment()],
  );
  const [exposureHistory, setExposureHistory] = useState({});

  useEffect(() => {
    if (window.location.hash) {
      loadHashParams({
        dispatchDeployments,
        setUserFlow,
        initialPageLoad: true,
      });
    } else {
      history.replaceState({ userFlow, deployments }, '', '');
    }

    window.addEventListener('hashchange', () => {
      if (history.state) return;

      loadHashParams({ dispatchDeployments, setUserFlow });
    });

    window.addEventListener('popstate', ({ state }) => {
      if (!state) return;

      dispatchDeployments({ type: 'load', value: state.deployments });
      setUserFlow(state.userFlow);
    });
  }, []);

  useEffect(() => {
    if (userFlow.mode !== 'chart') return;

    const queryString = exposureQuery(deployments);
    if (!queryString) return;

    fetch(`/exposures?${queryString}`)
      .then((response) => response.json())
      .then(setExposureHistory);
  }, [userFlow.mode, deployments]);

  return (
    <>
      <SearchPanel
        {...{
          userFlow,
          setUserFlow,
          deployments,
          dispatchDeployments,
        }}
      />
      <div
        className={classNames(
          'content-window',
          'flex',
          'h-full',
          'overflow-hidden',
          'transition-transform',
          'duration-500',
          'ease-in-out',
          'transform',
          {
            'translate-x-0': userFlow.mode === 'map',
            '-translate-x-1/2': userFlow.mode === 'chart',
          },
        )}
        style={{ width: '200vw' }}
      >
        <Map
          {...{
            deployments,
            userFlow,
            setUserFlow,
          }}
        />
        <ChartPage
          {...{
            exposureHistory,
            userFlow,
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
