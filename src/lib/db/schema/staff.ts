import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Manual staff assignments. When a position has any rows here, they replace the
// holders derived from VATUSA facility roles for that position.
export const staffAssignmentsTable = sqliteTable(
	'staff_assignments',
	{
		position: text('position').notNull(),
		cid: text('cid').notNull()
	},
	(table) => [primaryKey({ columns: [table.position, table.cid] })]
);
