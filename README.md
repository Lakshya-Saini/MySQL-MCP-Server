# MySQL MCP Server

A secure, feature-rich MySQL Model Context Protocol (MCP) server designed for integration with AI assistants like Claude and VS Code GitHub Copilot.

## Table of Contents

- [Features](#features)
- [Usage](#usage)
  - [With Visual Studio Code](#with-visual-studio-code)
  - [With Claude Desktop](#with-claude-desktop)
  - [With Claude Code](#with-claude-code)
  - [With Gemini CLI](#with-gemini-cli)
  - [Within your project](#within-your-project)
- [Available Tools](#available-tools)
- [Configuration Options](#configuration-options)
  - [Database Configuration](#database-configuration)
  - [Feature Configuration](#feature-configuration)
  - [Security Configuration](#security-configuration)
  - [Logging Configuration](#logging-configuration)
- [Security Features](#security-features)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [Support](#support)

## Features

- **Security First**: Built with security best practices, input validation, and configurable access controls
- **Configurable Operations**: Enable/disable CRUD operations and table creation based on your needs (read operations enabled by default)
- **Tabular Data Display**: Properly formatted responses for easy data visualization
- **Comprehensive Logging**: Detailed logging for debugging and monitoring
- **Environment-Based Configuration**: Easy setup using environment variables or configuration objects
- **NPM Package**: Ready to use as a dependency in your projects

## Usage

### With Visual Studio Code

Add this to your `.vscode/mcp.json`:

```json
{
  "servers": {
    "mysql": {
      "command": "npx",
      "args": ["@lakshya-mcp/mysql-mcp-server-claude"],
      "env": {
        "MYSQL_HOST": "{your_host}",
        "MYSQL_PORT": "{your_port}",
        "MYSQL_USER": "{your_username}",
        "MYSQL_PASSWORD": "{your_password}",
        "MYSQL_DATABASE": "{your_database}",
        "MYSQL_ALLOW_CREATE": "false",
        "MYSQL_ALLOW_UPDATE": "false",
        "MYSQL_ALLOW_DELETE": "false",
        "MYSQL_ALLOW_CREATE_TABLE": "false",
        "MYSQL_READ_ONLY": "true" // Set to "true" for read-only mode; "false" allows writes.
      }
    }
  }
}
```

### With Claude Desktop

Add this to your `claude_desktop_config.json`.
Follow these [instructions](https://modelcontextprotocol.io/quickstart/user#installing-the-filesystem-server) to locate file.

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@lakshya-mcp/mysql-mcp-server-claude"],
      "env": {
        "MYSQL_HOST": "{your_host}",
        "MYSQL_PORT": "{your_port}",
        "MYSQL_USER": "{your_username}",
        "MYSQL_PASSWORD": "{your_password}",
        "MYSQL_DATABASE": "{your_database}",
        "MYSQL_ALLOW_CREATE": "false",
        "MYSQL_ALLOW_UPDATE": "false",
        "MYSQL_ALLOW_DELETE": "false",
        "MYSQL_ALLOW_CREATE_TABLE": "false",
        "MYSQL_READ_ONLY": "true" // Set to "true" for read-only mode; "false" allows writes.
      }
    }
  }
}
```

Save file and restart claude desktop. It should be visible under tools (check icon next to `+`).

### With Claude Code

Open terminal and run this command:

For windows (without wsl):

```bash
claude mcp add mysql -e MYSQL_HOST=localhost -e MYSQL_PORT=3306 -e MYSQL_USER=root -e MYSQL_PASSWORD={your_password} -e MYSQL_DATABASE={your_database} -e MYSQL_ALLOW_CREATE=false -e MYSQL_ALLOW_UPDATE=false -e MYSQL_ALLOW_DELETE=false -e MYSQL_ALLOW_CREATE_TABLE=false -e MYSQL_READ_ONLY=true -- cmd /c npx @lakshya-mcp/mysql-mcp-server-claude
```

For mac / windows (with wsl):

```bash
claude mcp add mysql -e MYSQL_HOST=localhost -e MYSQL_PORT=3306 -e MYSQL_USER=root -e MYSQL_PASSWORD={your_password} -e MYSQL_DATABASE={your_database} -e MYSQL_ALLOW_CREATE=false -e MYSQL_ALLOW_UPDATE=false -e MYSQL_ALLOW_DELETE=false -e MYSQL_ALLOW_CREATE_TABLE=false -e MYSQL_READ_ONLY=true -- npx -y @lakshya-mcp/mysql-mcp-server-claude
```

Then type: `claude` and run `/mcp`. It should show:

```
 ❯ 1. mysql  ✔ connected · Enter to view details
```

### With Gemini CLI

Navigate to your home directory and look for a folder named `.gemini`.
Inside that folder, you will find the `settings.json` file.
Add this in your `.gemini/settings.json` file:

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@lakshya-mcp/mysql-mcp-server-claude"],
      "env": {
        "MYSQL_HOST": "{your_host}",
        "MYSQL_PORT": "{your_port}",
        "MYSQL_USER": "{your_username}",
        "MYSQL_PASSWORD": "{your_password}",
        "MYSQL_DATABASE": "{your_database}",
        "MYSQL_ALLOW_CREATE": "false",
        "MYSQL_ALLOW_UPDATE": "false",
        "MYSQL_ALLOW_DELETE": "false",
        "MYSQL_ALLOW_CREATE_TABLE": "false",
        "MYSQL_READ_ONLY": "true" // Set to "true" for read-only mode; "false" allows writes.
      }
    }
  }
}
```

Then restart gemini cli. You should be able to see mysql mcp server.
You can verify by running `/mcp`.

### Within your project

1. Install package

```bash
npm install -g @lakshya-mcp/mysql-mcp-server-claude
```

2. Create server and use

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
    createTable: false,
  },
});
```

## Available Tools

The MySQL MCP Server provides several powerful tools for database interaction. Each tool is designed with security in mind and includes proper input validation:

### mysql_list_tables

**Purpose**: Lists all accessible tables in the database

- Returns a comprehensive list of all tables you have access to
- Useful for discovering the database structure
- No parameters required
- Respects table access controls if configured

### mysql_describe_table

**Purpose**: Get detailed information about a table structure including columns, types, and constraints

- Shows column names, data types, nullable status, and key information
- Essential for understanding table schema before querying
- Helps identify primary keys, foreign keys, and data constraints
- **Parameters:**
  - `table_name` (string, required): Name of the table to describe

### mysql_select_data

**Purpose**: Select data from a table with optional filtering and pagination

- Flexible querying with support for filtering, sorting, and pagination
- Returns data in a tabular format for easy visualization
- Supports complex WHERE clauses for precise data retrieval
- Built-in row limiting for performance and security
- **Parameters:**
  - `table_name` (string, required): Name of the table to query
  - `columns` (array, optional): Specific columns to select (e.g., ["name", "email"])
  - `where` (string, optional): WHERE clause conditions (e.g., "age > 25 AND status = 'active'")
  - `order_by` (string, optional): ORDER BY clause (e.g., "name ASC" or "created_at DESC")
  - `limit` (number, optional): Maximum number of rows to return
  - `offset` (number, optional): Number of rows to skip for pagination

### mysql_insert_data (if enabled)

**Purpose**: Insert new data into a table

- Allows adding new records to the database
- Only available when CREATE operations are enabled in configuration
- Validates data against table schema before insertion
- Supports batch inserts for efficiency
- **Parameters:**
  - `table_name` (string, required): Name of the table to insert into
  - `data` (object, required): Data to insert as key-value pairs (e.g., {"name": "John", "age": 30})

### mysql_update_data (if enabled)

**Purpose**: Update existing data in a table

- Modifies existing records based on specified criteria
- Only available when UPDATE operations are enabled in configuration
- Requires WHERE clause to prevent accidental mass updates
- Validates updated data against table constraints
- **Parameters:**
  - `table_name` (string, required): Name of the table to update
  - `data` (object, required): Data to update as key-value pairs (e.g., {"status": "inactive"})
  - `where` (string, required): WHERE clause to identify rows to update (e.g., "id = 123")
  - `where_params` (array, optional): Parameters for parameterized WHERE clauses

### mysql_delete_data (if enabled)

**Purpose**: Delete data from a table

- Removes records from the database based on specified criteria
- Only available when DELETE operations are enabled in configuration
- Requires WHERE clause to prevent accidental mass deletions
- Includes safety checks and confirmation prompts
- **Parameters:**
  - `table_name` (string, required): Name of the table to delete from
  - `where` (string, required): WHERE clause to identify rows to delete (e.g., "status = 'expired'")
  - `where_params` (array, optional): Parameters for parameterized WHERE clauses

### mysql_create_table (if enabled)

**Purpose**: Create new tables with specified columns and constraints

- Allows creating new database tables with custom schema definitions
- Only available when CREATE TABLE operations are enabled in configuration
- Supports various column types, constraints, and table options
- Includes safety features like IF NOT EXISTS option
- **Parameters:**
  - `table_name` (string, required): Name of the table to create
  - `columns` (array, required): Array of column definitions with the following properties:
    - `name` (string, required): Column name
    - `type` (string, required): Column data type (e.g., "VARCHAR", "INT", "TEXT", "DATETIME")
    - `length` (number, optional): Column length for types that support it (e.g., VARCHAR(255))
    - `nullable` (boolean, optional): Whether the column can be NULL (default: true)
    - `primaryKey` (boolean, optional): Whether this column is part of the primary key (default: false)
    - `autoIncrement` (boolean, optional): Whether this column auto-increments (default: false)
    - `unique` (boolean, optional): Whether this column has a unique constraint (default: false)
    - `defaultValue` (any, optional): Default value for the column
  - `if_not_exists` (boolean, optional): Use CREATE TABLE IF NOT EXISTS to avoid errors if table exists (default: false)
  - `engine` (string, optional): Storage engine (e.g., "InnoDB", "MyISAM")
  - `charset` (string, optional): Character set (e.g., "utf8mb4")
  - `collation` (string, optional): Collation (e.g., "utf8mb4_unicode_ci")

**Note**: Write operations (INSERT, UPDATE, DELETE, CREATE TABLE) are disabled by default for security. Enable them only when necessary and ensure proper access controls are in place.

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
    acquireTimeout: 60000   // Connection acquire timeout in ms
  }
}
```

### Feature Configuration

```javascript
{
  features: {
    fetch: true,        // Always enabled - read operations
    create: false,      // Enable INSERT operations
    update: false,      // Enable UPDATE operations
    delete: false,      // Enable DELETE operations
    createTable: false  // Enable CREATE TABLE operations
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

## Contributing

Contributions are welcome! Please ensure all security best practices are maintained and add appropriate tests for new features.

## Support

For issues and questions, please create an issue in the GitHub repository.
