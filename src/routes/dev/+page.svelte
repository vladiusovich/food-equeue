<script lang="ts">
    import UI from "$lib/components/ui";
</script>

<div class="flex flex-col gap-5">
    <h2>UI kit (dev mode)</h2>

    <UI.Tabs
        tabs={[
            {
                title: "Typography",
                value: "Typography",
                content: "Typography",
            },
            {
                title: "Buttons",
                value: "Buttons",
                content: "Buttons",
            },
            {
                title: "Chips",
                value: "Chips",
                content: "Chips",
            },
            {
                title: "Loaders",
                value: "Loaders",
                content: "Loaders",
            },
            {
                title: "Skeletons",
                value: "Skeletons",
                content: "Skeletons",
            },
        ]}
    />
</div>
