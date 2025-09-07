# Implementation Plan

- [x] 1. Set up project foundation and configuration



  - Create Next.js 14 project with TypeScript and essential configuration files
  - Configure Tailwind CSS with custom design tokens and PostCSS
  - Set up ESLint, Prettier, and TypeScript strict mode configuration
  - Create package.json with all required dependencies and scripts
  - _Requirements: 9.1, 9.2, 9.5_

- [x] 2. Implement core type definitions and API client






  - Create comprehensive TypeScript interfaces for Learner, Nudge, and API responses
  - Implement centralized API client with error handling and request/response normalization
  - Create custom error classes for different API failure scenarios
  - Write utility functions for data formatting and validation
  - _Requirements: 9.1, 8.1, 8.2, 8.3_

- [x] 3. Create base UI component library



  - Implement Button component with primary, secondary, and ghost variants
  - Create Input component with validation states and accessibility attributes
  - Build Modal component using Radix Dialog with focus trap and keyboard navigation
  - Implement Skeleton component for loading states across the application
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [x] 4. Set up application layout and navigation


  - Create root layout with React Query provider and theme configuration
  - Implement responsive NavBar with desktop horizontal links and mobile burger menu
  - Build Hero component with Framer Motion animations and original illustrations
  - Create Footer component with proper semantic HTML structure
  - _Requirements: 7.1, 7.2, 7.3, 6.1, 6.2_

- [x] 5. Implement data fetching hooks with React Query


  - Create useLearners hook with infinite query, cursor pagination, and filter support
  - Implement useNudge hook for streaming AI nudge generation with abort capability
  - Add error handling, retry logic, and cache invalidation strategies
  - Create prefetching utilities for performance optimization
  - _Requirements: 5.1, 5.2, 5.3, 5.5, 2.1, 2.2, 2.3, 2.6_

- [x] 6. Build learner management components



  - Create LearnerCard component with risk badges, selection state, and accessibility attributes
  - Implement CardGrid component with responsive layout and empty state handling
  - Build FilterPanel with search input, risk filter dropdown, and sort controls
  - Add debounced search functionality and filter state management
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 5.4, 6.1, 6.2_

- [x] 7. Implement streaming nudge interface


  - Create NudgeModal component with real-time text streaming display
  - Implement streaming text parser for chunked responses and SSE events
  - Add cancel functionality with AbortController and timeout handling
  - Build fallback detection and display for non-streaming responses
  - Create rate limiting and cooldown mechanisms for nudge generation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 6.5_

- [x] 8. Create dashboard page with risk visualization



  - Build main dashboard page layout with filter integration and learner grid
  - Implement RiskChart component using Recharts for risk distribution visualization
  - Create top at-risk learners list with quick action capabilities
  - Add bulk selection and bulk nudge generation functionality
  - Integrate real-time data updates with React Query cache invalidation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.5_

- [x] 9. Implement learner detail page



  - Create individual learner profile page with comprehensive information display
  - Build progress timeline component showing login history and quiz performance
  - Integrate nudge generation interface within learner detail context
  - Add navigation breadcrumbs and back-to-dashboard functionality
  - Implement data prefetching for smooth navigation experience
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 10. Build admin simulation interface


  - Create admin page with bulk risk simulation controls
  - Implement progress modal showing simulation status and processed counts
  - Add cooldown enforcement to prevent concurrent simulation executions
  - Create success/error feedback with detailed processing results
  - Integrate cache invalidation after successful simulation completion
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 11. Implement error handling and offline support


  - Create ErrorBoundary component for graceful error recovery
  - Build offline detection and user feedback systems
  - Implement retry mechanisms with exponential backoff for failed requests
  - Add rate limiting detection and user-friendly error messages
  - Create toast notification system for user feedback
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 12. Add accessibility features and keyboard navigation



  - Implement comprehensive ARIA labels and live regions for dynamic content
  - Create focus management utilities and keyboard navigation patterns
  - Add screen reader announcements for streaming content updates
  - Ensure color contrast compliance and visible focus indicators
  - Test and validate accessibility with automated and manual testing
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 13. Optimize performance and implement caching



  - Add code splitting and lazy loading for heavy components and routes
  - Implement React Query caching strategies with appropriate stale times
  - Create bundle optimization with webpack configuration
  - Add image optimization and lazy loading for visual assets
  - Implement prefetching strategies for improved navigation performance
  - _Requirements: 5.1, 5.2, 5.5, 7.1, 7.2_

- [ ] 14. Create comprehensive test suite




  - Write unit tests for useNudge streaming logic with mocked ReadableStream
  - Create unit tests for useLearners pagination and filtering logic
  - Implement integration tests for dashboard filtering and learner selection
  - Add unit tests for error handling and retry mechanisms
  - Create tests for accessibility features and keyboard navigation
  - _Requirements: 9.4, 9.5_
- [ ] 15. Set up end-to-end testing with Playwright


- [ ] 15. Set up end-to-end testing with Playwright

  - Create E2E test for complete nudge generation flow with streaming simulation
  - Implement E2E test for dashboard filtering and pagination workflows
  - Add E2E test for admin simulation process with progress tracking
  - Create accessibility testing scenarios with keyboard-only navigation
  - Set up CI/CD pipeline integration for automated E2E test execution
  - _Requirements: 9.4, 9.5_
-

- [x] 16. Implement responsive design and mobile optimization




  - Ensure all components work seamlessly across desktop, tablet, and mobile viewports
  - Optimize touch interactions and gesture support for mobile devices
  - Implement adaptive navigation patterns for different screen sizes
  - Add mobile-specific optimizations for performance and usability
  - Test and validate responsive behavior across multiple device types
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 17. Create landing page with original content and design





  - Build Hero section with original copy, CTAs, and decorative illustrations
  - Implement features showcase section highlighting platform capabilities
  - Create trust indicators and social proof elements with original content
  - Add call-to-action sections driving users to dashboard and registration
  - Ensure landing page follows upGrad-inspired UX patterns with original branding
  - _Requirements: 7.1, 7.2, 7.3_
-

- [x] 18. Set up CI/CD pipeline and deployment configuration




  - Create GitHub Actions workflow for linting, type checking, and testing
  - Configure Vercel deployment settings with environment variable management
  - Set up automated testing pipeline with unit and integration test execution
  - Create deployment checklist and environment configuration documentation
  - Add health check integration and API connectivity validation
  - _Requirements: 9.5_