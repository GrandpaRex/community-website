import { eventsTable } from '$lib/db/schema/events';
import { feedbackTable } from '$lib/db/schema/feedback';
import { fetchMetars } from '$lib/server/vatsim/vatsimDataClient';
import { fetchControllers } from '$lib/server/vatsim/vnasDataClient.js';
import { asc, and, desc, eq, gt, inArray } from 'drizzle-orm';

export const load = async ({ locals }) => {
	const metars = await fetchMetars();

	const controllers = await fetchControllers();

	const events = await locals.db.query.eventsTable.findMany({
		orderBy: asc(eventsTable.startTime),
		where: and(
			gt(eventsTable.endTime, new Date()),
			inArray(eventsTable.type, ['community', 'home', 'group_flight']),
			eq(eventsTable.isPublished, true)
		),
		limit: 4
	});

	// Recent approved, positive feedback for the home page ticker
	const recentFeedback = await locals.db.query.feedbackTable.findMany({
		orderBy: desc(feedbackTable.updatedAt),
		where: and(
			eq(feedbackTable.status, 'approved'),
			inArray(feedbackTable.rating, ['good', 'excellent'])
		),
		with: {
			controller: {
				columns: { firstName: true, lastName: true, preferredName: true }
			}
		},
		limit: 10
	});

	const feedback = recentFeedback.map((f) => ({
		id: f.id,
		rating: f.rating,
		position: f.position,
		feedback: f.feedback,
		controllerName: f.controller
			? f.controller.preferredName || `${f.controller.firstName} ${f.controller.lastName}`
			: null
	}));

	return {
		events,
		metars,
		controllers,
		feedback
	};
};
