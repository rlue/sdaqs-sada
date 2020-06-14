import React from 'react';
import { shallow } from 'enzyme';
import * as Icons from './Icons';

test('Totally meaningless sample test', () => {
  const wrapper = shallow(<Icons.MapPin className="foo" onClick={() => {}} />);

  expect(wrapper.find('svg').length).toBe(1);
});
