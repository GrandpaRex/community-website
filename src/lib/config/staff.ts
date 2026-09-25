// Senior staff positions, in display order. Keys match VATUSA facility role codes.
export const STAFF_POSITIONS = [
	{ key: 'ATM', title: 'Air Traffic Manager' },
	{ key: 'DATM', title: 'Deputy Air Traffic Manager' },
	{ key: 'TA', title: 'Training Administrator' },
	{ key: 'EC', title: 'Events Coordinator' },
	{ key: 'FE', title: 'Facility Engineer' },
	{ key: 'WM', title: 'Webmaster' }
] as const;

export type StaffPositionKey = (typeof STAFF_POSITIONS)[number]['key'];
