import React, { useReducer, useState } from 'react';
import uid from 'uid';
import '../assets/index.css';
import 'antd/dist/antd.css';
import SearchPanel from './components/SearchPanel';
import Map from './components/Map';

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
    default:
      return state.slice(0);
  }
}

export default function App() {
  const [uiFocus, setUIFocus] = useState({});
  const [deployments, dispatchDeployments] = useReducer(deploymentsReducer, [
    { id: uid(), base: {}, period: null },
  ]);

  return (
    <div className="app container__bifold">
      <SearchPanel
        {...{
          deployments,
          dispatchDeployments,
          uiFocus,
          setUIFocus,
        }}
      />
      <Map
        {...{
          deployments,
          dispatchDeployments,
          uiFocus,
          setUIFocus,
        }}
      />
    </div>
  );
}
