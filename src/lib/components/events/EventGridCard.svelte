<script lang="ts">
	import { format } from 'date-fns';
	import { utc } from '@date-fns/utc';
	import IconGlobe from '~icons/mdi/earth';
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
	const eventYear = format(startDate, 'yyyy');
	const currentYear = new Date().getFullYear().toString();

	const shouldShowRosterBadge = (eventType: string) => {
		return supportsRosters(eventType);
	};
</script>

<div class="group block h-full">
	<article
		class="relative flex h-full flex-col overflow-hidden rounded-lg border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm transition-all duration-300 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/10"
	>
		<!-- Event Banner -->
		<div class="relative h-32 flex-shrink-0 overflow-hidden">
			<ImageWithFallback
				src={event.bannerUrl}
				alt="{event.name} banner"
				class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
				fallbackClass="h-full w-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"
			/>
			<div
				class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"
			></div>

			<div class="absolute top-2 right-2 z-50 flex flex-col items-end gap-2">
				<div
					class="flex flex-col items-center rounded-md bg-slate-900/90 px-2 py-1.5 backdrop-blur-sm"
				>
					<span class="text-lg leading-none font-bold text-white">{eventDate.split(' ')[1]}</span>
					<span class="text-[10px] leading-none font-medium text-sky-400 uppercase"
						>{eventDate.split(' ')[0]}</span
					>
				</div>

				<a
					href={getGoogleCalendarUrl(event)}
					target="_blank"
					rel="noopener noreferrer"
					class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/90 text-slate-300 backdrop-blur-sm transition-all hover:bg-sky-500 hover:text-white"
					title="Add to Google Calendar"
					onclick={(e) => e.stopPropagation()}
				>
					<IconCalendarPlus class="h-4 w-4" />
				</a>
			</div>
		</div>

		<!-- Event Content -->
		<div class="flex flex-1 flex-col p-3">
				<div class="mb-2 flex flex-wrap items-center gap-1.5">
					<EventTypeBadge eventType={event.type} size="sm" />
					{#if shouldShowRosterBadge(event.type)}
						<RosterTypeBadge rosterType={event.rosterType} size="sm" />
					{/if}
				</div>

			<h3
				class="mb-1.5 line-clamp-2 text-base font-bold text-white transition-colors duration-300 group-hover:text-sky-300"
			>
				{event.name}
			</h3>

			{#if event.description}
				<p class="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-400">
					{event.description}
				</p>
			{/if}

			<!-- Event Time -->
			{#if event.startTime}
				<div class="mt-auto space-y-0.5 border-t border-slate-700/60 pt-2">
					<div class="flex items-center gap-1.5 text-[11px] text-slate-400">
						<IconGlobe class="h-3 w-3" />
						<span>{startTimeUTC} - {endTimeUTC} UTC</span>
					</div>
					<div class="flex items-center gap-1.5 text-xs font-medium text-sky-300">
						<IconClock class="h-3 w-3" />
						<span>{startLocal} - {endLocal} {localTimezone}</span>
					</div>
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
