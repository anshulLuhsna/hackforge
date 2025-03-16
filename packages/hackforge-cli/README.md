# Hackforge CLI

Hackforge CLI is a command-line tool for working with Next.js project scaffolds generated on the Hackforge platform.

## Installation

```bash
npm install -g hackforge-cli
```

Or use it directly with npx:

```bash
npx hackforge-cli <command>
```

## Commands

### `init`

Initialize a new Next.js project with a given name.

```bash
npx hackforge-cli init <project-name>
```

### `copy`

Download and set up a project scaffold from the Hackforge server to a local directory.

```bash
npx hackforge-cli copy <project-id> <destination>
```

#### Arguments:

- `<project-id>`: The unique identifier for a project generated on the Hackforge web platform.
- `<destination>`: The local directory path where the project files should be placed.

#### Authentication:

You will be prompted to authenticate with your Hackforge credentials the first time you use the `copy` command. The authentication token will be saved for future use.

#### Example:

```bash
# Download project with ID 'abc123' to a folder named 'my-project'
npx hackforge-cli copy abc123 my-project
```

## Development

To contribute to the development of the Hackforge CLI:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/hackforge.git
   cd hackforge/packages/hackforge-cli
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the package:
   ```bash
   npm run build
   ```

4. Link the package locally:
   ```bash
   npm link
   ```

5. Run the CLI:
   ```bash
   hackforge --help
   ```

## License

MIT 