import React from 'react'
import PropTypes from 'prop-types'

export default function ResultPopup({ base }) {
  return (
    <div>
      <h1>{base.name}</h1>
    </div>
  )
}

ResultPopup.propTypes = {
  base: PropTypes.shape({
    name: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
  }).isRequired,
}
