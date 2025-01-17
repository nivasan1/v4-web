import { useEffect, useRef } from 'react';

import { shallowEqual, useSelector } from 'react-redux';
import styled, { css, type AnyStyledComponent } from 'styled-components';

import { Nullable } from '@/constants/abacus';

import { layoutMixins } from '@/styles/layoutMixins';

import { LoadingDots } from '@/components/Loading/LoadingDots';
import { Output, OutputType } from '@/components/Output';

import {
  getCurrentMarketConfig,
  getCurrentMarketMidMarketPrice,
} from '@/state/perpetualsSelectors';

import { MustBigNumber } from '@/lib/numbers';

const getMidMarketPriceColor = ({
  midMarketPrice,
  lastMidMarketPrice,
}: {
  midMarketPrice: Nullable<number>;
  lastMidMarketPrice: Nullable<number>;
}) => {
  if (MustBigNumber(midMarketPrice).lt(MustBigNumber(lastMidMarketPrice))) {
    return 'var(--color-negative)';
  } else if (MustBigNumber(midMarketPrice).gt(MustBigNumber(lastMidMarketPrice))) {
    return 'var(--color-positive)';
  }

  return 'var(--color-text-2)';
};

export const MidMarketPrice = () => {
  const { tickSizeDecimals } = useSelector(getCurrentMarketConfig, shallowEqual) ?? {};
  const midMarketPrice = useSelector(getCurrentMarketMidMarketPrice);
  const lastMidMarketPrice = useRef(midMarketPrice);

  const midMarketColor = getMidMarketPriceColor({
    midMarketPrice,
    lastMidMarketPrice: lastMidMarketPrice.current,
  });

  useEffect(() => {
    lastMidMarketPrice.current = midMarketPrice;
  }, [midMarketPrice]);

  return midMarketPrice !== undefined ? (
    <Styled.Output
      type={OutputType.Fiat}
      value={midMarketPrice}
      color={midMarketColor}
      fractionDigits={tickSizeDecimals}
    />
  ) : (
    <LoadingDots size={5} />
  );
};

const Styled: Record<string, AnyStyledComponent> = {};

Styled.Output = styled(Output)<{ color?: string }>`
  ${layoutMixins.row}

  ${({ color }) =>
    color &&
    css`
      color: ${color};
    `}
`;
