import { format, isAfter, isBefore, subHours } from 'date-fns';
import { utc } from '@date-fns/utc';
import type { Event } from '$lib/db/schema/events';

export function isSignUpClosed(event?: Event) {
	if (!event) return true;

	const closeTime = subHours(event.startTime, 24);

	return (
		// Sign ups close 24 hours before the event start time
		isAfter(new Date(), closeTime) &&
		// Only open rosters allow sign up
		event.rosterType === 'open' &&
		// The roster must be released
		event.isRosterPublished
	);
}

/**
 * Generates a Google Calendar "Add Event" URL.
 * @param event The event object containing name, description, startTime, and endTime.
 * @returns A formatted Google Calendar template URL.
 */
export function getGoogleCalendarUrl(event: Event) {
	const baseUrl = 'https://www.google.com/calendar/render';
	const params = new URLSearchParams({
		action: 'TEMPLATE',
		text: event.name,
		details: event.description || '',
		dates: `${format(utc(event.startTime), "yyyyMMdd'T'HHmmss'Z'")}/${format(utc(event.endTime), "yyyyMMdd'T'HHmmss'Z'")}`
	});

	return `${baseUrl}?${params.toString()}`;
}
