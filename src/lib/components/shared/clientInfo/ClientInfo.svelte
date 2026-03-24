<script lang="ts">
    import { getAppContext } from "$lib/stores";

    const app = getAppContext();
</script>

<div
    class="card preset-filled-surface-100-900 border border-surface-200-800 w-full divide-surface-200-800 p-3"
>
    <div class="flex gap-5 items-center">
        <h6 class="h6">Your number</h6>
        <h2 class="h2">{app.user.orderId}</h2>
    </div>
</div>
