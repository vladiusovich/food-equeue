<script lang="ts">
    import { CircuitBoard, Circle } from "@lucide/svelte";
    import UI from "$lib/components/ui";
</script>

<div class="pinned">
<div>

</div>
    <UI.Navigation
        links={[
            { label: "My Order", href: "/order", icon: Circle },
            { label: "Online Board", href: "/board", icon: CircuitBoard },
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
