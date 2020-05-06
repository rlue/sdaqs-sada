import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';

function disabledDate(current) {
  return current && !current.isBetween(new Date(2002, 0, 1), Date.now());
}

export default function DatePickerPopup({
  deployment,
  dispatchDeployments,
  setUIFocus,
}) {
  return (
    <div>
      <div className="date-picker__country">{deployment.base.country}</div>
      <h1 className="date-picker__name">{deployment.base.name}</h1>
      <DatePicker.RangePicker
        picker="month"
        format="MMM YYYY"
        disabledDate={disabledDate}
        defaultValue={deployment.period}
        onChange={(dates) => {
          dispatchDeployments({
            type: 'modify',
            id: deployment.id,
            key: 'period',
            value: dates,
          });

          if (dates) {
            setUIFocus({});
          }
        }}
      />
    </div>
  );
}

DatePickerPopup.propTypes = {
  deployment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    base: PropTypes.shape({
      name: PropTypes.string.isRequired,
      country: PropTypes.string.isRequired,
    }).isRequired,
    period: PropTypes.array,
  }).isRequired,
  dispatchDeployments: PropTypes.func.isRequired,
  setUIFocus: PropTypes.func.isRequired,
};
