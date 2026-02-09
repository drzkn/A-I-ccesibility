# Contributing to AccesibilityHub

Thank you for your interest in contributing to AccesibilityHub! This guide will help you get started with development.

## Requirements

- **Node.js** ≥ 20 (see `.nvmrc` for exact version)
- **pnpm** as package manager (v10.26.2 or compatible)
- **Chrome/Chromium** (automatically downloaded by Puppeteer)

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/drzkn/AccesibilityHub.git
cd AccesibilityHub
pnpm install
```

### 2. Build and Run

```bash
pnpm build    # Build the project
pnpm start    # Run the MCP server
```

### 3. Development Mode

```bash
pnpm dev      # Watch mode - rebuilds on changes
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Build the project with tsup |
| `pnpm dev` | Watch mode - rebuilds on file changes |
| `pnpm start` | Run the compiled MCP server |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm clean` | Remove the dist folder |
| `pnpm format` | Format code with Prettier |
| `pnpm format:check` | Check code formatting |
| `pnpm test` | Run tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm inspect` | Build and open MCP Inspector for debugging |

## Project Structure

```
AccesibilityHub/
├── src/
│   ├── server.ts               # MCP server entry point
│   ├── tools/                  # Accessibility analysis tools
│   │   ├── Axe/                # axe-core integration
│   │   ├── Pa11y/              # Pa11y integration
│   │   ├── Contrast/           # Color contrast analysis
│   │   ├── AnalyzeMixed/       # Combined multi-tool analysis
│   │   └── Base/               # Shared base utilities
│   ├── prompts/                # MCP prompt templates
│   │   ├── audit/              # Audit prompts
│   │   ├── contrast/           # Contrast prompts
│   │   ├── educational/        # Educational prompts
│   │   ├── workflows/          # Workflow prompts
│   │   └── types/              # Prompt type definitions
│   ├── resources/              # MCP resources (WCAG data, thresholds)
│   │   ├── wcag/               # WCAG criteria data
│   │   ├── contrast/           # Contrast threshold data
│   │   └── types/              # Resource type definitions
│   └── shared/                 # Shared utilities across modules
│       ├── adapters/           # Base adapters
│       ├── data/               # Static data (wcag-criteria.json)
│       ├── normalizers/        # Data normalizers
│       ├── types/              # Shared type definitions
│       └── utils/              # Utility functions
├── tests/                      # Test files (mirrors src/ structure)
├── docs/                       # Documentation
├── scripts/                    # Build and utility scripts
└── .cursor/
    ├── commands/               # Cursor commands (e.g., create-tool.md)
    └── rules/                  # Project conventions
```

## Tool Structure

Each tool follows a modular structure. When creating or modifying tools, follow this pattern:

```
ToolName/
├── index.ts           # Public exports
├── main.ts            # Main logic, MCP registration, handlers
├── adapters/          # External library integrations
│   ├── toolname.adapter.ts
│   └── index.ts
├── normalizers/       # Input/output data transformation
│   ├── toolname.normalizer.ts
│   └── index.ts
├── types/             # TypeScript types and interfaces
│   ├── toolname.type.ts
│   └── index.ts
└── utils/             # Helper functions
    ├── toolname.utils.ts
    └── index.ts
```

### Available Tools

| Tool | Description |
|------|-------------|
| **Axe** | Accessibility analysis using axe-core |
| **Pa11y** | Accessibility analysis using Pa11y |
| **Contrast** | Color contrast analysis (WCAG 2.1 / APCA) |
| **AnalyzeMixed** | Combined analysis using multiple tools |
| **Base** | Shared base utilities for all tools |

## Naming Conventions

### Folders
- Tool folders use **PascalCase**: `AnalyzeMixed`, `Axe`, `Pa11y`
- Internal subfolders use **lowercase**: `adapters`, `normalizers`, `types`, `utils`

### Files
- TypeScript files use **kebab-case** or **toolname.category.ts** pattern
- Examples: `main.ts`, `index.ts`, `pa11y.adapter.ts`, `axe.types.ts`
- Each subfolder must have an `index.ts` that re-exports its public content
- JSON data files use **kebab-case**: `wcag-criteria.json`

### Index Files
- `index.ts` files should **only re-export**, never contain logic
- Example: `export * from './pa11y.adapter.js';`

## Subfolder Responsibilities

| Folder | Purpose |
|--------|---------|
| `main.ts` | Main tool logic, MCP registration, request handlers |
| `adapters/` | Wrappers for external libraries (axe-core, pa11y) |
| `normalizers/` | Transform input/output data to standard formats |
| `types/` | Tool-specific TypeScript interfaces and types |
| `utils/` | Pure helper functions specific to the tool |
| `data/` | Static data files and default configurations |

## Creating a New Tool

To create a new tool, follow the template in `.cursor/commands/create-tool.md`. This ensures consistency across all tools.

Basic steps:
1. Create the tool folder in `src/tools/` using PascalCase
2. Follow the folder structure above
3. Register the tool in `src/tools/index.ts`
4. Add tests in `tests/tools/YourTool/`
5. Document in `docs/tools/your-tool.md`

## Testing

Tests are located in the `tests/` folder, mirroring the `src/` structure.

```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage report
```

### Test Helpers

- `tests/helpers/mock-server.ts` - Mock MCP server for tool testing
- `tests/helpers/mock-prompt-server.ts` - Mock server for prompt testing
- `tests/helpers/mock-resource-server.ts` - Mock server for resource testing
- `tests/fixtures/html-fixtures.ts` - HTML fixtures for testing

## Code Style

- **Prettier** for formatting (run `pnpm format`)
- **TypeScript** strict mode enabled
- **ESM** modules (type: "module" in package.json)

## Pull Request Guidelines

1. **Create a feature branch** from `master`
2. **Follow the conventions** described in this guide
3. **Add tests** for new functionality
4. **Run the full test suite** before submitting
5. **Update documentation** if adding new features
6. **Keep commits focused** and descriptive

### Before Submitting

```bash
pnpm format:check     # Verify formatting
pnpm typecheck        # Check types
pnpm test             # Run tests
pnpm build            # Verify build
```

## Debugging with MCP Inspector

Use the MCP Inspector to debug and test the server interactively:

```bash
pnpm inspect
```

This builds the project and opens the MCP Inspector connected to your local server.

## Questions?

If you have questions or need help, please [open an issue](https://github.com/drzkn/A-I-ccesibility/issues).
