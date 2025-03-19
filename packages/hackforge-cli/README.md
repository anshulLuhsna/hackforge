# Hackforge CLI

A command-line interface tool for Hackforge that allows users to login and download their project details.

## Installation

```bash
# Install globally
npm install -g hackforge

# Or install locally
npm install hackforge
```

Alternatively, you can clone this repository and link it locally:

```bash
git clone <repository-url>
cd hackforge-cli
npm install
npm link
```

## Usage

### Authentication

Before using the CLI tool, you need to authenticate:

```bash
# Start the login process (opens browser)
hackforge login

# Or directly provide a token
hackforge token <your-token>
```

### Managing Projects

List your projects:

```bash
hackforge projects
```

Download a specific project:

```bash
# Download a project by ID
hackforge projects --download <project-id>

# Specify an output file
hackforge projects --download <project-id> --output ./my-project-data.json

# Get output in markdown format
hackforge projects --download <project-id> --format markdown
```

Download all your projects:

```bash
# Download all projects
hackforge projects --all

# Specify an output file
hackforge projects --all --output ./all-projects.json

# Get output in markdown format
hackforge projects --all --format markdown
```

## Available Commands

- `hackforge login` - Authenticate with the Hackforge server
- `hackforge token <token>` - Save an authentication token directly
- `hackforge projects` - List and download your projects

## Options

### Login options

- `-t, --token <token>` - Provide an authentication token directly
- `-w, --web` - Open web browser to get a token (default method)

### Projects options

- `-d, --download <id>` - Download a specific project by ID
- `-o, --output <path>` - Specify output directory/file for downloaded project
- `-a, --all` - Download all your projects
- `-f, --format <format>` - Output format (json or markdown)

## Troubleshooting

If you encounter any issues with the CLI tool, try the following:

1. Ensure you are logged in (run `hackforge login` again)
2. Check your internet connection
3. Make sure you have the correct permissions for writing to the output directory

## License

MIT 