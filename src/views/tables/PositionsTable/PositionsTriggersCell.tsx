import { useDispatch } from 'react-redux';
import styled, { css, type AnyStyledComponent } from 'styled-components';

import {
  AbacusPositionSide,
  Nullable,
  type AbacusPositionSides,
  type SubaccountOrder,
} from '@/constants/abacus';
import { ButtonAction, ButtonSize } from '@/constants/buttons';
import { DialogTypes } from '@/constants/dialogs';
import { STRING_KEYS } from '@/constants/localization';

import { useEnvFeatures, useStringGetter } from '@/hooks';

import { layoutMixins } from '@/styles/layoutMixins';

import { Button } from '@/components/Button';
import { Icon, IconName } from '@/components/Icon';
import { Output, OutputType } from '@/components/Output';
import { WithHovercard } from '@/components/WithHovercard';

import { openDialog } from '@/state/dialogs';

import { isStopLossOrder } from '@/lib/orders';

type ElementProps = {
  marketId: string;
  assetId: string;
  tickSizeDecimals: number;
  liquidationPrice: Nullable<number>;
  stopLossOrders: SubaccountOrder[];
  takeProfitOrders: SubaccountOrder[];
  onViewOrdersClick: (marketId: string) => void;
  positionSide: Nullable<AbacusPositionSides>;
  positionSize: Nullable<number>;
  isDisabled?: boolean;
};

export const PositionsTriggersCell = ({
  marketId,
  assetId,
  tickSizeDecimals,
  liquidationPrice,
  stopLossOrders,
  takeProfitOrders,
  onViewOrdersClick,
  positionSide,
  positionSize,
  isDisabled,
}: ElementProps) => {
  const stringGetter = useStringGetter();
  const dispatch = useDispatch();
  const { isSlTpLimitOrdersEnabled } = useEnvFeatures();

  const onViewOrders = isDisabled ? null : () => onViewOrdersClick(marketId);

  const showLiquidationWarning = (order: SubaccountOrder) => {
    if (!isStopLossOrder(order, isSlTpLimitOrdersEnabled) || !liquidationPrice) {
      return false;
    }
    return (
      (positionSide === AbacusPositionSide.SHORT &&
        (order.triggerPrice ?? order.price) > liquidationPrice) ||
      (positionSide === AbacusPositionSide.LONG &&
        (order.triggerPrice ?? order.price) < liquidationPrice)
    );
  };

  const openTriggersDialog = () => {
    dispatch(
      openDialog({
        type: DialogTypes.Triggers,
        dialogProps: {
          marketId,
          assetId,
          stopLossOrders,
          takeProfitOrders,
          navigateToMarketOrders: onViewOrders,
        },
      })
    );
  };

  const viewOrdersButton = (
    <Styled.Button action={ButtonAction.Navigation} size={ButtonSize.XSmall} onClick={onViewOrders}>
      {stringGetter({ key: STRING_KEYS.VIEW_ORDERS })}
      {<Styled.ArrowIcon iconName={IconName.Arrow} />}
    </Styled.Button>
  );

  const renderOutput = ({ label, orders }: { label: string; orders: SubaccountOrder[] }) => {
    const triggerLabel = ({
      liquidationWarningSide,
    }: {
      liquidationWarningSide?: Nullable<AbacusPositionSides>;
    }) => {
      const styledLabel = <Styled.Label warning={liquidationWarningSide}>{label}</Styled.Label>;
      return liquidationWarningSide ? (
        <WithHovercard
          align="start"
          side="left"
          hovercard={
            liquidationWarningSide === AbacusPositionSide.LONG
              ? 'liquidation-warning-long'
              : 'liquidation-warning-short'
          }
          slotButton={
            <Button
              action={ButtonAction.Primary}
              size={ButtonSize.Small}
              onClick={openTriggersDialog}
            >
              {stringGetter({ key: STRING_KEYS.EDIT_STOP_LOSS })}
            </Button>
          }
          slotTrigger={styledLabel}
        />
      ) : (
        styledLabel
      );
    };

    if (orders.length === 0) {
      return (
        <>
          {triggerLabel({})} <Styled.Output type={OutputType.Fiat} value={null} />
        </>
      );
    }

    if (orders.length === 1) {
      const order = orders[0];
      const { size, triggerPrice } = order;

      const isPartialPosition = !!(positionSize && Math.abs(size) < Math.abs(positionSize));
      const liquidationWarningSide = showLiquidationWarning(order) ? positionSide : undefined;

      return (
        <>
          {triggerLabel({ liquidationWarningSide })}
          <Styled.Output
            type={OutputType.Fiat}
            value={triggerPrice}
            fractionDigits={tickSizeDecimals}
          />
          {isPartialPosition && (
            <WithHovercard
              align="end"
              side="top"
              hovercard={
                isStopLossOrder(order, isSlTpLimitOrdersEnabled)
                  ? 'partial-close-stop-loss'
                  : 'partial-close-take-profit'
              }
              slotButton={
                <Button
                  action={ButtonAction.Primary}
                  size={ButtonSize.Small}
                  onClick={openTriggersDialog}
                >
                  {stringGetter({
                    key: isStopLossOrder(order, isSlTpLimitOrdersEnabled)
                      ? STRING_KEYS.EDIT_STOP_LOSS
                      : STRING_KEYS.EDIT_TAKE_PROFIT,
                  })}
                </Button>
              }
              slotTrigger={
                <Styled.PartialFillIcon>
                  <Icon iconName={IconName.PositionPartial} />
                </Styled.PartialFillIcon>
              }
            />
          )}
        </>
      );
    }

    return (
      <>
        {triggerLabel({})}
        {viewOrdersButton}
      </>
    );
  };

  return (
    <Styled.Cell>
      <Styled.Row>{renderOutput({ label: 'TP', orders: takeProfitOrders })}</Styled.Row>
      <Styled.Row>{renderOutput({ label: 'SL', orders: stopLossOrders })}</Styled.Row>
    </Styled.Cell>
  );
};

const Styled: Record<string, AnyStyledComponent> = {};

Styled.Cell = styled.div`
  ${layoutMixins.column}
  gap: 0.25em;

  color: var(--color-text-1);
`;

Styled.Row = styled.span`
  ${layoutMixins.inlineRow}

  --item-height: 1.25rem;
`;

Styled.Label = styled.div<{ warning?: boolean }>`
  align-items: center;
  border: solid var(--border-width) var(--color-border);
  border-radius: 0.5em;
  display: flex;
  font: var(--font-tiny-book);
  height: var(--item-height);
  padding: 0 0.25rem;

  ${({ warning }) =>
    warning &&
    css`
      background-color: var(--color-warning);
      color: var(--color-black);
    `}
`;

Styled.Output = styled(Output)`
  font: var(--font-mini-medium);
`;

Styled.Button = styled(Button)`
  --button-height: var(--item-height);
  --button-padding: 0;
  --button-textColor: var(--color-text-1);
`;

Styled.ArrowIcon = styled(Icon)`
  stroke-width: 2;
`;

Styled.PartialFillIcon = styled.span`
  svg {
    display: block;

    width: 0.875em;
    height: 0.875em;
  }
`;
