export type StaffPosition = {
	key: string;
	title: string;
};

export type StaffTeam = {
	key: string;
	name: string;
	// Staff position that leads the team
	lead: string;
	// VATUSA facility role whose holders are members of the team
	vatusaRole?: string;
};

// Senior staff positions, in display order. Keys match VATUSA facility role codes.
export const STAFF_POSITIONS: StaffPosition[] = [
	{ key: 'ATM', title: 'Air Traffic Manager' },
	{ key: 'DATM', title: 'Deputy Air Traffic Manager' },
	{ key: 'TA', title: 'Training Administrator' },
	{ key: 'EC', title: 'Events Coordinator' },
	{ key: 'FE', title: 'Facility Engineer' },
	{ key: 'WM', title: 'Webmaster' }
];

export const STAFF_TEAMS: StaffTeam[] = [
	{ key: 'events', name: 'Events Team', lead: 'EC', vatusaRole: 'EC' },
	{ key: 'fwg', name: 'Facility Working Group', lead: 'FE', vatusaRole: 'FE' },
	{ key: 'tech', name: 'Tech Team', lead: 'WM', vatusaRole: 'WM' }
];

// When a team is built from a position's VATUSA role, that role can't identify the
// lead, so the position is only ever filled manually.
export function isManualOnlyPosition(position: string) {
	return STAFF_TEAMS.some((team) => team.vatusaRole === position);
}
