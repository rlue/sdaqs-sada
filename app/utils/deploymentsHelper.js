import moment from 'moment';
import uid from 'uid';
import { hashParams } from './urlParser';
import sites from '../../assets/data/sites.json';

export function createDeployment({ base, period } = { base: {} }) {
  return { id: uid(), base, period };
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
    default:
      return state.slice(0);
  }
}

export function initialDeployments() {
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

function validatePeriod(periodString) {
  const dateFormat = /^(\d{4})-(\d{2})-\d{2},(\d{4})-(\d{2})-\d{2}$/;
  const matchGroups = periodString?.match(dateFormat);
  if (!matchGroups) return;

  const [, fromYYYY, fromMM, toYYYY, toMM] = matchGroups.map(Number);
  if (
    2002 > fromYYYY || fromYYYY > 2018
    || 1 > fromMM || fromMM > 12
    || 2002 > toYYYY || toYYYY > 2018
    || 1 > toMM || toMM > 12
    || fromYYYY > toYYYY
    || (fromYYYY === toYYYY && fromMM > toMM)
  ) return;

  return [moment(`${fromYYYY}-${fromMM}-01`), moment(`${toYYYY}-${toMM}-01`)];
}
