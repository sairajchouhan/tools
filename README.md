# Daily Dev Tools

A collection of simple, fast utilities to streamline your daily development workflow. Built with modern web technologies for a smooth, responsive experience.

## Features

### URL Parser

Parse and visualize URL components with an interactive editor:

- Break down URLs into protocol, domain, path segments, and query parameters
- Drag-and-drop reordering of path segments and query params
- Compare two URLs side-by-side with match scoring
- Copy individual components or full comparison summaries

### JSON Diff

Compare JSON objects with a visual side-by-side diff viewer:

- Syntax-highlighted comparison with color-coded changes
- Synchronized scrolling between panels
- AI-powered diff summarization (via Google Gemini)
- Load sample data for quick testing

### JSON Formatter

Format and validate JSON with instant feedback:

- Real-time formatting as you type
- Validation with clear error messages
- Copy formatted output to clipboard
- Clean, readable output with proper indentation

## Tech Stack

| Layer               | Technology                                       |
| ------------------- | ------------------------------------------------ |
| **Monorepo**        | Turborepo                                        |
| **Frontend**        | React 19, Vite, TailwindCSS v4, TanStack Router  |
| **Backend**         | Next.js 15, Vercel AI SDK                        |
| **AI**              | Google Gemini (gemini-2.0-flash)                 |
| **UI Components**   | Radix UI, Lucide Icons, class-variance-authority |
| **Package Manager** | Bun                                              |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.2.5 or higher
- [Node.js](https://nodejs.org/) v18 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/daily-dev-tools.git
cd daily-dev-tools

# Install dependencies
bun install
```

### Environment Setup

Create environment files for local development:

**Frontend** (`apps/frontend/.env`):

```env
VITE_BACKEND_URL=http://localhost:3001
```

**Backend** (`apps/backend/.env`):

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### Development

```bash
# Run both frontend and backend in dev mode
bun run dev

# Run only frontend (http://localhost:5173)
bunx turbo run dev --filter=tools-frontend

# Run only backend (http://localhost:3000)
bunx turbo run dev --filter=tools-backend
```

### Build

```bash
# Build all apps
bun run build

# Build specific app
bunx turbo run build --filter=tools-frontend
```

## Project Structure

```
daily-dev-tools/
├── apps/
│   ├── frontend/              # React + Vite application
│   │   ├── src/
│   │   │   ├── components/    # Reusable UI components
│   │   │   │   └── ui/        # Base components (Button, Input, etc.)
│   │   │   ├── lib/           # Utilities and helpers
│   │   │   └── routes/        # TanStack Router pages
│   │   └── package.json
│   │
│   └── backend/               # Next.js API server
│       └── src/
│           └── app/
│               └── api/       # API routes
│
├── turbo.json                 # Turborepo configuration
├── AGENTS.md                  # Guidelines for AI coding agents
└── package.json               # Root workspace config
```

## Scripts

| Command               | Description                        |
| --------------------- | ---------------------------------- |
| `bun run dev`         | Start all apps in development mode |
| `bun run build`       | Build all apps for production      |
| `bun run lint`        | Run ESLint across all apps         |
| `bun run format`      | Format code with Prettier          |
| `bun run check-types` | Run TypeScript type checking       |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
