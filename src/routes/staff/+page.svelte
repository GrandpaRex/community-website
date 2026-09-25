<script lang="ts">
	import { enhance } from '$app/forms';
	import IconPencil from '~icons/mdi/pencil';
	import IconClose from '~icons/mdi/close';
	import IconPlus from '~icons/mdi/plus';

	let { data } = $props();

	let editing = $state(false);

	const teams = $derived(data.staff.filter((position) => position.team));
</script>

<svelte:head>
	<title>Indy Center | Staff</title>
</svelte:head>

{#snippet memberRow(member: {
	name: string;
	operatingInitials: string | null;
	rating: string | null;
})}
	<span class="font-semibold text-white">{member.name}</span>
	{#if member.operatingInitials}
		<span class="rounded bg-indigo-600/80 px-2 py-0.5 font-mono text-xs font-semibold text-white">
			{member.operatingInitials}
		</span>
	{/if}
	{#if member.rating}
		<span class="text-sm text-gray-400">{member.rating}</span>
	{/if}
{/snippet}

<div class="mb-8 flex items-start justify-between gap-3">
	<div>
		<h1 class="text-3xl font-bold text-white">Facility Staff</h1>
		<p class="mt-2 text-gray-400">The people who keep Indy Center running.</p>
	</div>
	{#if data.canEdit}
		<button
			type="button"
			onclick={() => (editing = !editing)}
			class="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all focus:ring-2 focus:ring-sky-500 focus:outline-none {editing
				? 'bg-sky-600 hover:bg-sky-700'
				: 'border border-slate-600 bg-slate-700 hover:bg-slate-600'}"
		>
			<IconPencil class="h-4 w-4" />
			{editing ? 'Done' : 'Edit Staff'}
		</button>
	{/if}
</div>

{#if editing}
	<p class="mb-4 text-sm text-gray-400">
		Positions follow VATUSA facility roles until edited here. Editing a position replaces its VATUSA
		holders; reset it to follow VATUSA again. Team leads are always set here, and a lead is left off
		their team list.
	</p>
{/if}

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
	{#each data.staff as position (position.key)}
		<div class="rounded-lg border border-slate-700/60 bg-slate-800/60 shadow-sm backdrop-blur-sm">
			<div class="flex items-center justify-between border-b border-slate-700/60 px-4 py-3">
				<h2 class="text-sm font-semibold tracking-wide text-white uppercase">{position.title}</h2>
				<span class="rounded bg-sky-600/80 px-2 py-0.5 font-mono text-xs font-semibold text-white">
					{position.key}
				</span>
			</div>
			<div class="space-y-3 px-4 py-4">
				{#each position.members as member (member.cid)}
					<div class="flex items-center gap-2">
						{@render memberRow(member)}
						{#if editing}
							<form method="POST" action="?/remove" use:enhance class="ml-auto">
								<input type="hidden" name="position" value={position.key} />
								<input type="hidden" name="cid" value={member.cid} />
								<button
									type="submit"
									title="Remove {member.name}"
									class="rounded p-1 text-gray-400 transition-colors hover:bg-red-600/20 hover:text-red-400"
								>
									<IconClose class="h-4 w-4" />
								</button>
							</form>
						{/if}
					</div>
				{:else}
					<p class="text-sm text-gray-500 italic">Vacant</p>
				{/each}
			</div>
			{#if editing}
				{@const available = data.controllers.filter(
					(c) => !position.members.some((m) => m.cid === c.cid)
				)}
				<div class="space-y-2 border-t border-slate-700/60 px-4 py-3">
					<form method="POST" action="?/add" use:enhance class="flex gap-2">
						<input type="hidden" name="position" value={position.key} />
						<label for="add-{position.key}" class="sr-only">Add to {position.title}</label>
						<select
							id="add-{position.key}"
							name="cid"
							required
							class="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
						>
							{#if position.team}
								<option value="">Set lead…</option>
								<optgroup label={position.team}>
									{#each position.teamMembers as member (member.cid)}
										<option value={member.cid}>{member.name} ({member.cid})</option>
									{/each}
								</optgroup>
								<optgroup label="All controllers">
									{#each available.filter((c) => !position.teamMembers.some((m) => m.cid === c.cid)) as controller (controller.cid)}
										<option value={controller.cid}>{controller.name} ({controller.cid})</option>
									{/each}
								</optgroup>
							{:else}
								<option value="">Add controller…</option>
								{#each available as controller (controller.cid)}
									<option value={controller.cid}>{controller.name} ({controller.cid})</option>
								{/each}
							{/if}
						</select>
						<button
							type="submit"
							title="Add to {position.title}"
							class="rounded-lg bg-sky-600 px-3 text-white transition-colors hover:bg-sky-700"
						>
							<IconPlus class="h-4 w-4" />
						</button>
					</form>
					{#if !position.team}
						<div class="flex items-center justify-between text-xs">
							<span class="text-gray-500">
								{position.isManual ? 'Manually set' : 'From VATUSA roles'}
							</span>
							{#if position.isManual}
								<form method="POST" action="?/reset" use:enhance>
									<input type="hidden" name="position" value={position.key} />
									<button type="submit" class="font-medium text-sky-400 hover:text-sky-300">
										Reset to VATUSA
									</button>
								</form>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>

{#if teams.length > 0}
	<h2 class="mt-10 mb-4 text-2xl font-bold text-white">Teams</h2>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		{#each teams as position (position.key)}
			<div class="rounded-lg border border-slate-700/60 bg-slate-800/60 shadow-sm backdrop-blur-sm">
				<div class="border-b border-slate-700/60 px-4 py-3">
					<h3 class="text-sm font-semibold tracking-wide text-white uppercase">{position.team}</h3>
					{#if position.members.length > 0}
						<p class="mt-1 text-xs text-gray-400">
							Led by {position.members.map((m) => m.name).join(', ')}
						</p>
					{/if}
				</div>
				<div class="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-2">
					{#each position.teamMembers as member (member.cid)}
						<div class="flex items-center gap-2">
							{@render memberRow(member)}
						</div>
					{:else}
						<p class="text-sm text-gray-500 italic">No team members</p>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}
