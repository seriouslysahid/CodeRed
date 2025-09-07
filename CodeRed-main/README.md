# CodeRed Frontend

<div align="center">

![CodeRed Logo](https://via.placeholder.com/200x80/1f2937/ffffff?text=CodeRed)

**AI-Powered Learner Management Platform**

[![Build Status](https://github.com/your-org/codered-frontend/workflows/CI/badge.svg)](https://github.com/your-org/codered-frontend/actions)
[![Coverage](https://codecov.io/gh/your-org/codered-frontend/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/codered-frontend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)

[Live Demo](https://codered-demo.vercel.app) • [Documentation](./docs) • [API Reference](./docs/api.md) • [Contributing](./CONTRIBUTING.md)

</div>

---

## 🚀 Overview

CodeRed is a modern, serverless educational platform that identifies at-risk learners and provides personalized AI-powered nudges to improve engagement and outcomes. Built with Next.js 14, TypeScript, and Google Gemini AI, it offers real-time analytics, comprehensive learner management, and intelligent intervention systems.

### ✨ Key Features

- 🎯 **Engagement & Retention Intelligence**: Real-time learner engagement dashboard that predicts drop-offs and auto-triggers personalized nudges
- 🤖 **AI-Powered Risk Detection**: Advanced algorithms identify at-risk learners before they fall behind
- ⚡ **Auto-triggered Nudges**: Automatically send reminders, micro-assessments, peer challenges, and mentor connections
- 📊 **Live Activity Monitoring**: Real-time activity feeds with learner actions, quiz completions, and engagement metrics
- 🎨 **Modern Reactive UI**: Mouse-responsive animations, pulsing indicators, and smooth micro-interactions
- 🌙 **Dark Mode by Default**: Beautiful dark theme with light mode toggle for optimal user experience
- 📈 **Engagement Analytics**: Visual progress meters showing active engagement, retention rates, and nudge success
- 🔍 **Intelligent Search**: Advanced filtering, sorting, and pagination for large learner datasets
- ♿ **Accessibility First**: WCAG AA compliant with comprehensive keyboard navigation and screen reader support
- 📱 **Responsive Design**: Mobile-first approach with adaptive layouts across all devices
- ⚡ **Performance Optimized**: Code splitting, lazy loading, virtual lists, and intelligent caching
- 🧪 **Production Ready**: Comprehensive testing suite with unit, integration, and E2E tests
- 🔒 **Security Focused**: Built-in security headers, input validation, and error boundaries

## 🛠️ Tech Stack

<table>
<tr>
<td>

**Frontend**
- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [TypeScript 5.5](https://www.typescriptlang.org/) - Type-safe JavaScript
- [React 18](https://react.dev/) - UI library with concurrent features
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

</td>
<td>

**Backend & Database**
- [Supabase](https://supabase.com/) - Backend-as-a-Service
- [PostgreSQL](https://www.postgresql.org/) - Relational database
- [Google Gemini AI](https://ai.google.dev/) - AI text generation
- Next.js API Routes - Serverless functions

</td>
</tr>
<tr>
<td>

**State & Forms**
- [TanStack Query](https://tanstack.com/query) - Data fetching & caching
- [React Hook Form](https://react-hook-form.com/) - Form management
- [Zod](https://zod.dev/) - Schema validation
- [Zustand](https://zustand-demo.pmnd.rs/) - Lightweight state management

</td>
<td>

**UI & Animation**
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Recharts](https://recharts.org/) - Data visualization
- [Lucide React](https://lucide.dev/) - Icon library
- **Custom Components**: AnimatedBackground, PulseIndicator, EngagementMeter, LiveActivityFeed

</td>
</tr>
<tr>
<td>

**Testing & Quality**
- [Vitest](https://vitest.dev/) - Unit testing framework
- [Playwright](https://playwright.dev/) - E2E testing
- [Testing Library](https://testing-library.com/) - Testing utilities
- [Storybook](https://storybook.js.org/) - Component development

</td>
<td>

**DevOps & Deployment**
- [Vercel](https://vercel.com/) - Deployment platform
- [GitHub Actions](https://github.com/features/actions) - CI/CD pipeline
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) - Code quality
- [Husky](https://typicode.github.io/husky/) - Git hooks

</td>
</tr>
</table>

## Getting Started

### Prerequisites

- **Node.js 18.17.0 or higher** - [Download here](https://nodejs.org/)
- **npm package manager** (comes with Node.js)
- **Git** (for cloning the repository)

### Quick Start Guide

Follow these steps to get the CodeRed frontend running locally:

#### Step 1: Navigate to the Project Directory
```bash
# For Windows PowerShell/Command Prompt
cd CodeRed-main

# For macOS/Linux Terminal
cd CodeRed-main
```

#### Step 2: Install Dependencies
```bash
npm install
```
*This will install all required packages. It may take 2-3 minutes.*

#### Step 3: Start the Development Server
```bash
npm run dev
```

#### Step 4: Open Your Browser
Navigate to: **http://localhost:3000**

---

### Detailed Installation (Alternative Method)

If you prefer a more detailed setup:

1. **Clone the repository** (if not already downloaded)
   ```bash
   git clone <repository-url>
   cd CodeRed-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   # Copy environment template
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and configure:
   - `NEXT_PUBLIC_API_BASE`: Your CodeRed backend API URL
   - Other optional environment variables as needed

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Troubleshooting

**If you get "Missing script" errors:**
- Make sure you're in the correct directory: `CodeRed-main`
- Verify you have Node.js installed: `node --version`
- Try running: `npm install` again

**If the site doesn't load:**
- Check that the development server is running (you should see "Ready" in the terminal)
- Try refreshing your browser
- Check the terminal for any error messages

**For Windows PowerShell users:**
- Use `;` instead of `&&` to chain commands
- Example: `cd CodeRed-main; npm run dev`

### Environment Configuration

#### Required Variables

- `NEXT_PUBLIC_API_BASE`: Base URL for the CodeRed backend API
  - Development: `http://localhost:3000/api` (if backend is on same port)
  - Production: `https://your-backend-domain.com/api`

#### Optional Variables

- `NEXT_PUBLIC_ADMIN_API_KEY`: Admin API key for protected operations
- `NEXT_PUBLIC_ENABLE_DEVTOOLS`: Enable React Query devtools in development
- `NEXT_PUBLIC_ANALYTICS_ID`: Analytics tracking ID

## Development

### 📜 Available Scripts

<table>
<tr>
<th>Command</th>
<th>Description</th>
<th>Usage</th>
</tr>
<tr>
<td><code>npm run dev</code></td>
<td>Start development server</td>
<td>Development with hot reload</td>
</tr>
<tr>
<td><code>npm run build</code></td>
<td>Build for production</td>
<td>Optimized production build</td>
</tr>
<tr>
<td><code>npm run start</code></td>
<td>Start production server</td>
<td>Serve production build</td>
</tr>
<tr>
<td><code>npm run lint</code></td>
<td>Run ESLint</td>
<td>Check code quality</td>
</tr>
<tr>
<td><code>npm run lint:fix</code></td>
<td>Fix ESLint issues</td>
<td>Auto-fix linting problems</td>
</tr>
<tr>
<td><code>npm run type-check</code></td>
<td>Run TypeScript checking</td>
<td>Validate type safety</td>
</tr>
<tr>
<td><code>npm run test</code></td>
<td>Run unit tests</td>
<td>Execute test suite</td>
</tr>
<tr>
<td><code>npm run test:watch</code></td>
<td>Run tests in watch mode</td>
<td>Continuous testing</td>
</tr>
<tr>
<td><code>npm run test:coverage</code></td>
<td>Run tests with coverage</td>
<td>Generate coverage report</td>
</tr>
<tr>
<td><code>npm run test:e2e</code></td>
<td>Run E2E tests</td>
<td>End-to-end testing</td>
</tr>
<tr>
<td><code>npm run storybook</code></td>
<td>Start Storybook</td>
<td>Component development</td>
</tr>
<tr>
<td><code>npm run ci</code></td>
<td>Run full CI pipeline</td>
<td>Lint + Type-check + Test + Build</td>
</tr>
</table>

### 📁 Project Structure

```
codered-frontend/
├── 📁 app/                          # Next.js App Router
│   ├── 📄 layout.tsx               # Root layout with providers
│   ├── 📄 page.tsx                 # Landing page
│   ├── 📄 providers.tsx            # Global providers setup
│   ├── 📁 dashboard/               # Analytics dashboard
│   ├── 📁 learners/                # Learner management
│   │   └── 📁 [id]/               # Dynamic learner details
│   ├── 📁 admin/                   # Administrative interface
│   └── 📁 api/                     # API routes
│       ├── 📁 learners/           # Learner CRUD operations
│       ├── 📁 health/             # Health check endpoint
│       └── 📁 simulate/           # Risk simulation
├── 📁 components/                   # React components
│   ├── 📁 ui/                      # Base UI components (Button, Input, etc.)
│   ├── 📁 layout/                  # Layout components (NavBar, Footer)
│   ├── 📁 landing/                 # Landing page components
│   ├── 📁 dashboard/               # Dashboard-specific components
│   ├── 📁 learners/                # Learner management components
│   ├── 📁 nudges/                  # AI nudging interface
│   ├── 📁 admin/                   # Admin panel components
│   ├── 📁 accessibility/           # Accessibility utilities
│   ├── 📁 performance/             # Performance optimization
│   └── 📁 error/                   # Error handling components
├── 📁 lib/                         # Core utilities and business logic
│   ├── 📄 types.ts                 # TypeScript type definitions
│   ├── 📄 api-client.ts            # Centralized API client
│   ├── 📄 supabase.ts              # Database integration
│   ├── 📄 gemini.ts                # AI integration
│   ├── 📄 risk.ts                  # Risk assessment engine
│   ├── 📄 streaming.ts             # Real-time text processing
│   ├── 📄 errors.ts                # Error handling utilities
│   ├── 📄 validation.ts            # Data validation schemas
│   └── 📄 utils.ts                 # Common utility functions
├── 📁 hooks/                       # Custom React hooks
│   ├── 📄 useLearners.ts           # Learner data management
│   ├── 📄 useNudge.ts              # AI nudge generation
│   ├── 📄 useAccessibility.ts      # Accessibility features
│   ├── 📄 usePerformance.ts        # Performance monitoring
│   └── 📄 useResponsive.ts         # Responsive design utilities
├── 📁 tests/                       # Test suites
│   ├── 📁 unit/                    # Unit tests
│   ├── 📁 integration/             # Integration tests
│   ├── 📁 e2e/                     # End-to-end tests
│   └── 📄 setup.tsx                # Test configuration
├── 📁 docs/                        # Documentation
│   ├── 📄 api.md                   # API documentation
│   ├── 📄 deployment.md            # Deployment guide
│   ├── 📄 accessibility.md         # Accessibility guidelines
│   └── 📄 contributing.md          # Contribution guidelines
├── 📁 scripts/                     # Build and deployment scripts
├── 📁 public/                      # Static assets
└── 📁 styles/                      # Global styles and themes
```

### Code Quality

This project enforces high code quality standards:

- **TypeScript**: Strict mode with comprehensive type coverage
- **ESLint**: Extended rules for React, TypeScript, and accessibility
- **Prettier**: Consistent code formatting with Tailwind CSS plugin
- **Testing**: Unit tests with Vitest, E2E tests with Playwright
- **Accessibility**: WCAG AA compliance with automated testing

### 🔌 API Integration

The frontend integrates with the CodeRed backend through RESTful APIs with streaming support:

<details>
<summary><strong>📋 Core Endpoints</strong></summary>

| Method | Endpoint | Description | Features |
|--------|----------|-------------|----------|
| `GET` | `/api/health` | System health check | Database connectivity, service status |
| `GET` | `/api/learners` | List learners | Pagination, filtering, sorting |
| `GET` | `/api/learners/:id` | Get learner details | Individual learner data |
| `POST` | `/api/learners/:id/nudge` | Generate AI nudge | **Streaming response** |
| `GET` | `/api/learners/risk-distribution` | Risk analytics | Aggregated risk metrics |
| `POST` | `/api/simulate` | Run risk simulation | Bulk risk recalculation |

</details>

<details>
<summary><strong>🔄 Real-time Features</strong></summary>

- **Streaming AI Responses**: Real-time nudge generation with progressive text display
- **Cursor-based Pagination**: Efficient handling of large datasets
- **Optimistic Updates**: Immediate UI feedback with rollback on errors
- **Background Sync**: Automatic data synchronization with conflict resolution

</details>

<details>
<summary><strong>🛡️ Error Handling</strong></summary>

- **Graceful Degradation**: Fallback templates when AI services are unavailable
- **Retry Logic**: Exponential backoff for transient failures
- **Circuit Breaker**: Automatic service isolation during outages
- **User-friendly Messages**: Contextual error messages with recovery suggestions

</details>

## Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e -- --headed
```

### Test Structure

- `tests/unit/` - Unit tests for components and utilities
- `tests/integration/` - Integration tests for page interactions
- `tests/e2e/` - End-to-end tests with Playwright

## Deployment

### CI/CD Pipeline

The project includes a comprehensive CI/CD pipeline with GitHub Actions:

#### Continuous Integration
- **Linting & Type Checking**: ESLint, Prettier, and TypeScript validation
- **Testing**: Unit tests, integration tests, and E2E tests with Playwright
- **Build Verification**: Ensures the application builds successfully
- **Health Checks**: Validates API connectivity and system health

#### Continuous Deployment
- **Automatic Deployment**: Deploys to Vercel on push to main branch
- **Environment Management**: Secure handling of environment variables
- **Post-Deployment Verification**: Automated testing of deployed application
- **Rollback Support**: Easy rollback to previous deployments

### Vercel Deployment (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_API_BASE`
   - `API_BASE_URL`
   - Other required variables from `.env.example`
3. **Configure GitHub Secrets** for CI/CD:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
4. **Deploy** - GitHub Actions will automatically build, test, and deploy

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm run start
   ```

3. **Verify deployment**
   ```bash
   node scripts/verify-deployment.js https://your-domain.com
   ```

### Deployment Checklist

- [ ] **Pre-Deployment**
  - [ ] All tests pass (`npm run ci`)
  - [ ] Environment variables configured
  - [ ] API endpoints accessible
  - [ ] No security vulnerabilities

- [ ] **Deployment**
  - [ ] GitHub Actions pipeline passes
  - [ ] Application builds successfully
  - [ ] Health checks pass
  - [ ] Deployment verification succeeds

- [ ] **Post-Deployment**
  - [ ] Application loads without errors
  - [ ] API connectivity working
  - [ ] All major features functional
  - [ ] Performance metrics acceptable
  - [ ] Security headers present

### Environment Configuration

See `docs/deployment.md` for comprehensive deployment documentation including:
- Environment variable setup
- CI/CD pipeline configuration
- Health check implementation
- Monitoring and alerting
- Troubleshooting guide

## ⚡ Performance

<details>
<summary><strong>🚀 Optimization Strategies</strong></summary>

| Feature | Implementation | Impact |
|---------|---------------|--------|
| **Code Splitting** | Route-based + manual component splitting | Reduced initial bundle size |
| **Caching** | React Query with stale-while-revalidate | Faster data loading |
| **Image Optimization** | Next.js Image with WebP/AVIF | Improved loading times |
| **Bundle Analysis** | Webpack optimization for chunks | Optimized vendor bundles |
| **Lazy Loading** | Dynamic imports for heavy components | Improved page load speed |
| **Virtual Lists** | Windowing for large datasets | Smooth scrolling performance |
| **Prefetching** | Intelligent route and data prefetching | Instant navigation |

</details>

<details>
<summary><strong>📊 Performance Metrics</strong></summary>

- **Lighthouse Score**: 95+ across all categories
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

</details>

## ♿ Accessibility

<details>
<summary><strong>🎯 WCAG AA Compliance</strong></summary>

| Feature | Implementation | Standard |
|---------|---------------|----------|
| **Color Contrast** | 4.5:1 minimum ratio | WCAG 2.1 AA |
| **Keyboard Navigation** | Full keyboard accessibility | WCAG 2.1 AA |
| **Screen Readers** | ARIA labels and live regions | WCAG 2.1 AA |
| **Focus Management** | Logical tab order and focus trapping | WCAG 2.1 AA |
| **Semantic HTML** | Proper heading hierarchy | WCAG 2.1 AA |

</details>

<details>
<summary><strong>🔧 Accessibility Features</strong></summary>

- **Skip Links**: Quick navigation to main content
- **Live Regions**: Dynamic content announcements
- **Focus Indicators**: Clear visual focus states
- **Alternative Text**: Comprehensive image descriptions
- **Reduced Motion**: Respects user motion preferences
- **High Contrast**: Support for high contrast mode
- **Screen Reader Testing**: Validated with NVDA, JAWS, and VoiceOver

</details>

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for detailed information.

<details>
<summary><strong>🚀 Quick Start for Contributors</strong></summary>

1. **Fork & Clone**
   ```bash
   git clone https://github.com/your-username/codered-frontend.git
   cd codered-frontend
   ```

2. **Setup Development Environment**
   ```bash
   npm install
   cp .env.example .env.local
   npm run dev
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make Changes & Test**
   ```bash
   npm run ci  # Runs lint, type-check, test, and build
   ```

5. **Commit & Push**
   ```bash
   git commit -m 'feat: add amazing feature'
   git push origin feature/amazing-feature
   ```

6. **Open Pull Request**
   - Use our PR template
   - Include screenshots for UI changes
   - Ensure all checks pass

</details>

<details>
<summary><strong>📋 Development Guidelines</strong></summary>

- **Code Style**: Follow ESLint and Prettier configurations
- **Commit Messages**: Use [Conventional Commits](https://conventionalcommits.org/)
- **Testing**: Maintain 80%+ test coverage
- **Accessibility**: Ensure WCAG AA compliance
- **Performance**: Monitor bundle size and Core Web Vitals
- **Documentation**: Update docs for new features

</details>

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support & Community

<div align="center">

### 💬 Get Help

[![GitHub Issues](https://img.shields.io/github/issues/your-org/codered-frontend)](https://github.com/your-org/codered-frontend/issues)
[![GitHub Discussions](https://img.shields.io/github/discussions/your-org/codered-frontend)](https://github.com/your-org/codered-frontend/discussions)
[![Discord](https://img.shields.io/discord/your-discord-id?label=Discord&logo=discord)](https://discord.gg/your-invite)

</div>

<details>
<summary><strong>🔍 Getting Support</strong></summary>

- **🐛 Bug Reports**: [Create an issue](https://github.com/your-org/codered-frontend/issues/new?template=bug_report.md)
- **💡 Feature Requests**: [Start a discussion](https://github.com/your-org/codered-frontend/discussions/new?category=ideas)
- **❓ Questions**: [Ask in discussions](https://github.com/your-org/codered-frontend/discussions/new?category=q-a)
- **📚 Documentation**: Check our [docs folder](./docs)
- **💬 Community**: Join our [Discord server](https://discord.gg/your-invite)

</details>

---

<div align="center">

**Made with ❤️ by the CodeRed Team**

[⭐ Star this repo](https://github.com/your-org/codered-frontend) • [🐛 Report Bug](https://github.com/your-org/codered-frontend/issues) • [💡 Request Feature](https://github.com/your-org/codered-frontend/discussions)

</div>