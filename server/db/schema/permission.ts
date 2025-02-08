import { pgTable, text, serial } from 'drizzle-orm/pg-core';

export const permission = pgTable('permission', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
});
