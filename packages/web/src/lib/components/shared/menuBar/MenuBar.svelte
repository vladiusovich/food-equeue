<script lang="ts">
    import { Grid3x2, Circle } from "@lucide/svelte";
    import UI from "$lib/components/ui";
</script>

<div class="pinned">
    <UI.Navigation
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
