<script lang="ts">
	import { getAppContext } from "$lib/stores";
	const app = getAppContext();

	const readyOrders = app.orders.ordersProgress.ready ?? [];
	const isReady = readyOrders.some((order) => order.isCurrent);
</script>

{#if isReady}
	<div
		class="card preset-filled-surface-100-900 border border-surface-200-800 w-full divide-surface-200-800 p-2"
	>
		<h5>Your order is ready</h5>
		<p>Please pick up your order at the pick-up location</p>
	</div>
{/if}
