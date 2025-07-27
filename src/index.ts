#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { DatabaseManager } from './utils/database.js';
import { QueryHandler } from './handlers/queryHandler.js';
import { Logger } from './utils/logger.js';
import { getDefaultConfig, validateConfig } from './utils/config.js';
import { ServerConfig } from './types/index.js';

dotenv.config();

class MySQLMCPServer {
  private server: Server;
  private db: DatabaseManager;
  private queryHandler: QueryHandler;
  private config: ServerConfig;

  constructor(config?: Partial<ServerConfig>) {
    try {
      const defaultConfig = getDefaultConfig();
      const mergedConfig = config ? { ...defaultConfig, ...config } : defaultConfig;
      this.config = validateConfig(mergedConfig);
      
      Logger.getInstance(this.config.logging);
      
      this.server = new Server(
        {
          name: 'mysql-mcp-server',
          version: '1.0.0',
        }
      );

      this.db = new DatabaseManager(this.config.database);
      this.queryHandler = new QueryHandler(this.db, this.config);
      
      this.setupToolHandlers();
      
      Logger.getInstance().info('MySQL MCP Server initialized', {
        features: this.config.features,
        security: this.config.security
      });
    } catch (error) {
      Logger.logError(error as Error, 'Server initialization');
      throw error;
    }
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'mysql_list_tables',
          description: 'List all accessible tables in the database',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'mysql_describe_table',
          description: 'Get detailed information about a table structure',
          inputSchema: {
            type: 'object',
            properties: {
              table_name: {
                type: 'string',
                description: 'Name of the table to describe',
              },
            },
            required: ['table_name'],
          },
        },
        {
          name: 'mysql_select_data',
          description: 'Select data from a table with optional filtering and pagination',
          inputSchema: {
            type: 'object',
            properties: {
              table_name: {
                type: 'string',
                description: 'Name of the table to query',
              },
              columns: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific columns to select (optional)',
              },
              where: {
                type: 'string',
                description: 'WHERE clause conditions (optional)',
              },
              order_by: {
                type: 'string',
                description: 'ORDER BY clause (optional)',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of rows to return (optional)',
              },
              offset: {
                type: 'number',
                description: 'Number of rows to skip (optional)',
              },
            },
            required: ['table_name'],
          },
        },
      ];

      if (this.config.features.create) {
        tools.push({
          name: 'mysql_insert_data',
          description: 'Insert new data into a table',
          inputSchema: {
            type: 'object',
            properties: {
              table_name: {
                type: 'string',
                description: 'Name of the table to insert into',
              },
              data: {
                type: 'object',
                description: 'Data to insert as key-value pairs',
              },
            },
            required: ['table_name', 'data'],
          },
        });
      }

      if (this.config.features.update) {
        tools.push({
          name: 'mysql_update_data',
          description: 'Update existing data in a table',
          inputSchema: {
            type: 'object',
            properties: {
              table_name: {
                type: 'string',
                description: 'Name of the table to update',
              },
              data: {
                type: 'object',
                description: 'Data to update as key-value pairs',
              },
              where: {
                type: 'string',
                description: 'WHERE clause to identify rows to update',
              },
              where_params: {
                type: 'array',
                description: 'Parameters for the WHERE clause (optional)',
              },
            },
            required: ['table_name', 'data', 'where'],
          },
        });
      }

      if (this.config.features.delete) {
        tools.push({
          name: 'mysql_delete_data',
          description: 'Delete data from a table',
          inputSchema: {
            type: 'object',
            properties: {
              table_name: {
                type: 'string',
                description: 'Name of the table to delete from',
              },
              where: {
                type: 'string',
                description: 'WHERE clause to identify rows to delete',
              },
              where_params: {
                type: 'array',
                description: 'Parameters for the WHERE clause (optional)',
              },
            },
            required: ['table_name', 'where'],
          },
        });
      }

      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'mysql_list_tables': {
            const result = await this.queryHandler.listTables();
            return {
              content: [
                {
                  type: 'text',
                  text: result.success 
                    ? `Available tables:\n${result.data?.join('\n') || 'No tables found'}`
                    : `Error: ${result.error}`,
                },
              ],
            };
          }

          case 'mysql_describe_table': {
            const tableName = (args as any)?.table_name as string;
            const result = await this.queryHandler.describeTable(tableName);
            return {
              content: [
                {
                  type: 'text',
                  text: result.success 
                    ? result.data?.formatted || 'No table information available'
                    : `Error: ${result.error}`,
                },
              ],
            };
          }

          case 'mysql_select_data': {
            const argsObj = args as any;
            const options = {
              columns: argsObj?.columns,
              where: argsObj?.where,
              orderBy: argsObj?.order_by,
              limit: argsObj?.limit,
              offset: argsObj?.offset,
            };
            const result = await this.queryHandler.selectData(argsObj?.table_name, options);
            return {
              content: [
                {
                  type: 'text',
                  text: result.success 
                    ? result.data?.formatted || 'No data found'
                    : `Error: ${result.error}`,
                },
              ],
            };
          }

          case 'mysql_insert_data': {
            if (!this.config.features.create) {
              return {
                content: [{ type: 'text', text: 'Error: Insert operations are disabled' }],
              };
            }
            const argsObj = args as any;
            const result = await this.queryHandler.insertData(argsObj?.table_name, argsObj?.data);
            return {
              content: [
                {
                  type: 'text',
                  text: result.success 
                    ? `Data inserted successfully. Affected rows: ${result.metadata?.affectedRows}`
                    : `Error: ${result.error}`,
                },
              ],
            };
          }

          case 'mysql_update_data': {
            if (!this.config.features.update) {
              return {
                content: [{ type: 'text', text: 'Error: Update operations are disabled' }],
              };
            }
            const argsObj = args as any;
            const result = await this.queryHandler.updateData(
              argsObj?.table_name,
              argsObj?.data,
              argsObj?.where,
              argsObj?.where_params
            );
            return {
              content: [
                {
                  type: 'text',
                  text: result.success 
                    ? `Data updated successfully. Affected rows: ${result.metadata?.affectedRows}`
                    : `Error: ${result.error}`,
                },
              ],
            };
          }

          case 'mysql_delete_data': {
            if (!this.config.features.delete) {
              return {
                content: [{ type: 'text', text: 'Error: Delete operations are disabled' }],
              };
            }
            const argsObj = args as any;
            const result = await this.queryHandler.deleteData(
              argsObj?.table_name,
              argsObj?.where,
              argsObj?.where_params
            );
            return {
              content: [
                {
                  type: 'text',
                  text: result.success 
                    ? `Data deleted successfully. Affected rows: ${result.metadata?.affectedRows}`
                    : `Error: ${result.error}`,
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        Logger.logError(error as Error, `Tool execution: ${name}`);
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${(error as Error).message}`,
            },
          ],
        };
      }
    });
  }

  async start(): Promise<void> {
    try {
      await this.db.testConnection();
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      Logger.getInstance().info('MySQL MCP Server started successfully');
    } catch (error) {
      Logger.logError(error as Error, 'Server startup');
      await this.cleanup();
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.db.close();
      Logger.getInstance().info('Server cleanup completed');
    } catch (error) {
      Logger.logError(error as Error, 'Server cleanup');
    }
  }
}

async function main(): Promise<void> {
  const server = new MySQLMCPServer();
  
  process.on('SIGINT', async () => {
    Logger.getInstance().info('Received SIGINT, shutting down gracefully...');
    await server.cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    Logger.getInstance().info('Received SIGTERM, shutting down gracefully...');
    await server.cleanup();
    process.exit(0);
  });

  try {
    await server.start();
  } catch (error) {
    Logger.logError(error as Error, 'Application startup');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    Logger.logError(error, 'Unhandled application error');
    process.exit(1);
  });
}

export { MySQLMCPServer };
export * from './types/index.js';
export * from './utils/config.js';