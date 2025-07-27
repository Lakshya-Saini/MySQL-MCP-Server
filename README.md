# MySQL MCP Server

A secure, feature-rich MySQL Model Context Protocol (MCP) server designed for integration with AI assistants like Claude and VS Code GitHub Copilot.

## Features

- 🔐 **Security First**: Built with security best practices, input validation, and configurable access controls
- 🎛️ **Configurable Operations**: Enable/disable CRUD operations based on your needs (fetch enabled by default)
- 📊 **Tabular Data Display**: Properly formatted responses for easy data visualization
- 📝 **Comprehensive Logging**: Detailed logging for debugging and monitoring
- 🔧 **Environment-Based Configuration**: Easy setup using environment variables or configuration objects
- 🚀 **NPM Package**: Ready to use as a dependency in your projects

## Installation

```bash
npm install @lakshya-mcp/mysql-mcp-server-claude
```

## Quick Start

### Environment Variables

Create a `.env` file in your project root:

```env
# Required Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database

# Optional Security Configuration
MYSQL_SSL=false
MYSQL_CONNECTION_LIMIT=10
MYSQL_TIMEOUT=60000

# Feature Toggles (fetch is always enabled)
MYSQL_ALLOW_CREATE=false
MYSQL_ALLOW_UPDATE=false
MYSQL_ALLOW_DELETE=false

# Security Settings
MYSQL_ALLOWED_TABLES=table1,table2,table3
MYSQL_BLOCKED_TABLES=sensitive_table,admin_table
MYSQL_MAX_ROWS=1000
MYSQL_READ_ONLY=true

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./mysql-mcp.log
```

### Basic Usage

```javascript
const { MySQLMCPServer } = require("@lakshya-mcp/mysql-mcp-server-claude");

// Using environment variables
const server = new MySQLMCPServer();
await server.start();

// Or with custom configuration
const server = new MySQLMCPServer({
  database: {
    host: "localhost",
    port: 3306,
    user: "username",
    password: "password",
    database: "mydb",
  },
  features: {
    fetch: true,
    create: false,
    update: false,
    delete: false,
  },
});
```

## VS Code Integration

### 1. Install the Extension

Install the "Claude Code" extension in VS Code.

### 2. Configure MCP Server

Add the MySQL MCP server to your VS Code settings. Open your VS Code settings (JSON) and add:

```json
{
  "claude.mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@lakshya-mcp/mysql-mcp-server-claude"],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "your_username",
        "MYSQL_PASSWORD": "your_password",
        "MYSQL_DATABASE": "your_database",
        "MYSQL_ALLOW_CREATE": "false",
        "MYSQL_ALLOW_UPDATE": "false",
        "MYSQL_ALLOW_DELETE": "false"
      }
    }
  }
}
```

### 3. Using with Claude in VS Code

Once configured, you can interact with your MySQL database through Claude:

```
@claude Can you show me all tables in the database?
@claude Describe the structure of the users table
@claude Select the first 10 rows from the products table
@claude Show me users where age > 25 ordered by name
```

## Available Tools

### `mysql_list_tables`

Lists all accessible tables in the database.

### `mysql_describe_table`

Get detailed information about a table structure including columns, types, and constraints.

**Parameters:**

- `table_name` (string): Name of the table to describe

### `mysql_select_data`

Select data from a table with optional filtering and pagination.

**Parameters:**

- `table_name` (string): Name of the table to query
- `columns` (array, optional): Specific columns to select
- `where` (string, optional): WHERE clause conditions
- `order_by` (string, optional): ORDER BY clause
- `limit` (number, optional): Maximum number of rows to return
- `offset` (number, optional): Number of rows to skip

### `mysql_insert_data` (if enabled)

Insert new data into a table.

**Parameters:**

- `table_name` (string): Name of the table to insert into
- `data` (object): Data to insert as key-value pairs

### `mysql_update_data` (if enabled)

Update existing data in a table.

**Parameters:**

- `table_name` (string): Name of the table to update
- `data` (object): Data to update as key-value pairs
- `where` (string): WHERE clause to identify rows to update
- `where_params` (array, optional): Parameters for the WHERE clause

### `mysql_delete_data` (if enabled)

Delete data from a table.

**Parameters:**

- `table_name` (string): Name of the table to delete from
- `where` (string): WHERE clause to identify rows to delete
- `where_params` (array, optional): Parameters for the WHERE clause

## Configuration Options

### Database Configuration

```javascript
{
  database: {
    host: "localhost",        // MySQL host
    port: 3306,              // MySQL port
    user: "username",        // MySQL username
    password: "password",    // MySQL password
    database: "dbname",      // Database name
    ssl: false,              // Enable SSL
    connectionLimit: 10,     // Connection pool limit
    timeout: 60000          // Connection timeout in ms
  }
}
```

### Feature Configuration

```javascript
{
  features: {
    fetch: true,    // Always enabled - read operations
    create: false,  // Enable INSERT operations
    update: false,  // Enable UPDATE operations
    delete: false   // Enable DELETE operations
  }
}
```

### Security Configuration

```javascript
{
  security: {
    allowedTables: ["users", "products"],  // Only allow these tables
    blockedTables: ["admin", "secrets"],   // Block these tables
    maxRows: 1000,                        // Maximum rows per query
    readOnly: true                        // Disable all write operations
  }
}
```

### Logging Configuration

```javascript
{
  logging: {
    level: "info",              // error, warn, info, debug
    file: "./mysql-mcp.log"     // Optional log file path
  }
}
```

## Security Features

- **Input Validation**: All inputs are validated using Joi schemas
- **SQL Injection Prevention**: Uses parameterized queries exclusively
- **Table Access Control**: Configurable allow/block lists for tables
- **Row Limiting**: Configurable maximum rows per query
- **Read-Only Mode**: Option to disable all write operations
- **Connection Pooling**: Secure connection management with timeouts
- **Audit Logging**: Comprehensive logging of all operations and security events

## Error Handling

The server includes comprehensive error handling:

- Database connection errors
- Invalid SQL queries
- Permission denied operations
- Configuration validation errors
- Runtime exceptions

All errors are logged with context and returned as structured responses.

## Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## License

MIT

## Contributing

Contributions are welcome! Please ensure all security best practices are maintained and add appropriate tests for new features.

## Support

For issues and questions, please create an issue in the GitHub repository.
