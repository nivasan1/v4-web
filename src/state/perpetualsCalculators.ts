import { createSelector } from 'reselect';

import type { MarketHistoricalFunding } from '@/constants/abacus';
import { FundingDirection } from '@/constants/markets';

import {
  getCurrentMarketHistoricalFundings,
  getCurrentMarketNextFundingRate,
} from '@/state/perpetualsSelectors';

export const calculateFundingRateHistory = createSelector(
  [getCurrentMarketHistoricalFundings, getCurrentMarketNextFundingRate],
  (historicalFundings, nextFundingRate) => {
    const data: Pick<MarketHistoricalFunding, 'effectiveAtMilliseconds' | 'rate'>[] = [
      ...historicalFundings,
    ];

    if (nextFundingRate) {
      data.push({
        effectiveAtMilliseconds: Date.now(),
        rate: nextFundingRate,
      });
    }

    return data.map(({ effectiveAtMilliseconds, rate }) => ({
      time: effectiveAtMilliseconds,
      fundingRate: rate,
      direction:
        rate === 0
          ? FundingDirection.None
          : rate < 0
          ? FundingDirection.ToLong
          : FundingDirection.ToShort,
    }));
  }
);
