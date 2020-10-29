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

  switch (action.type) {
    case 'remove':
      return state.filter((deployment) => deployment.id !== action.id);
    case 'modify':
      target[action.key] = action.value;

      if (state.every(({ base }) => base.id)) state.push(createDeployment());

      return state.slice(0);
    case 'reset':
      return state.slice(-1);
    case 'reload':
      return deserializeHashParams();
    default:
      return state.slice(0);
  }
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

export function processHashParams(args) {
  // waiting for state vars to update is hard,
  // so just grab it from the source
  const deployments = deserializeHashParams();

  loadHashParams({ ...args, deployments });
  sanitizeHashParams({ deployments });
}

function loadHashParams({ deployments, dispatchDeployments, setUserFlow }) {
  dispatchDeployments({ type: 'reload' });

  switch (hashPath()) {
    case 'chart':
      if (validate({ deployments })) {
        setUserFlow({ mode: 'chart' });
        break;
      }
    case 'map':
      setUserFlow({ mode: 'map' });
  }
}

function sanitizeHashParams({ deployments }) {
  if (!window.location.hash) return;

  const pseudopath = hashPath().match(/^(map|chart)$/)?.[0];
  const queryString = exposureQuery(deployments, { strict: false });
  const urlFragment = [pseudopath, queryString].filter((part) => part).join('/');

  history.replaceState(history.state, '', `#${urlFragment}`);
}
