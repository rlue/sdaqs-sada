import React from 'react';
import PropTypes from 'prop-types';
import Tour from 'reactour';
import moment from 'moment';

const SAMPLE_BASE = {
  id: 1,
  name: 'Baghdad',
  lat: 33.3152,
  lng: 44.3661,
  country: 'Iraq',
  base_fob_name: 'Baghdad',
};

const SAMPLE_PERIOD = [
  moment('2006-01-01'),
  moment('2007-12-01'),
];

export default function GuidedTour({
  uiFocus,
  setUIFocus,
  sampleDeployment,
  dispatchDeployments,
}) {
  const steps = [
    {
      content: (
        <div className="space-y-4">
          <h1 className="text-4xl mb-8">
            <span role="img" aria-label="Thinking face">🤔</span>
            {' '}
            What is this?
          </h1>
          <p>
            US military personnel are exposed to
            all kinds of air pollution on deployment:
            sulfates, nitrates, organic compounds, and more.
          </p>
          <p>
            This
            {' '}
            <strong>source-differentiated air quality system</strong>
            {' '}
            (SDAQS) can show you
            {' '}
            <strong>how much</strong>
            {' '}
            of these contaminants you were exposed to, and
            {' '}
            <strong>when</strong>
            .
          </p>
          {
            // TODO: add screenshot of sample results
          }
          <p className="text-xs">
            Data is limited to bases located in
            Southwest Asia, Djibouti, and Afghanistan (SADA)
            between 2002–present.
          </p>
        </div>
      ),
      position: 'center',
      style: {
        maxWidth: '32rem',
      },
    },
    {
      selector: `.search-unit-${uiFocus.id} input[id^="downshift"]`,
      content: 'Step 1: Select a base',
      action: () => {
        if (!sampleDeployment.base.id) {
          dispatchDeployments({
            type: 'modify',
            id: uiFocus.id,
            key: 'base',
            value: SAMPLE_BASE,
          });
        }
      },
    },
    {
      selector: `.search-unit-${uiFocus.id} > .search-unit__details`,
      content: 'Step 2: Select the dates you were deployed there.',
      action: () => {
        if (!sampleDeployment.period) {
          dispatchDeployments({
            type: 'modify',
            id: uiFocus.id,
            key: 'period',
            value: SAMPLE_PERIOD,
          });
        }
      },
    },
    {
      selector: '.search-list > li:last-child input[id^="downshift"]',
      content: 'Step 3: Add more bases, if necessary.',
    },
    {
      selector: 'button[type="submit"]',
      content: 'Step 4: Generate your results!',
    },
  ];

  return (
    <Tour
      steps={steps}
      isOpen={uiFocus.on === 'tour'}
      onRequestClose={() => setUIFocus({})}
      showNumber={false}
      showNavigationNumber={false}
      nextButton="Next"
      lastStepNextButton="Finish"
    />
  );
}

GuidedTour.propTypes = {
  uiFocus: PropTypes.shape({
    on: PropTypes.string,
    id: PropTypes.string,
  }).isRequired,
  setUIFocus: PropTypes.func.isRequired,
  sampleDeployment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    base: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }).isRequired,
    period: PropTypes.array,
  }),
  dispatchDeployments: PropTypes.func.isRequired,
};
