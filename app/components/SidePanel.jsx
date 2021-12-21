import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import SidePanelChartNav from './SidePanelChartNav';
import SidePanelHeader from './SidePanelHeader';
import SidePanelMapForm from './SidePanelMapForm';

export default function SidePanel({
  userFlow,
  setUserFlow,
  deployments,
  dispatchDeployments,
}) {
  return (
    <div className="side-panel">
      <SidePanelHeader {...{ userFlow }} />
      {
        userFlow.mode === "map" ?
          <SidePanelMapForm {...{
            deployments,
            dispatchDeployments,
            userFlow,
            setUserFlow,
          }}/> :
          <SidePanelChartNav {...{ setUserFlow }} />
      }
    </div>
  );
}

SidePanel.propTypes = {
  userFlow: PropTypes.shape({
    mode: PropTypes.string,
    for: PropTypes.string,
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
  deployments: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatchDeployments: PropTypes.func.isRequired,
};
