import React from 'react';
import ReactDOM from 'react-dom';
import App from '../app/App';
import MapboxSupportCheck from '../app/components/preflight/MapboxSupportCheck';

ReactDOM.render(
  <MapboxSupportCheck><App /></MapboxSupportCheck>,
  document.querySelector('.app-root'),
);
