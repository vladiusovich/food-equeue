<script lang="ts">
	import { getAppContext } from "$lib/stores";

	const app = getAppContext();

	let branch = app.branch.info;

	$effect(() => {
		app.user.fetch();
	});
</script>

<div
	class="card preset-filled-surface-100-900 border border-surface-200-800 w-full divide-surface-200-800 p-2"
>
	<header>{branch?.name}</header>
	<article class="p-2">
		{branch?.address}
	</article>
</div>
