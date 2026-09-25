export type StaffPosition = {
	key: string;
	title: string;
	team?: string;
};

// Senior staff positions, in display order. Keys match VATUSA facility role codes.
// Positions with a team are led by a manually assigned lead; everyone else holding
// the VATUSA role is listed as a member of that team.
export const STAFF_POSITIONS: StaffPosition[] = [
	{ key: 'ATM', title: 'Air Traffic Manager' },
	{ key: 'DATM', title: 'Deputy Air Traffic Manager' },
	{ key: 'TA', title: 'Training Administrator' },
	{ key: 'EC', title: 'Events Coordinator', team: 'Events Team' },
	{ key: 'FE', title: 'Facility Engineer', team: 'Facility Engineering Team' },
	{ key: 'WM', title: 'Webmaster' }
];
