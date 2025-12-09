import { Database } from "sqlite";

interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

interface ForeignKeyInfo {
  id: number;
  seq: number;
  table: string;
  from: string;
  to: string;
  on_update: string;
  on_delete: string;
}

class SchemaCache {
  private schema: string | null = null;
  private lastUpdate: number = 0;
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutes

  async getSchema(
    db: Database,
    forceRefresh: boolean = false,
  ): Promise<string> {
    const now = Date.now();

    if (
      forceRefresh ||
      !this.schema ||
      now - this.lastUpdate > this.cacheDuration
    ) {
      this.schema = await this.#extractDatabaseSchema(db);
      this.lastUpdate = now;
    }

    return this.schema;
  }

  invalidate(): void {
    this.schema = null;
  }

  async #extractDatabaseSchema(db: Database): Promise<string> {
    // Get all tables
    const tables = (await db.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
    )) as unknown as { name: string }[];

    let schemaDescription = "### Database Schema:\n\n";

    for (const table of tables) {
      const tableName = table.name;
      schemaDescription += `**Table: ${tableName}**\n`;

      // Get columns
      const columns = (await db.all(
        `PRAGMA table_info(${tableName})`,
      )) as unknown as ColumnInfo[];

      schemaDescription += "Columns:\n";

      for (const col of columns) {
        const nullable = col.notnull === 0 ? "NULL" : "NOT NULL";
        const primaryKey = col.pk === 1 ? " (PRIMARY KEY)" : "";
        schemaDescription += `  - ${col.name}: ${col.type} ${nullable}${primaryKey}\n`;
      }

      // Get foreign keys
      const foreignKeys = (await db.all(
        `PRAGMA foreign_key_list(${tableName})`,
      )) as unknown as ForeignKeyInfo[];

      if (foreignKeys.length > 0) {
        schemaDescription += "Foreign Keys:\n";
        for (const fk of foreignKeys) {
          schemaDescription += `  - ${fk.from} -> ${fk.table}(${fk.to})\n`;
        }
      }

      schemaDescription += "\n";
    }

    return schemaDescription;
  }
}

export const schemaCache = new SchemaCache();
