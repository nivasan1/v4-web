import { type NumberFormatValues } from 'react-number-format';
import { shallowEqual, useSelector } from 'react-redux';
import styled, { AnyStyledComponent } from 'styled-components';

import { TradeInputField } from '@/constants/abacus';
import { STRING_KEYS, StringKey } from '@/constants/localization';
import { INTEGER_DECIMALS } from '@/constants/numbers';
import { TimeUnitShort } from '@/constants/time';
import { GOOD_TIL_TIME_TIMESCALE_STRINGS } from '@/constants/trade';

import { useBreakpoints, useStringGetter } from '@/hooks';

import { formMixins } from '@/styles/formMixins';
import { layoutMixins } from '@/styles/layoutMixins';

import { Checkbox } from '@/components/Checkbox';
import { Collapsible } from '@/components/Collapsible';
import { FormInput } from '@/components/FormInput';
import { InputType } from '@/components/Input';
import { SelectItem, SelectMenu } from '@/components/SelectMenu';
import { WithTooltip } from '@/components/WithTooltip';

import { getInputTradeData, getInputTradeOptions } from '@/state/inputsSelectors';

import abacusStateManager from '@/lib/abacus';

export const AdvancedTradeOptions = () => {
  const stringGetter = useStringGetter();
  const { isTablet } = useBreakpoints();
  const currentTradeFormConfig = useSelector(getInputTradeOptions, shallowEqual);
  const inputTradeData = useSelector(getInputTradeData, shallowEqual);

  const { execution, goodTil, postOnly, reduceOnly, timeInForce, type } = inputTradeData || {};

  const {
    executionOptions,
    needsGoodUntil,
    needsPostOnly,
    needsReduceOnly,
    postOnlyTooltip,
    reduceOnlyTooltip,
    timeInForceOptions,
  } = currentTradeFormConfig || {};

  const { duration, unit } = goodTil || {};

  const showPostOnly = needsPostOnly || postOnlyTooltip;
  const showReduceOnly = needsReduceOnly || reduceOnlyTooltip;

  const needsExecution = executionOptions || showPostOnly || showReduceOnly;
  const hasTimeInForce = timeInForceOptions?.toArray()?.length;

  return (
    <Styled.Collapsible
      defaultOpen={!isTablet}
      label={stringGetter({ key: STRING_KEYS.ADVANCED })}
      triggerIconSide="right"
      fullWidth
    >
      <Styled.AdvancedInputsContainer>
        {(hasTimeInForce || needsGoodUntil) && (
          <Styled.AdvancedInputsRow>
            {hasTimeInForce && (
              <Styled.SelectMenu
                value={timeInForce}
                onValueChange={(selectedTimeInForceOption: string) =>
                  abacusStateManager.setTradeValue({
                    value: selectedTimeInForceOption,
                    field: TradeInputField.timeInForceType,
                  })
                }
                label={stringGetter({ key: STRING_KEYS.TIME_IN_FORCE })}
              >
                {timeInForceOptions.toArray().map(({ type, stringKey }) => (
                  <Styled.SelectItem
                    key={type}
                    value={type}
                    label={stringGetter({ key: stringKey as StringKey })}
                  />
                ))}
              </Styled.SelectMenu>
            )}
            {needsGoodUntil && (
              <Styled.FormInput
                id="trade-good-til-time"
                type={InputType.Number}
                decimals={INTEGER_DECIMALS}
                label={stringGetter({
                  key: hasTimeInForce ? STRING_KEYS.TIME : STRING_KEYS.GOOD_TIL_TIME,
                })}
                onChange={({ value }: NumberFormatValues) => {
                  abacusStateManager.setTradeValue({
                    value: Number(value),
                    field: TradeInputField.goodTilDuration,
                  });
                }}
                value={duration ?? ''}
                slotRight={
                  <Styled.InnerSelectMenu
                    value={unit}
                    onValueChange={(goodTilTimeTimescale: string) => {
                      abacusStateManager.setTradeValue({
                        value: goodTilTimeTimescale,
                        field: TradeInputField.goodTilUnit,
                      });
                    }}
                  >
                    {Object.values(TimeUnitShort).map((goodTilTimeTimescale: TimeUnitShort) => (
                      <Styled.InnerSelectItem
                        key={goodTilTimeTimescale}
                        value={goodTilTimeTimescale}
                        label={stringGetter({
                          key: GOOD_TIL_TIME_TIMESCALE_STRINGS[goodTilTimeTimescale],
                        })}
                      />
                    ))}
                  </Styled.InnerSelectMenu>
                }
              />
            )}
          </Styled.AdvancedInputsRow>
        )}
        {needsExecution && (
          <>
            {executionOptions && (
              <Styled.SelectMenu
                value={execution}
                label={stringGetter({ key: STRING_KEYS.EXECUTION })}
                onValueChange={(selectedTimeInForceOption: string) =>
                  abacusStateManager.setTradeValue({
                    value: selectedTimeInForceOption,
                    field: TradeInputField.execution,
                  })
                }
              >
                {executionOptions.toArray().map(({ type, stringKey }) => (
                  <Styled.SelectItem
                    key={type}
                    value={type}
                    label={stringGetter({ key: stringKey as StringKey })}
                  />
                ))}
              </Styled.SelectMenu>
            )}
            {showReduceOnly && (
              <Checkbox
                checked={(reduceOnly && !reduceOnlyTooltip) || false}
                disabled={!!reduceOnlyTooltip}
                onCheckedChange={(checked) =>
                  abacusStateManager.setTradeValue({
                    value: checked,
                    field: TradeInputField.reduceOnly,
                  })
                }
                id="reduce-only"
                label={
                  <WithTooltip
                    tooltip={
                      needsReduceOnly
                        ? 'reduce-only'
                        : reduceOnlyTooltip?.titleStringKey.includes(
                            'REDUCE_ONLY_EXECUTION_IOC_FOK'
                          )
                        ? 'reduce-only-execution-ioc-fok'
                        : 'reduce-only-timeinforce-ioc-fok'
                    }
                    side="right"
                  >
                    {stringGetter({ key: STRING_KEYS.REDUCE_ONLY })}
                  </WithTooltip>
                }
              />
            )}
            {showPostOnly && (
              <Checkbox
                checked={(postOnly && !postOnlyTooltip) || false}
                disabled={!!postOnlyTooltip}
                onCheckedChange={(checked) =>
                  abacusStateManager.setTradeValue({
                    value: checked,
                    field: TradeInputField.postOnly,
                  })
                }
                id="post-only"
                label={
                  <WithTooltip
                    tooltip={needsPostOnly ? 'post-only' : 'post-only-timeinforce-gtt'}
                    side="right"
                  >
                    {stringGetter({ key: STRING_KEYS.POST_ONLY })}
                  </WithTooltip>
                }
              />
            )}
          </>
        )}
      </Styled.AdvancedInputsContainer>
    </Styled.Collapsible>
  );
};

const Styled: Record<string, AnyStyledComponent> = {};

Styled.Collapsible = styled(Collapsible)`
  --trigger-backgroundColor: transparent;
  --trigger-open-backgroundColor: transparent;
  --trigger-textColor: var(--color-text-0);
  --trigger-open-textColor: var(--color-text-0);
  --trigger-padding: 0.75rem 0;

  font: var(--font-small-book);
  outline: none;

  margin: -0.5rem 0;
`;

Styled.AdvancedInputsContainer = styled.div`
  display: grid;
  gap: var(--form-input-gap);
`;

Styled.SelectMenu = styled(SelectMenu)`
  ${formMixins.inputSelectMenu}
`;

Styled.InnerSelectMenu = styled(SelectMenu)`
  ${formMixins.inputInnerSelectMenu}
  --select-menu-trigger-maxWidth: 4rem;
`;

Styled.SelectItem = styled(SelectItem)`
  ${formMixins.inputSelectMenuItem}
`;

Styled.InnerSelectItem = styled(SelectItem)`
  ${formMixins.inputInnerSelectMenuItem}
`;

Styled.AdvancedInputsRow = styled.div`
  ${layoutMixins.gridEqualColumns}
  gap: var(--form-input-gap);
`;

Styled.FormInput = styled(FormInput)`
  input {
    margin-right: 4rem;
  }
`;
