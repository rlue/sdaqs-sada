import React from 'react';
import PropTypes from 'prop-types';
import Tour from 'reactour';

const SAMPLE_BASE = {
  id: 'VA0518',
  name: 'Baghdad',
  lat: 33.3152,
  lng: 44.3661,
  country: 'Iraq',
  base_fob_name: 'Baghdad',
};

const SAMPLE_PERIOD = [
  new Date(2006,  0, 1),
  new Date(2007, 11, 1),
];

export default function GuidedTour({
  userFlow,
  setUserFlow,
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
            dust, sulfates, nitrates, and more.
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
          <p className="text-xs">
            Data is available for bases located in
            Southwest Asia, Djibouti, and Afghanistan (SADA)
            between 2002–2018.
          </p>
        </div>
      ),
      position: 'center',
      style: {
        maxWidth: '32rem',
      },
    },
    {
      selector: `.search-unit-${userFlow.deploymentId} input[id^="downshift"]`,
      content: 'Step 1: Select a base',
      action: () => {
        if (!sampleDeployment.base.id) {
          dispatchDeployments({
            type: 'modify',
            id: userFlow.deploymentId,
            key: 'base',
            value: SAMPLE_BASE,
          });
        }
      },
    },
    {
      selector: `.search-unit-${userFlow.deploymentId} > .search-unit__details`,
      content: 'Step 2: Select the dates you were deployed there.',
      action: () => {
        if (!sampleDeployment.period) {
          dispatchDeployments({
            type: 'modify',
            id: userFlow.deploymentId,
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
      isOpen={userFlow.action === 'tour'}
      onRequestClose={() => setUserFlow({ mode: 'map' })}
      showNumber={false}
      showNavigationNumber={false}
      nextButton="Next"
      lastStepNextButton="Finish"
    />
  );
}

GuidedTour.propTypes = {
  userFlow: PropTypes.shape({
    mode: PropTypes.string,
    action: PropTypes.string,
    deploymentId: PropTypes.string,
  }).isRequired,
  setUserFlow: PropTypes.func.isRequired,
  sampleDeployment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    base: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    }).isRequired,
    period: PropTypes.array,
  }),
  dispatchDeployments: PropTypes.func.isRequired,
};
