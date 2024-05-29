import { QueryError } from 'mysql2';

export interface SqlError extends Omit<QueryError, 'code'> {
    code: string;
    errno?: number;
    sqlMessage?: string;
    sqlState?: string;
    index?: number;
    sql?: string;
}