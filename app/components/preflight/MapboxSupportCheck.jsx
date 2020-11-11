import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
import mapboxgl from 'mapbox-gl';

export default function MapboxSupportCheck({ children }) {
  const [tokenValidity, setTokenValidity] = useState(null);

  const cssCentered = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  useEffect(() => {
    fetch(`https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/1/0/0.mvt?access_token=${MAPBOXGL_ACCESS_TOKEN}`)
      .then((response) => {
        setTokenValidity(response.status === 200);
      })
  }, []);

  if (!mapboxgl.supported()) {
    return (
      <div style={cssCentered}>
        <h1 className="text-5xl mb-4">
          <span role="img" aria-label="Browser Error">🤦</span>
          {' '}
          D’oh! Your browser does not support Mapbox.
        </h1>
        <p className="text-xl">
          Find out more at
          {' '}
          <a href="https://get.webgl.org/" rel="noopener">https://get.webgl.org</a>
          .
        </p>
      </div>
    );
  } else if (tokenValidity === null) {
    return <Spin size="large" style={cssCentered} />;
  } else if (tokenValidity === false) {
    return (
      <div style={cssCentered}>
        <h1 className="text-5xl mb-4">
          <span role="img" aria-label="Application Error">🤦</span>
          {' '}
          D’oh! This site was built with an invalid Mapbox access token.
        </h1>
        <p className="text-xl">
          Please contact your administrator.
        </p>
      </div>
    );
  } else {
    return children;
  }
}

MapboxSupportCheck.propTypes = {
  children: PropTypes.node.isRequired,
};
