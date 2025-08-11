import { DatabaseManager } from '../utils/database';
import { ServerConfig, McpResponse, QueryResult, CreateTableOptions } from '../types';
import { Logger } from '../utils/logger';

export class QueryHandler {
  private db: DatabaseManager;
  private config: ServerConfig;

  constructor(db: DatabaseManager, config: ServerConfig) {
    this.db = db;
    this.config = config;
  }

  async listTables(): Promise<McpResponse<string[]>> {
    try {
      const tables = await this.db.getTables();
      const filteredTables = this.filterAllowedTables(tables);
      
      Logger.getInstance().info(`Listed ${filteredTables.length} tables`);
      
      return {
        success: true,
        data: filteredTables,
        metadata: {
          rowCount: filteredTables.length
        }
      };
    } catch (error) {
      Logger.logError(error as Error, 'listTables');
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async describeTable(tableName: string): Promise<McpResponse> {
    try {
      if (!this.isTableAllowed(tableName)) {
        Logger.logSecurity('Unauthorized table access attempt', { tableName });
        return {
          success: false,
          error: 'Access to this table is not allowed'
        };
      }

      const tableInfo = await this.db.getTableInfo(tableName);
      
      Logger.getInstance().info(`Described table: ${tableName}`);
      
      return {
        success: true,
        data: {
          table: tableInfo,
          formatted: this.formatTableInfo(tableInfo)
        }
      };
    } catch (error) {
      Logger.logError(error as Error, `describeTable: ${tableName}`);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async selectData(
    tableName: string,
    options: {
      columns?: string[];
      where?: string;
      orderBy?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<McpResponse> {
    try {
      if (!this.config.features.fetch) {
        return {
          success: false,
          error: 'Fetch operations are disabled'
        };
      }

      if (!this.isTableAllowed(tableName)) {
        Logger.logSecurity('Unauthorized table access attempt', { tableName });
        return {
          success: false,
          error: 'Access to this table is not allowed'
        };
      }

      const limit = Math.min(options.limit || this.config.security.maxRows || 1000, this.config.security.maxRows || 1000);
      const queryOptions = { ...options, limit };

      const result = await this.db.selectFromTable(tableName, queryOptions);
      
      Logger.getInstance().info(`Selected data from ${tableName}`, {
        rowCount: result.rowCount,
        executionTime: result.executionTime
      });

      return {
        success: true,
        data: {
          result,
          formatted: this.formatQueryResult(result)
        },
        metadata: {
          executionTime: result.executionTime,
          rowCount: result.rowCount
        }
      };
    } catch (error) {
      Logger.logError(error as Error, `selectData: ${tableName}`);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async insertData(tableName: string, data: Record<string, any>): Promise<McpResponse> {
    try {
      if (!this.config.features.create) {
        return {
          success: false,
          error: 'Create operations are disabled'
        };
      }

      if (this.config.security.readOnly) {
        Logger.logSecurity('Write operation attempted in read-only mode', { tableName, operation: 'insert' });
        return {
          success: false,
          error: 'Server is in read-only mode'
        };
      }

      if (!this.isTableAllowed(tableName)) {
        Logger.logSecurity('Unauthorized table access attempt', { tableName });
        return {
          success: false,
          error: 'Access to this table is not allowed'
        };
      }

      const result = await this.db.insertIntoTable(tableName, data);
      
      Logger.getInstance().info(`Inserted data into ${tableName}`, {
        affectedRows: result.rowCount,
        executionTime: result.executionTime
      });

      return {
        success: true,
        data: { insertId: result.rowCount },
        metadata: {
          executionTime: result.executionTime,
          affectedRows: result.rowCount
        }
      };
    } catch (error) {
      Logger.logError(error as Error, `insertData: ${tableName}`);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async updateData(
    tableName: string,
    data: Record<string, any>,
    where: string,
    whereParams?: any[]
  ): Promise<McpResponse> {
    try {
      if (!this.config.features.update) {
        return {
          success: false,
          error: 'Update operations are disabled'
        };
      }

      if (this.config.security.readOnly) {
        Logger.logSecurity('Write operation attempted in read-only mode', { tableName, operation: 'update' });
        return {
          success: false,
          error: 'Server is in read-only mode'
        };
      }

      if (!this.isTableAllowed(tableName)) {
        Logger.logSecurity('Unauthorized table access attempt', { tableName });
        return {
          success: false,
          error: 'Access to this table is not allowed'
        };
      }

      const result = await this.db.updateTable(tableName, data, where, whereParams);
      
      Logger.getInstance().info(`Updated data in ${tableName}`, {
        affectedRows: result.rowCount,
        executionTime: result.executionTime
      });

      return {
        success: true,
        data: { affectedRows: result.rowCount },
        metadata: {
          executionTime: result.executionTime,
          affectedRows: result.rowCount
        }
      };
    } catch (error) {
      Logger.logError(error as Error, `updateData: ${tableName}`);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async deleteData(tableName: string, where: string, whereParams?: any[]): Promise<McpResponse> {
    try {
      if (!this.config.features.delete) {
        return {
          success: false,
          error: 'Delete operations are disabled'
        };
      }

      if (this.config.security.readOnly) {
        Logger.logSecurity('Write operation attempted in read-only mode', { tableName, operation: 'delete' });
        return {
          success: false,
          error: 'Server is in read-only mode'
        };
      }

      if (!this.isTableAllowed(tableName)) {
        Logger.logSecurity('Unauthorized table access attempt', { tableName });
        return {
          success: false,
          error: 'Access to this table is not allowed'
        };
      }

      const result = await this.db.deleteFromTable(tableName, where, whereParams);
      
      Logger.getInstance().info(`Deleted data from ${tableName}`, {
        affectedRows: result.rowCount,
        executionTime: result.executionTime
      });

      return {
        success: true,
        data: { affectedRows: result.rowCount },
        metadata: {
          executionTime: result.executionTime,
          affectedRows: result.rowCount
        }
      };
    } catch (error) {
      Logger.logError(error as Error, `deleteData: ${tableName}`);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async createTable(options: CreateTableOptions): Promise<McpResponse> {
    try {
      if (!this.config.features.createTable) {
        return {
          success: false,
          error: 'Create table operations are disabled'
        };
      }

      if (this.config.security.readOnly) {
        Logger.logSecurity('Write operation attempted in read-only mode', { tableName: options.tableName, operation: 'createTable' });
        return {
          success: false,
          error: 'Server is in read-only mode'
        };
      }

      if (!options.tableName || !options.columns || options.columns.length === 0) {
        return {
          success: false,
          error: 'Table name and columns are required'
        };
      }

      const result = await this.db.createTable(options);
      
      Logger.getInstance().info(`Created table: ${options.tableName}`, {
        columnCount: options.columns.length,
        executionTime: result.executionTime
      });

      return {
        success: true,
        data: { 
          tableName: options.tableName, 
          columnCount: options.columns.length 
        },
        metadata: {
          executionTime: result.executionTime
        }
      };
    } catch (error) {
      Logger.logError(error as Error, `createTable: ${options.tableName}`);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  private isTableAllowed(tableName: string): boolean {
    const { allowedTables, blockedTables } = this.config.security;
    
    if (blockedTables && blockedTables.includes(tableName)) {
      return false;
    }
    
    if (allowedTables && allowedTables.length > 0) {
      return allowedTables.includes(tableName);
    }
    
    return true;
  }

  private filterAllowedTables(tables: string[]): string[] {
    return tables.filter(table => this.isTableAllowed(table));
  }

  private formatQueryResult(result: QueryResult): string {
    if (result.rows.length === 0) {
      return 'No data found.';
    }

    const { columns, rows } = result;
    
    const columnWidths = columns.map((col, index) => {
      const maxContentWidth = Math.max(
        col.length,
        ...rows.map(row => String(row[index] || '').length)
      );
      return Math.min(maxContentWidth, 50);
    });

    const separator = '+' + columnWidths.map(width => '-'.repeat(width + 2)).join('+') + '+';
    
    let formatted = separator + '\n';
    
    formatted += '|' + columns.map((col, index) => 
      ` ${col.padEnd(columnWidths[index])} `
    ).join('|') + '|\n';
    
    formatted += separator + '\n';
    
    rows.forEach(row => {
      formatted += '|' + row.map((cell, index) => {
        const cellStr = String(cell || '');
        const truncated = cellStr.length > 50 ? cellStr.substring(0, 47) + '...' : cellStr;
        return ` ${truncated.padEnd(columnWidths[index])} `;
      }).join('|') + '|\n';
    });
    
    formatted += separator + '\n';
    formatted += `\nRows: ${result.rowCount} | Execution time: ${result.executionTime}ms`;
    
    return formatted;
  }

  private formatTableInfo(tableInfo: any): string {
    let formatted = `Table: ${tableInfo.name}\n`;
    formatted += `Rows: ${tableInfo.rowCount}\n\n`;
    formatted += 'Columns:\n';
    formatted += '+' + '-'.repeat(20) + '+' + '-'.repeat(15) + '+' + '-'.repeat(10) + '+' + '-'.repeat(10) + '+\n';
    formatted += '| Name               | Type          | Nullable | Key      |\n';
    formatted += '+' + '-'.repeat(20) + '+' + '-'.repeat(15) + '+' + '-'.repeat(10) + '+' + '-'.repeat(10) + '+\n';
    
    tableInfo.columns.forEach((col: any) => {
      const name = col.name.padEnd(18);
      const type = col.type.padEnd(13);
      const nullable = (col.nullable ? 'YES' : 'NO').padEnd(8);
      const key = (col.key || '').padEnd(8);
      formatted += `| ${name} | ${type} | ${nullable} | ${key} |\n`;
    });
    
    formatted += '+' + '-'.repeat(20) + '+' + '-'.repeat(15) + '+' + '-'.repeat(10) + '+' + '-'.repeat(10) + '+\n';
    
    return formatted;
  }
}