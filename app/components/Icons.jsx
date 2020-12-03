import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// eslint-disable-next-line import/prefer-default-export
export function MapPin({
  className, index, label, onClick,
}) {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={classNames('map-pin', className)}
        viewBox="0 0 128 128"
        onClick={onClick}
      >
        <path d="M64 128a6.9 6.9 0 01-4.89-2L26.23 93.12A55.05 55.05 0 0110
                 53.69a53.29 53.29 0 0115.87-38.11 54.56 54.56 0 0176.26
                 0A53.29 53.29 0 01118 53.69a55.05 55.05 0 01-16.23
                 39.43l-32.88 32.82A6.9 6.9 0 0164 128z"
        />
        {index ? (
          <text x="64" y="64">
            {index}
          </text>
        ) : (
          <path d="M64 81.41a27.25 27.25 0 1119.3-8 27.23 27.23 0 01-19.3 8z" />
        )}
      </svg>
      {label && (
        <div className="map-pin__label">
          <div className="text-lg font-bold">{label.name}</div>
          <div className="leading-3">{label.country}</div>
        </div>
      )}
    </>
  );
}

export function ChevronLeft(attributes) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="70 0 132.59575 240.82201"
      {...attributes}
    >
      <path
        d="M 57.633,129.007 165.93,237.268 c 4.752,4.74 12.451,4.74 17.215,0
           4.752,-4.74 4.752,-12.439 0,-17.179 L 83.438,120.418 183.133,20.747 c
           4.752,-4.74 4.752,-12.439 0,-17.191 -4.752,-4.74 -12.463,-4.74 -17.215,0 L
           57.621,111.816 c -4.679,4.691 -4.679,12.511 0.012,17.191 z"
     />
    </svg>
  );
}

export function Download(attributes) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="25 0 60 100"
      {...attributes}
    >
      <path d="M90.167 94.463H9.833c-2.761 0-5-2.238-5-5s2.239-5
               5-5h80.334c2.762 0 5 2.238 5 5S92.929 94.463 90.167 94.463z"
      />
      <path d="M76.68 43.232c-1.951-1.952-5.119-1.952-7.07 0l-14.61
               14.61V10.377c0-2.761-2.238-5-5-5c-2.761 0-5 2.239-5 5v47.465
               L30.391 43.233c-1.951-1.952-5.118-1.953-7.071 0c-1.953
               1.953-1.953 5.118 0 7.071l23.142 23.145  c0.231 0.23 0.484 0.438
               0.756 0.62c0.068 0.045 0.145 0.074 0.214 0.116c0.208 0.126 0.418
               0.25 0.645 0.344  c0.099 0.042 0.207 0.062 0.308 0.096c0.206
               0.071 0.409 0.146 0.625 0.19c0.323 0.065 0.654 0.1 0.989 0.1
               c0.335 0 0.666-0.034 0.989-0.1c0.207-0.042 0.4-0.115
               0.597-0.182c0.111-0.037 0.229-0.059 0.337-0.104  c0.221-0.092
               0.425-0.214 0.628-0.335c0.075-0.045 0.157-0.076
               0.229-0.125c0.273-0.184 0.528-0.392 0.76-0.624L76.68 50.304
               C78.633 48.351 78.633 45.185 76.68 43.232z"
      />
    </svg>
  );
}

export function Trash(attributes) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="10 10 80 80"
      {...attributes}
    >
      <rect x="36.1" y="11.8" width="27.8" height="6"/>
      <path d="M13.6,29.4h8l5,56a3,3,0,0,0,3,2.8H70.4a3,3,0,0,0,3-2.8l5-56h8v-6H13.6Z"/>
    </svg>
  );
}
MapPin.propTypes = {
  className: PropTypes.string.isRequired,
  index: PropTypes.number,
  label: PropTypes.shape({
    name: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
  }),
  onClick: PropTypes.func,
};
