import type {
  AnalyticsEvent,
  AnalyticsEventData,
  AnalyticsUserProperty,
  AnalyticsUserPropertyValue,
} from '@/constants/analytics';

const DEBUG_ANALYTICS = false;

export const identify = <T extends AnalyticsUserProperty>(
  property: T,
  propertyValue: AnalyticsUserPropertyValue<T>
) => {
  if (DEBUG_ANALYTICS) {
    console.log(`[Analytics:Identify] ${property}`, propertyValue);
  }
  const customEvent = new CustomEvent('dydx:identify', {
    detail: { property, propertyValue },
  });

  globalThis.dispatchEvent(customEvent);
};

export const track = <T extends AnalyticsEvent>(
  eventType: T,
  eventData?: AnalyticsEventData<T>
) => {
  if (DEBUG_ANALYTICS) {
    console.log(`[Analytics] ${eventType}`, eventData);
  }
  const customEvent = new CustomEvent('dydx:track', {
    detail: { eventType, eventData },
  });

  globalThis.dispatchEvent(customEvent);
};
