import mysql from 'mysql2/promise';
import { DatabaseConfig, QueryResult, TableInfo, ColumnInfo } from '../types';
import { Logger } from './logger';

export class DatabaseManager {
  private pool: mysql.Pool;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    const poolConfig: any = {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionLimit: config.connectionLimit || 10,
      acquireTimeout: config.acquireTimeout || 60000,
      multipleStatements: false,
      namedPlaceholders: true
    };

    if (config.ssl) {
      poolConfig.ssl = {};
    }

    this.pool = mysql.createPool(poolConfig);
  }

  async testConnection(): Promise<void> {
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      Logger.getInstance().info('Database connection successful');
    } catch (error) {
      Logger.logError(error as Error, 'Database connection test');
      throw new Error(`Database connection failed: ${(error as Error).message}`);
    }
  }

  async executeQuery(query: string, params?: any[]): Promise<QueryResult> {
    const startTime = Date.now();
    let connection: mysql.PoolConnection | undefined;

    try {
      connection = await this.pool.getConnection();
      const [rows, fields] = await connection.execute(query, params);
      const executionTime = Date.now() - startTime;

      Logger.logQuery(query, params, executionTime);

      if (Array.isArray(rows)) {
        const columns = fields?.map(field => field.name) || [];
        const rowData = rows.map(row => Object.values(row as any));
        
        return {
          columns,
          rows: rowData,
          rowCount: rows.length,
          executionTime
        };
      } else {
        return {
          columns: [],
          rows: [],
          rowCount: (rows as any).affectedRows || 0,
          executionTime
        };
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      Logger.logError(error as Error, `Query execution failed: ${query}`);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  async getTables(): Promise<string[]> {
    const result = await this.executeQuery('SHOW TABLES');
    return result.rows.map(row => row[0] as string);
  }

  async getTableInfo(tableName: string): Promise<TableInfo> {
    this.validateTableName(tableName);
    
    const [columnsResult, countResult] = await Promise.all([
      this.executeQuery(`DESCRIBE \`${tableName}\``),
      this.executeQuery(`SELECT COUNT(*) as count FROM \`${tableName}\``)
    ]);

    const columns: ColumnInfo[] = columnsResult.rows.map(row => ({
      name: row[0] as string,
      type: row[1] as string,
      nullable: row[2] === 'YES',
      key: row[3] as string,
      default: row[4]
    }));

    return {
      name: tableName,
      columns,
      rowCount: countResult.rows[0][0] as number
    };
  }

  async selectFromTable(
    tableName: string, 
    options: {
      columns?: string[];
      where?: string;
      orderBy?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<QueryResult> {
    this.validateTableName(tableName);
    
    let query = `SELECT `;
    
    if (options.columns && options.columns.length > 0) {
      query += options.columns.map(col => `\`${col}\``).join(', ');
    } else {
      query += '*';
    }
    
    query += ` FROM \`${tableName}\``;
    
    if (options.where) {
      query += ` WHERE ${options.where}`;
    }
    
    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    }
    
    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
      if (options.offset) {
        query += ` OFFSET ${options.offset}`;
      }
    }

    return this.executeQuery(query);
  }

  async insertIntoTable(tableName: string, data: Record<string, any>): Promise<QueryResult> {
    this.validateTableName(tableName);
    
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map(() => '?').join(', ');
    
    const query = `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${placeholders})`;
    
    return this.executeQuery(query, values);
  }

  async updateTable(
    tableName: string, 
    data: Record<string, any>, 
    where: string, 
    whereParams?: any[]
  ): Promise<QueryResult> {
    this.validateTableName(tableName);
    
    const setClause = Object.keys(data).map(key => `\`${key}\` = ?`).join(', ');
    const query = `UPDATE \`${tableName}\` SET ${setClause} WHERE ${where}`;
    
    const params = [...Object.values(data), ...(whereParams || [])];
    
    return this.executeQuery(query, params);
  }

  async deleteFromTable(tableName: string, where: string, whereParams?: any[]): Promise<QueryResult> {
    this.validateTableName(tableName);
    
    const query = `DELETE FROM \`${tableName}\` WHERE ${where}`;
    
    return this.executeQuery(query, whereParams);
  }

  private validateTableName(tableName: string): void {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      Logger.logSecurity('Invalid table name attempt', { tableName });
      throw new Error('Invalid table name. Only alphanumeric characters and underscores are allowed.');
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    Logger.getInstance().info('Database connection pool closed');
  }
}