<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Indy Center | Staff</title>
</svelte:head>

<div class="mb-8">
	<h1 class="text-3xl font-bold text-white">Facility Staff</h1>
	<p class="mt-2 text-gray-400">The people who keep Indy Center running.</p>
</div>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
	{#each data.staff as position}
		<div class="rounded-lg border border-slate-700/60 bg-slate-800/60 shadow-sm backdrop-blur-sm">
			<div class="flex items-center justify-between border-b border-slate-700/60 px-4 py-3">
				<h2 class="text-sm font-semibold tracking-wide text-white uppercase">{position.title}</h2>
				<span class="rounded bg-sky-600/80 px-2 py-0.5 font-mono text-xs font-semibold text-white">
					{position.key}
				</span>
			</div>
			<div class="space-y-3 px-4 py-4">
				{#each position.members as member}
					<div class="flex items-center gap-2">
						<span class="font-semibold text-white">{member.name}</span>
						{#if member.operatingInitials}
							<span
								class="rounded bg-indigo-600/80 px-2 py-0.5 font-mono text-xs font-semibold text-white"
							>
								{member.operatingInitials}
							</span>
						{/if}
						<span class="text-sm text-gray-400">{member.rating}</span>
					</div>
				{:else}
					<p class="text-sm text-gray-500 italic">Vacant</p>
				{/each}
			</div>
		</div>
	{/each}
</div>
