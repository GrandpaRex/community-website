import { FACILITY_ID } from '$lib/config';
import { STAFF_POSITIONS } from '$lib/config/staff';

export const load = async ({ locals }) => {
	const roster = await locals.db.query.vatsimControllersTable.findMany({
		with: { user: true }
	});

	const staff = STAFF_POSITIONS.map((position) => ({
		...position,
		members: roster
			.filter((member) =>
				member.data.roles?.some(
					(role) => role.facility === FACILITY_ID && role.role === position.key
				)
			)
			.map((member) => ({
				cid: member.data.cid,
				name:
					member.user?.preferredName ??
					`${member.data.fname} ${member.data.flag_nameprivacy ? member.data.cid : member.data.lname}`,
				rating: member.data.rating_short,
				operatingInitials: member.user?.operatingInitials ?? null
			}))
			.sort((a, b) => a.name.localeCompare(b.name))
	}));

	return { staff };
};
