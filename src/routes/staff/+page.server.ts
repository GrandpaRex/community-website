import { fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { FACILITY_ID } from '$lib/config';
import { STAFF_POSITIONS } from '$lib/config/staff';
import { staffAssignmentsTable } from '$lib/db/schema/staff';
import type { Database } from '$lib/server/db';
import { logger } from '$lib/server/logger';
import { isAdmin } from '$lib/utils/permissions';

const POSITION_KEYS = STAFF_POSITIONS.map((position) => position.key) as [string, ...string[]];

type RosterMember = Awaited<ReturnType<typeof getRoster>>[number];

function getRoster(db: Database) {
	return db.query.vatsimControllersTable.findMany({ with: { user: true } });
}

function getDisplayName(member: RosterMember) {
	return (
		member.user?.preferredName ??
		`${member.data.fname} ${member.data.flag_nameprivacy ? member.data.cid : member.data.lname}`
	);
}

// CIDs holding a position according to VATUSA facility roles
function getVatusaHolders(roster: RosterMember[], position: string) {
	return roster
		.filter((member) =>
			member.data.roles?.some((role) => role.facility === FACILITY_ID && role.role === position)
		)
		.map((member) => member.cid);
}

export const load = async ({ locals }) => {
	const [roster, assignments] = await Promise.all([
		getRoster(locals.db),
		locals.db.query.staffAssignmentsTable.findMany()
	]);

	const assignedCids = assignments
		.map((assignment) => assignment.cid)
		.filter((cid) => !roster.some((member) => member.cid === cid));
	// Manually assigned staff who aren't on the roster fall back to their site account
	const offRosterUsers = assignedCids.length
		? await locals.db.query.usersTable.findMany({
				where: (users, { inArray }) => inArray(users.cid, assignedCids)
			})
		: [];

	function describe(cid: string) {
		const member = roster.find((m) => m.cid === cid);
		if (member) {
			return {
				cid,
				name: getDisplayName(member),
				rating: member.data.rating_short,
				operatingInitials: member.user?.operatingInitials ?? null
			};
		}

		const user = offRosterUsers.find((u) => u.cid === cid);
		return {
			cid,
			name: user ? (user.preferredName ?? `${user.firstName} ${user.lastName}`) : cid,
			rating: null,
			operatingInitials: user?.operatingInitials ?? null
		};
	}

	const staff = STAFF_POSITIONS.map((position) => {
		const manual = assignments.filter((a) => a.position === position.key).map((a) => a.cid);
		const isManual = manual.length > 0;
		const cids = isManual ? manual : getVatusaHolders(roster, position.key);

		return {
			...position,
			isManual,
			members: cids.map(describe).sort((a, b) => a.name.localeCompare(b.name))
		};
	});

	return {
		staff,
		canEdit: isAdmin(locals.roles),
		controllers: isAdmin(locals.roles)
			? roster
					.map((member) => ({ cid: member.cid, name: getDisplayName(member) }))
					.sort((a, b) => a.name.localeCompare(b.name))
			: []
	};
};

const assignmentSchema = z.object({
	position: z.enum(POSITION_KEYS),
	cid: z.string().regex(/^\d+$/)
});

const positionSchema = z.object({
	position: z.enum(POSITION_KEYS)
});

// The first manual edit to a position starts from what VATUSA currently shows
async function seedFromVatusa(db: Database, position: string) {
	const existing = await db.query.staffAssignmentsTable.findFirst({
		where: eq(staffAssignmentsTable.position, position)
	});
	if (existing) return;

	const holders = getVatusaHolders(await getRoster(db), position);
	if (holders.length) {
		await db.insert(staffAssignmentsTable).values(holders.map((cid) => ({ position, cid })));
	}
}

export const actions = {
	add: async ({ request, locals }) => {
		if (!isAdmin(locals.roles)) return fail(403, { message: 'Unauthorized' });

		const parsed = assignmentSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { message: 'Invalid staff assignment' });
		const { position, cid } = parsed.data;

		await seedFromVatusa(locals.db, position);
		await locals.db.insert(staffAssignmentsTable).values({ position, cid }).onConflictDoNothing();

		logger.info(`User ${locals.user?.id} assigned ${cid} to staff position ${position}`);
	},

	remove: async ({ request, locals }) => {
		if (!isAdmin(locals.roles)) return fail(403, { message: 'Unauthorized' });

		const parsed = assignmentSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { message: 'Invalid staff assignment' });
		const { position, cid } = parsed.data;

		await seedFromVatusa(locals.db, position);
		await locals.db
			.delete(staffAssignmentsTable)
			.where(and(eq(staffAssignmentsTable.position, position), eq(staffAssignmentsTable.cid, cid)));

		logger.info(`User ${locals.user?.id} removed ${cid} from staff position ${position}`);
	},

	reset: async ({ request, locals }) => {
		if (!isAdmin(locals.roles)) return fail(403, { message: 'Unauthorized' });

		const parsed = positionSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { message: 'Invalid staff position' });
		const { position } = parsed.data;

		await locals.db
			.delete(staffAssignmentsTable)
			.where(eq(staffAssignmentsTable.position, position));

		logger.info(`User ${locals.user?.id} reset staff position ${position} to VATUSA roles`);
	}
};
