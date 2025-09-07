// Data fetching hooks exports

export {
  useLearners,
  useLearner,
  useRiskDistribution,
  useLearnersPrefetch,
  useLearnersCache,
  useAllLearners,
  learnersKeys,
} from './useLearners';

export {
  useNudges,
  useCreateNudge,
  useStreamNudge,
  useNudgeGeneration,
  useNudgeCache,
  nudgeKeys,
} from './useNudge';

export {
  useSimulationStatus,
  useRunSimulation,
  useSimulationManager,
  simulationKeys,
} from './useSimulation';

export {
  useErrorHandling,
} from './useErrorHandling';
export type { RetryOptions } from './useErrorHandling';

export {
  useLearnerSelection,
} from './useLearnerSelection';
export type { LearnerSelectionState } from './useLearnerSelection';

export {
  useFilterState,
} from './useFilterState';

export {
  useOffline,
  useConnectionQuality,
  useNetworkStatus,
} from './useOffline';

export {
  useRetry,
  useAutoRetry,
  createRetryableFunction,
  useRateLimit,
} from './useRetry';
export type { RetryConfig, RetryState } from './useRetry';

export {
  useToast,
  setGlobalToastHandler,
  getGlobalToast,
  toastUtils,
} from './useToast';
export type { ToastOptions, Toast } from './useToast';

export {
  useFocusManagement,
  useKeyboardNavigation,
  useScreenReader,
  useAriaAttributes,
  useReducedMotion,
  useHighContrast,
  useSkipLinks,
  useColorContrast,
} from './useAccessibility';

export {
  useRenderPerformance,
  useIntersectionObserver,
  useVirtualScrolling,
  useLazyImage,
  useDebounce,
  useThrottle,
  usePerformanceMetrics,
  useMemoryUsage,
  usePrefetch,
} from './usePerformance';

export {
  useResponsive,
  usePrefersReducedMotion,
  useDeviceCapabilities,
} from './useResponsive';