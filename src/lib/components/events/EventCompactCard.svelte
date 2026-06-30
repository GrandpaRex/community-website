<script lang="ts">
	import { format } from 'date-fns';
	import { utc } from '@date-fns/utc';
	import IconClock from '~icons/mdi/clock-outline';
	import IconCalendarPlus from '~icons/mdi/calendar-plus';
	import { getGoogleCalendarUrl } from '$lib/utils/events';
	import { supportsRosters } from '$lib/config/events';
	import type { Event } from '$lib/db/schema/events';
	import ImageWithFallback from '$lib/components/ui/ImageWithFallback.svelte';
	import EventTypeBadge from '$lib/components/events/EventTypeBadge.svelte';
	import RosterTypeBadge from '$lib/components/events/RosterTypeBadge.svelte';

	let { event }: { event: Event } = $props();

	const startDate = event.startTime;
	const endDate = event.endTime;
	const startTimeUTC = format(utc(startDate), 'HH:mm');
	const endTimeUTC = format(utc(endDate), 'HH:mm');
	const startLocal = format(startDate, 'HH:mm');
	const endLocal = format(endDate, 'HH:mm');
	const localTimezone = format(startDate, 'zzz');
	const eventDate = format(startDate, 'MMM d');

	const shouldShowRosterBadge = (eventType: string) => {
		return supportsRosters(eventType);
	};
</script>

<div class="group block">
	<article
		class="relative flex overflow-hidden rounded-lg border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm transition-all duration-300 hover:border-sky-500/30 hover:shadow-md hover:shadow-sky-500/5"
	>
		<!-- Event Banner - Left Side -->
		<div class="relative h-24 w-32 flex-shrink-0 overflow-hidden">
			<ImageWithFallback
				src={event.bannerUrl}
				alt="{event.name} banner"
				class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				fallbackClass="h-full w-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"
			/>
			<div class="absolute inset-0 bg-gradient-to-r from-transparent to-slate-800/20"></div>

			<!-- Add to Calendar Overlay -->
			<div class="absolute top-1 left-1 z-50">
				<a
					href={getGoogleCalendarUrl(event)}
					target="_blank"
					rel="noopener noreferrer"
					class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/80 text-slate-300 backdrop-blur-sm transition-all hover:bg-sky-500 hover:text-white"
					title="Add to Google Calendar"
					onclick={(e) => e.stopPropagation()}
				>
					<IconCalendarPlus class="h-3.5 w-3.5" />
				</a>
			</div>
		</div>

		<!-- Event Content - Right Side -->
		<div class="flex flex-1 flex-col justify-between p-3">
			<div>
				<div class="mb-1 flex flex-wrap items-center gap-1">
					<EventTypeBadge eventType={event.type} size="sm" />
					{#if shouldShowRosterBadge(event.type)}
						<RosterTypeBadge rosterType={event.rosterType} size="sm" />
					{/if}
				</div>

				<h3
					class="mb-1 line-clamp-1 text-sm font-semibold text-white transition-colors duration-300 group-hover:text-sky-300"
				>
					{event.name}
				</h3>
				{#if event.description}
					<p class="mb-2 line-clamp-2 text-xs text-slate-400">
						{event.description}
					</p>
				{/if}
			</div>

			<!-- Event Time -->
			{#if event.startTime}
				<div class="flex items-center justify-between text-xs">
					<time class="inline-flex items-center gap-1 text-slate-400">
						<IconClock class="h-3 w-3" />
						{startLocal}
						{localTimezone}
					</time>
					<span class="font-medium text-sky-300">{eventDate}</span>
				</div>
			{/if}
		</div>

		<!-- Primary Navigation Link -->
		<a
			href={`/events/${event.id}`}
			class="absolute inset-0 z-40"
			aria-label="View details for {event.name}"
		></a>
	</article>
</div>
