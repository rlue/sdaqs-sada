import React, { useReducer, useState, useEffect } from 'react';
import 'antd/dist/antd.css';
import classNames from 'classnames';
import '../assets/index.css';
import SearchPanel from './components/SearchPanel';
import Map from './components/Map';
import ChartPage from './components/ChartPage';
import GuidedTour from './components/GuidedTour';
import { deploymentsReducer, createDeployment } from './utils/deploymentsHelper';

export default function App() {
  const [userFlow, setUserFlow] = useState({ mode: 'map' });
  const [deployments, dispatchDeployments] = useReducer(
    deploymentsReducer,
    [createDeployment()],
  );
  const [exposureHistory, setExposureHistory] = useState({});

  useEffect(() => {
    if (!window.location.hash) return;

    dispatchDeployments({ type: 'reload' });
  }, []);

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
