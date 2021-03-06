// @flow
import React from 'react';
import styled from 'styled-components';

import type { ThemeProps } from '../../../theme';

const Svg = styled.svg`
  fill: ${(p: ThemeProps) => p.theme.colour('text')};
`;

const Update = (props: {}) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    {...props}
  >
    <defs>
      <path id="a" d="M0 0h24v24H0V0z" />
    </defs>
    <clipPath id="b">
      <use xlinkHref="#a" overflow="visible" />
    </clipPath>
    <path
      clipPath="url(#b)"
      d="M21 10.12h-6.78l2.74-2.82a7.04 7.04 0 0 0-9.88-.1 6.88 6.88 0 0 0 0 9.79 7.02 7.02 0 0 0 9.88 0A6.51 6.51 0 0 0 19 12.1h2c0 1.98-.88 4.55-2.64 6.29a9.05 9.05 0 0 1-12.72 0 8.84 8.84 0 0 1-.02-12.58 8.99 8.99 0 0 1 12.65 0L21 3v7.12zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z"
    />
  </Svg>
);

export default Update;
