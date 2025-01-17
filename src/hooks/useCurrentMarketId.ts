import { useEffect, useMemo } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useMatch, useNavigate } from 'react-router-dom';

import { SubaccountPosition } from '@/constants/abacus';
import { TradeBoxDialogTypes } from '@/constants/dialogs';
import { LocalStorageKey } from '@/constants/localStorage';
import { DEFAULT_MARKETID } from '@/constants/markets';
import { AppRoute } from '@/constants/routes';

import { useLocalStorage } from '@/hooks/useLocalStorage';

import { getOpenPositions } from '@/state/accountSelectors';
import { getSelectedNetwork } from '@/state/appSelectors';
import { closeDialogInTradeBox } from '@/state/dialogs';
import { getActiveTradeBoxDialog } from '@/state/dialogsSelectors';
import { setCurrentMarketId } from '@/state/perpetuals';
import { getMarketIds } from '@/state/perpetualsSelectors';

import abacusStateManager from '@/lib/abacus';

export const useCurrentMarketId = () => {
  const navigate = useNavigate();
  const match = useMatch(`/${AppRoute.Trade}/:marketId`);
  const { marketId } = match?.params ?? {};
  const dispatch = useDispatch();
  const selectedNetwork = useSelector(getSelectedNetwork);
  const openPositions = useSelector(getOpenPositions, shallowEqual);
  const marketIds = useSelector(getMarketIds, shallowEqual);
  const hasMarketIds = marketIds.length > 0;
  const activeTradeBoxDialog = useSelector(getActiveTradeBoxDialog);

  const [lastViewedMarket, setLastViewedMarket] = useLocalStorage({
    key: LocalStorageKey.LastViewedMarket,
    defaultValue: DEFAULT_MARKETID,
  });

  const validId = useMemo(() => {
    if (marketIds.length === 0) return marketId ?? lastViewedMarket;
    if (!marketIds.includes(marketId ?? lastViewedMarket)) return DEFAULT_MARKETID;
    return marketId ?? lastViewedMarket;
  }, [hasMarketIds, marketId]);

  useEffect(() => {
    // If v4_markets has not been subscribed to yet or marketId is not specified, default to validId
    if (!hasMarketIds || !marketId) {
      setLastViewedMarket(validId);
      dispatch(setCurrentMarketId(validId));
      dispatch(closeDialogInTradeBox());

      if (validId !== marketId) {
        navigate(`${AppRoute.Trade}/${validId}`, {
          replace: true,
        });
      }
    } else {
      // If v4_markets has been subscribed to, check if marketId is valid
      if (!marketIds.includes(marketId)) {
        // If marketId is not valid (i.e. final settlement), navigate to markets page
        navigate(AppRoute.Markets, {
          replace: true,
        });
      } else {
        // If marketId is valid, set currentMarketId
        setLastViewedMarket(marketId);
        dispatch(setCurrentMarketId(marketId));

        if (
          activeTradeBoxDialog?.type === TradeBoxDialogTypes.ClosePosition &&
          openPositions?.find((position: SubaccountPosition) => position.id === marketId)
        ) {
          // Keep the close positions dialog open between market changes as long as there exists an open position
          return;
        }

        dispatch(closeDialogInTradeBox());
      }
    }
  }, [hasMarketIds, marketId]);

  useEffect(() => {
    // Check for marketIds otherwise Abacus will silently fail its isMarketValid check
    if (marketIds) {
      abacusStateManager.setMarket(marketId ?? DEFAULT_MARKETID);
    }
  }, [selectedNetwork, hasMarketIds, marketId]);
};
