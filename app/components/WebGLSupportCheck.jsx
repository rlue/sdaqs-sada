import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';

export default function WebGLSupportCheck({ children }) {
  const [webGLSupport, setWebGLSupport] = useState(null);

  const cssCentered = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl')
      || canvas.getContext('experimental-webgl');

    setWebGLSupport(gl instanceof WebGLRenderingContext);
  }, []);

  switch (webGLSupport) {
    case true:
      return children;
    case false:
      return (
        <div style={cssCentered}>
          <h1>
            <span role="img" aria-label="Browser Error">🤦</span>
            {' '}
            D’oh! Your browser does not support WebGL.
          </h1>
          <p>
            Find out more at
            {' '}
            <a href="https://get.webgl.org/" rel="noopener">https://get.webgl.org</a>
            .
          </p>
        </div>
      );
    default:
      return <Spin size="large" style={cssCentered} />;
  }
}

WebGLSupportCheck.propTypes = {
  children: PropTypes.node.isRequired,
};
