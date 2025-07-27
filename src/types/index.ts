export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
  connectionLimit?: number;
  timeout?: number;
}

export interface ServerConfig {
  database: DatabaseConfig;
  features: {
    fetch: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
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