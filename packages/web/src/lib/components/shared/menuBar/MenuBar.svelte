<script lang="ts">
    import { Grid3x2, Circle } from "@lucide/svelte";
    import UI from "$lib/components/ui";
    import { getAppContext } from "$lib/stores/index.svelte";

    const app = getAppContext();
</script>

<div class="pinned">
    <UI.Navigation
        accent={app.orders.orderIsReady ? "success" : "primary"}
        links={[
            { label: "My Order", href: "/order", icon: Circle },
            { label: "Online Board", href: "/board", icon: Grid3x2 },
        ]}
    />
</div>

<style>
    .pinned {
        position: sticky;
        bottom: 15px;
        z-index: 50;
    }
</style>
