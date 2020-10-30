import uid from 'uid';
import { hashPath, hashParams, exposureQuery } from './urlHelper';
import sites from '../../assets/data/sites.json';

export function createDeployment({ base, period } = { base: {} }) {
  return { id: uid(), base, period };
}

export function validate({ deployments }) {
  const initializedDeployments = deployments.filter(({ base }) => base.id);
  const completedDeployments = initializedDeployments.filter(({ period }) => period);

  return initializedDeployments.length
    && initializedDeployments.length === completedDeployments.length;
}

export function deploymentsReducer(state, action) {
  const target = state.find((el) => el.id === action.id);
  let newState;

  switch (action.type) {
    case 'remove':
      newState = state.filter((deployment) => deployment.id !== action.id);
      break;
    case 'modify':
      target[action.key] = action.value;

      if (state.every(({ base }) => base.id)) state.push(createDeployment());

      newState = state.slice(0);
      break;
    case 'reset':
      newState = state.slice(-1);
      break;
    case 'load':
      newState = action.value;
      break;
    default:
      newState = state.slice(0);
  }

  // WARNING! Side effect
  if (action.type !== 'load')
    history.pushState(...historyEntry({ deployments: newState }));

  return newState;
}

function deserializeHashParams() {
  const deployments = [];
  const params = hashParams();
  const baseIds = Object.keys(params);

  baseIds?.forEach((baseId) => {
    const base = sites.find(({ id }) => id === baseId);
    const periods = (
      params[baseId] instanceof Array
        ? params[baseId]
        : [params[baseId]]
    ).map(validatePeriod);

    if (!base) return;

    periods.forEach((period) => {
      deployments.push(createDeployment({ base, period }));
    });
  });

  deployments.push(createDeployment());

  return deployments;
}

function validatePeriod(string) {
  const dateFormat = /^(\d{4})-(\d{1,2})-\d{1,2},(\d{4})-(\d{1,2})-\d{1,2}$/;
  if (!string?.match(dateFormat)) return;

  const [, fromYYYY, fromMM, toYYYY, toMM] = string?.match(dateFormat).map(Number);
  const start = new Date(fromYYYY, fromMM - 1, 1);
  const end = new Date(toYYYY, toMM, 0);
  if (
    start < new Date(2002, 0, 1)
    || end > new Date(2019, 0, 0)
    || start > end
  ) return;

  return [start, end];
}

export function loadHashParams({
  dispatchDeployments,
  setUserFlow,
  initialPageLoad,
}) {
  // waiting for state vars to update is hard,
  // so just grab it from the source
  const deployments = deserializeHashParams();
  const mode = validatedHashPath({ deployments });

  dispatchDeployments({ type: 'load', value: deployments });
  setUserFlow({ mode });

  // in Chart mode, the Back button actually calls `history.back()`,
  // so if the user manually enters hash params to start the app in Chart mode,
  // we need to prepend an entry for them to navigate "back" to.
  if (initialPageLoad && mode === 'chart') {
    history.replaceState(...historyEntry({ mode: 'map', deployments }));
    history.pushState(...historyEntry({ mode: 'chart' }));
  } else {
    history.replaceState(...historyEntry({ mode, deployments }));
  }
}

// returns an array of arguments to use with
// the History#pushState and History#replaceState methods,
// based on a given userFlow.mode and deployments (both optional).
export function historyEntry({ mode, deployments }) {
  mode = mode || history.state?.userFlow.mode;
  deployments = deployments || history.state?.deployments;

  const state = { userFlow: { mode }, deployments };
  const title = '';
  const queryString = exposureQuery(deployments, { strict: false });
  const urlFragment = [mode, queryString].filter(Boolean).join('/');

  return [state, title, `#${urlFragment}`];
}

function validatedHashPath({ deployments }) {
  if (hashPath() === 'chart' && validate({ deployments })) return 'chart';

  return 'map';
}
