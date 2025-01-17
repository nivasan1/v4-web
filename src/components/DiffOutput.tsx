import styled, { css, type AnyStyledComponent } from 'styled-components';

import { layoutMixins } from '@/styles/layoutMixins';

import { DiffArrow, type DiffArrowProps } from '@/components/DiffArrow';
import { Output, OutputType, type OutputProps } from '@/components/Output';

import { BigNumberish } from '@/lib/numbers';

export { OutputType as DiffOutputType };

type ElementProps = {
  hasInvalidNewValue?: boolean;
  newValue?: BigNumberish | null;
  withDiff?: boolean;
};

type StyleProps = {
  layout?: 'row' | 'column';
};

export type DiffOutputProps = DiffArrowProps & OutputProps & ElementProps & StyleProps;

export const DiffOutput = ({
  className,
  direction,
  fractionDigits,
  hasInvalidNewValue,
  sign,
  tag,
  type,
  useGrouping,
  withDiff,
  layout = 'row',
  showSign,
  withBaseFont,

  value,
  newValue,
}: DiffOutputProps) => (
  <Styled.DiffOutput className={className} layout={layout} withDiff={withDiff}>
    <Output
      fractionDigits={fractionDigits}
      tag={tag}
      type={type}
      useGrouping={useGrouping}
      value={value}
      showSign={showSign}
      withBaseFont={withBaseFont}
    />
    {withDiff && (
      <Styled.DiffValue hasInvalidNewValue={hasInvalidNewValue}>
        <DiffArrow direction={direction} sign={sign} />
        <Output
          fractionDigits={fractionDigits}
          tag={tag}
          type={type}
          useGrouping={useGrouping}
          value={newValue}
          showSign={showSign}
          withBaseFont={withBaseFont}
        />
      </Styled.DiffValue>
    )}
  </Styled.DiffOutput>
);

const Styled: Record<string, AnyStyledComponent> = {};

Styled.DiffValue = styled.div<{ hasInvalidNewValue?: boolean }>`
  ${layoutMixins.row}
  gap: 0.25rem;
  color: var(--color-text-2);

  ${({ hasInvalidNewValue }) =>
    hasInvalidNewValue &&
    css`
      color: var(--color-error);
    `}
`;

Styled.DiffOutput = styled.div<{ layout: 'row' | 'column'; withDiff?: boolean }>`
  --diffOutput-gap: 0.25rem;
  --diffOutput-value-color: var(--color-text-1);
  --diffOutput-newValue-color: var(--color-text-2);
  --diffOutput-valueWithDiff-color: ;

  gap: var(--diffOutput-gap);

  & > :first-child {
    font: var(--diffOutput-value-font, inherit);
    color: var(--diffOutput-value-color);
  }

  ${({ layout }) =>
    ({
      ['row']: `
        ${layoutMixins.row}
      `,
      ['column']: `
        ${layoutMixins.column}
      `,
    }[layout])}

  ${({ withDiff }) =>
    withDiff &&
    css`
      & > :first-child {
        color: var(--diffOutput-valueWithDiff-color, var(--diffOutput-value-color));
        font: var(--diffOutput-valueWithDiff-font);
      }

      & > :last-child {
        color: var(--diffOutput-newValue-color);
        font: var(--diffOutput-newValue-font);
      }
    `}
`;
