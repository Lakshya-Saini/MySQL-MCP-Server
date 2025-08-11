export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
  connectionLimit?: number;
  acquireTimeout?: number;
}

export interface ServerConfig {
  database: DatabaseConfig;
  features: {
    fetch: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    createTable: boolean;
  };
  security: {
    allowedTables?: string[];
    blockedTables?: string[];
    maxRows?: number;
    readOnly?: boolean;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    file?: string;
  };
}

export interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  executionTime: number;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  rowCount: number;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  key: string;
  default: any;
}

export interface TableColumn {
  name: string;
  type: string;
  nullable?: boolean;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  unique?: boolean;
  defaultValue?: any;
  length?: number;
}

export interface CreateTableOptions {
  tableName: string;
  columns: TableColumn[];
  ifNotExists?: boolean;
  engine?: string;
  charset?: string;
  collation?: string;
}

export interface McpResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    executionTime?: number;
    rowCount?: number;
    affectedRows?: number;
  };
}