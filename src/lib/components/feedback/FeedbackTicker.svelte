<script lang="ts">
	import IconStar from '~icons/mdi/star';

	type TickerFeedback = {
		id: string;
		rating: string;
		position: string;
		feedback: string | null;
		controllerName: string | null;
	};

	let { feedback }: { feedback: TickerFeedback[] } = $props();

	const MAX_COMMENT_LENGTH = 120;

	function truncate(text: string) {
		const trimmed = text.trim().replace(/\s+/g, ' ');
		return trimmed.length > MAX_COMMENT_LENGTH
			? `${trimmed.slice(0, MAX_COMMENT_LENGTH).trimEnd()}…`
			: trimmed;
	}

	// Scale scroll duration with the number of items so the speed stays readable
	const duration = $derived(Math.max(30, feedback.length * 12));
</script>

{#snippet items(hidden: boolean)}
	<ul class="flex shrink-0 items-center" aria-hidden={hidden}>
		{#each feedback as item (item.id)}
			<li class="flex items-center gap-2 px-6 py-2 text-sm whitespace-nowrap">
				<IconStar
					class="h-4 w-4 shrink-0 {item.rating === 'excellent'
						? 'text-green-400'
						: 'text-blue-400'}"
				/>
				<span class="font-semibold text-white">{item.controllerName ?? 'Indy Controller'}</span>
				<span class="text-slate-400">on {item.position}</span>
				{#if item.feedback?.trim()}
					<span class="text-slate-300 italic">“{truncate(item.feedback)}”</span>
				{:else}
					<span class="text-slate-300 capitalize">{item.rating.replaceAll('_', ' ')} service</span>
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

{#if feedback.length > 0}
	<section
		class="ticker relative flex w-full items-center overflow-hidden rounded-lg border border-slate-700/60 bg-slate-800/60 shadow-sm"
		aria-label="Recent pilot feedback"
	>
		<a
			href="/feedback"
			class="relative z-10 flex shrink-0 items-center self-stretch bg-sky-700 px-3 text-xs font-bold tracking-wide text-white uppercase transition-colors hover:bg-sky-600"
		>
			Pilot Feedback
		</a>
		<div class="ticker-viewport relative flex-1 overflow-hidden">
			<div
				class="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-slate-800 to-transparent"
			></div>
			<div class="ticker-track flex w-max" style="--ticker-duration: {duration}s">
				{@render items(false)}
				{@render items(true)}
			</div>
		</div>
	</section>
{/if}

<style>
	.ticker-track {
		animation: ticker-scroll var(--ticker-duration) linear infinite;
	}

	.ticker:hover .ticker-track,
	.ticker:focus-within .ticker-track {
		animation-play-state: paused;
	}

	@keyframes ticker-scroll {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ticker-track {
			animation: none;
		}

		.ticker-viewport {
			overflow-x: auto;
		}
	}
</style>
