import React from 'react';
import ReactDOM from 'react-dom';
import App from '../app/App';
import WebGLSupportCheck from '../app/components/WebGLSupportCheck';

ReactDOM.render(
  <WebGLSupportCheck><App /></WebGLSupportCheck>,
  document.querySelector('#app'),
);
