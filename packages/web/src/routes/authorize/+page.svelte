<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { getAppContext } from "$lib/stores/index.svelte";
    import UI from "$lib/components/ui";

    const app = getAppContext();

    const hash = $derived(page.url.searchParams.get("hash"));

    $effect(() => {
        if (hash !== null) {
            handleRedirect(hash);
        }
    });

    async function handleRedirect(currentHash: string) {
        app.user.auth.logout();
        await app.user.auth.login(currentHash);

        if (app.user.auth.isLoggedIn) {
            goto("order", { replaceState: true });
        } else {
            goto("/", { replaceState: true });
        }
    }
</script>

<div class="flex flex-1 flex-col items-center justify-center gap-4.5 px-6 py-10">
    <UI.Spinner size={56} thickness={6} arc={270} duration="0.9s" />

    <div class="flex flex-col items-center gap-1.5 text-center">
        <h2 class="text-lg font-bold text-surface-50">Looking for your order</h2>
        <p class="text-sm font-medium text-surface-200">This usually takes a couple of seconds</p>
    </div>

    <div class="mt-4 flex w-full flex-col gap-2 opacity-60">
        <UI.ShimmerBar class="h-3 w-3/5" />
        <UI.ShimmerBar class="h-3 w-9/10" />
        <UI.ShimmerBar class="h-3 w-2/5" />
    </div>
</div>
