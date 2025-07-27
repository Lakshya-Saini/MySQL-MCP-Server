# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **secure MySQL Model Context Protocol (MCP) server** designed for integration with AI assistants like Claude and VS Code extensions. It provides controlled database access through a standardized MCP interface with extensive security features.

## Development Commands

### Build & Development
- `npm run build` - Compile TypeScript to JavaScript in dist/
- `npm run dev` - Run in development mode with ts-node
- `npm run start` - Run the compiled JavaScript version
- `npm run typecheck` - Run TypeScript type checking without emitting files
- `npm run lint` - Run ESLint on all TypeScript files

### Testing
- `npm test` - Run Jest tests (framework configured but no tests currently exist)

## Architecture

### Core Components

1. **MySQLMCPServer** (`src/index.ts`) - Main server class that implements MCP protocol
2. **QueryHandler** (`src/handlers/queryHandler.ts`) - Business logic for all database operations
3. **Database Manager** (`src/utils/database.ts`) - Connection pooling and query execution
4. **Configuration System** (`src/utils/config.ts`) - Joi-based validation and environment management
5. **Logger** (`src/utils/logger.ts`) - Winston-based logging with security event tracking

### Security Architecture

The server implements a **security-first design** with multiple layers:
- **Input validation** via Joi schemas
- **Parameterized queries** to prevent SQL injection
- **Table access control** with allow/block lists
- **Operation gating** for CRUD operations (read-only by default)
- **Row limiting** with configurable maximums
- **Audit logging** for all operations

### Configuration Pattern

Uses hierarchical configuration: Default values → Environment variables → Constructor parameters
All configuration is validated through Joi schemas with strict typing.

### MCP Tools Exposed

Based on configuration, the server exposes these tools:
- `mysql_list_tables` - Lists accessible database tables
- `mysql_describe_table` - Shows table structure and metadata
- `mysql_select_data` - Executes SELECT queries with filtering/pagination
- `mysql_insert_data` - Inserts records (if enabled)
- `mysql_update_data` - Updates records (if enabled)
- `mysql_delete_data` - Deletes records (if enabled)

## Key Dependencies

- `@modelcontextprotocol/sdk` - Core MCP protocol implementation
- `mysql2` - MySQL client with connection pooling
- `winston` - Professional logging framework
- `joi` - Schema validation

## Integration

### VS Code
Configured via VS Code settings JSON with environment variables passed through MCP configuration.

### CLI Usage
The package provides a `mysql-mcp-server` binary for command-line execution.

## Development Notes

### Type Safety
Full TypeScript implementation with strict type checking. Types are defined in `src/types/index.ts`.

### Error Handling
Comprehensive error catching at every layer with structured error responses and detailed logging.

### Default Security Posture
- Read-only mode enabled by default
- Write operations disabled by default
- Maximum 1000 rows per query
- Comprehensive input validation

### Modular Design
Clear separation of concerns with dedicated modules for configuration, database operations, logging, and business logic.