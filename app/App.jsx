import React, { useReducer, useState, useEffect, useRef } from 'react';
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
  const [exposures, setExposures] = useState({});
  const [exposureStats, setExposureStats] = useState({});
  const mostRecentFetchQuery = useRef('');

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

    const fetchQuery = exposureQuery(deployments);
    if (fetchQuery === mostRecentFetchQuery.current) return;

    mostRecentFetchQuery.current = fetchQuery;
    setExposures({});
    setExposureStats({});

    fetch(`/exposures?${fetchQuery}`)
      .then((response) => {
        const error = response.headers.get('X-Error-Message');
        if (error) throw new Error(`Failed to fetch exposure data (${error})`);

        return response.json();
      })
      .then(setExposures)
      .catch(console.error);

    fetch(`/exposure_stats?${fetchQuery}`)
      .then((response) => {
        const error = response.headers.get('X-Error-Message');
        if (error) throw new Error(`Failed to fetch exposure data (${error})`);

        return response.json();
      })
      .then(setExposureStats)
      .catch(console.error);
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
            exposures,
            exposureStats,
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
