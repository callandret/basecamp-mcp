# Basecamp MCP Server

An MCP (Model Context Protocol) server that integrates Basecamp 3 with Claude, enabling AI-powered project management.

## Features

- **Projects**: List, view, and manage Basecamp projects
- **To-dos**: Create, update, complete, and organize to-do items
- **To-do Lists**: Full CRUD operations on to-do lists
- **To-do List Groups**: Create and organize sections within to-do lists with color coding
- **Documents & Vaults**: Create and manage documents and folders
- **Messages**: Read and create messages on message boards
- **Comments**: Add and view comments on any recordable
- **Campfires**: Send and read chat messages
- **Card Tables**: Manage cards, columns, and steps
- **Schedule**: View and create schedule entries
- **People**: List and view team members
- **Attachments & Uploads**: Manage files and attachments
- **Search**: Search across all Basecamp content

## Prerequisites

- Node.js 18+
- A Basecamp 3 account (or higher)
- Basecamp API credentials (Client ID and Client Secret)

## Installation

### From npm (when published)

```bash
npm install -g basecamp-mcp
```

### From source

```bash
git clone https://github.com/callandret/basecamp-mcp.git
cd basecamp-mcp
npm install
npm run build
```

## Basecamp API Setup

1. Go to [Basecamp Integrations](https://launchpad.37signals.com/integrations)
2. Click "Register another application"
3. Fill in your app details:
   - **Name**: Claude MCP Integration
   - **Redirect URI**: `http://localhost:3000/callback`
4. Save and note your **Client ID** and **Client Secret**

## Configuration

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "basecamp": {
      "command": "node",
      "args": ["/path/to/basecamp-mcp/dist/index.js"],
      "env": {
        "BASECAMP_CLIENT_ID": "your_client_id",
        "BASECAMP_CLIENT_SECRET": "your_client_secret",
        "BASECAMP_CONTACT_EMAIL": "your_email@example.com"
      }
    }
  }
}
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BASECAMP_CLIENT_ID` | Yes | Your Basecamp OAuth Client ID |
| `BASECAMP_CLIENT_SECRET` | Yes | Your Basecamp OAuth Client Secret |
| `BASECAMP_CONTACT_EMAIL` | Yes | Contact email for Basecamp API User-Agent |
| `BASECAMP_REDIRECT_URI` | No | OAuth callback URL (default: `http://localhost:3000/callback`) |
| `BASECAMP_APP_NAME` | No | App name for User-Agent (default: `Claude MCP`) |

## Usage

Once configured, restart Claude Desktop. You can then ask Claude to:

- "Show me all my Basecamp projects"
- "Create a new to-do in Project X"
- "What's on my schedule this week?"
- "Search for documents about budget"
- "Post a message to the team"

## Authentication

On first use, the server will open a browser window for Basecamp OAuth authentication. After authorizing, the token is cached locally for future use.

## Available Tools

| Tool | Description |
|------|-------------|
| `list_projects` | List all Basecamp projects |
| `get_project` | Get project details |
| `get_todoset` | Get project's to-do set |
| `get_todolists` | List to-do lists |
| `get_todos` | List to-dos in a list |
| `create_todo` | Create a new to-do |
| `complete_todo` | Mark to-do as complete |
| `get_todolist_groups` | List groups/sections in a to-do list |
| `create_todolist_group` | Create a group with optional color |
| `reposition_todolist_group` | Reorder groups within a list |
| `get_documents` | List documents in a vault |
| `create_document` | Create a new document |
| `get_messages` | List message board messages |
| `create_message` | Post a new message |
| `get_campfire_lines` | Read campfire chat |
| `create_campfire_line` | Send a chat message |
| `search` | Search across Basecamp |
| ... and 35+ more |

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Test with MCP Inspector
npm run inspect
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
