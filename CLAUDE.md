# CLAUDE.md - Guidelines for Rundler Server

## Build & Development Commands
- Setup: `yarn install` - Install dependencies
- Start: `yarn start` - Run the development server
- Build: `yarn build` - Create production build
- Lint: `yarn lint` - Check code style
- Test: `yarn test` - Run all tests
- Single test: `yarn test -t "test name"` - Run specific test

## Code Style Guidelines
- Use TypeScript for type safety
- Follow functional programming principles when possible
- Indent with 2 spaces
- Use camelCase for variables and functions, PascalCase for classes/interfaces
- Imports: group and order by 1) node modules 2) local modules
- Error handling: use try/catch with specific error types
- Prefer async/await over Promise chains
- Document public APIs with JSDoc comments
- Use meaningful variable names that explain purpose