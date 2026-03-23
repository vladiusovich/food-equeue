<script lang="ts">
    import { getAppContext } from "$lib/stores";

	const app = getAppContext();
</script>

<div
	class="card preset-filled-surface-100-900 border border-surface-200-800 w-full divide-surface-200-800 p-2"
>
	<header>Your number</header>
	<article class="p-2">
		{app.user.orderId}
	</article>
</div>
