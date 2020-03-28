import React from 'react'
import PropTypes from 'prop-types'
import { DatePicker } from 'antd'

export default function DatePickerPopup({ base }) {
  return (
    <div>
      <h1>WHEN WERE YOU THERE??</h1>
    </div>
  )
}

DatePickerPopup.propTypes = {
  base: PropTypes.shape({
    name: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
  }).isRequired,
}
