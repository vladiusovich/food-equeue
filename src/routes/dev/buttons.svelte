<script lang="ts">
    import { ArrowRightIcon } from "@lucide/svelte";

    let active = $state("january");
    const months = ["january", "february", "march"];
</script>

<div class="flex flex-col gap-5">
    <div class="flex items-center gap-4">
        <!-- A simple icon button -->
        <button
            type="button"
            class="btn-icon preset-filled"
            title="Go"
            aria-label="Go"><ArrowRightIcon size={18} /></button
        >
        <!-- A standard button -->
        <button type="button" class="btn preset-filled">Button</button>
        <!-- A button + icon -->
        <button type="button" class="btn preset-filled">
            <span>Button</span>
            <ArrowRightIcon size={18} />
        </button>
    </div>

    <div class="flex items-center gap-4">
        <button type="button" class="btn btn-sm preset-filled">Small</button>
        <button type="button" class="btn btn-base preset-filled">Base</button>
        <button type="button" class="btn btn-lg preset-filled">Large</button>
    </div>

    <button type="button" class="btn preset-filled-primary-500" disabled
        >Button</button
    >

    <nav
        class="btn-group preset-outlined-surface-200-800 flex-col p-2 md:flex-row"
    >
        {#each months as month (month)}
            <button
                type="button"
                class="btn capitalize"
                class:preset-filled={active == month}
                onclick={() => (active = month)}
            >
                {month}
            </button>
        {/each}
    </nav>

    <div class="space-y-4">
        <div class="flex gap-4">
            <button type="button" class="btn preset-filled-primary-500">Button</button>
            <button type="button" class="btn preset-tonal-primary">Button</button>
            <button type="button" class="btn preset-outlined-primary-500">Button</button>
        </div>
        <div class="flex gap-4">
            <button type="button" class="btn preset-filled-secondary-500">Button</button>
            <button type="button" class="btn preset-tonal-secondary">Button</button>
            <button type="button" class="btn preset-outlined-secondary-500">Button</button>
        </div>
        <div class="flex gap-4">
            <button type="button" class="btn preset-filled-tertiary-500">Button</button>
            <button type="button" class="btn preset-tonal-tertiary">Button</button>
            <button type="button" class="btn preset-outlined-tertiary-500">Button</button>
        </div>
        <div class="flex gap-4">
            <button type="button" class="btn preset-filled-success-500">Button</button>
            <button type="button" class="btn preset-tonal-success">Button</button>
            <button type="button" class="btn preset-outlined-success-500">Button</button>
        </div>
        <div class="flex gap-4">
            <button type="button" class="btn preset-filled-warning-500">Button</button>
            <button type="button" class="btn preset-tonal-warning">Button</button>
            <button type="button" class="btn preset-outlined-warning-500">Button</button>
        </div>
        <div class="flex gap-4">
            <button type="button" class="btn preset-filled-error-500">Button</button>
            <button type="button" class="btn preset-tonal-error">Button</button>
            <button type="button" class="btn preset-outlined-error-500">Button</button>
        </div>
        <div class="flex gap-4">
            <button type="button" class="btn preset-filled-surface-500">Button</button>
            <button type="button" class="btn preset-tonal-surface">Button</button>
            <button type="button" class="btn preset-outlined-surface-500">Button</button>
        </div>
    </div>
</div>
