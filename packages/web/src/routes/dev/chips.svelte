<script lang="ts">
    import { CheckIcon } from "@lucide/svelte";
</script>

<div class="flex flex-col items-start gap-4">
    <!-- A simple icon chip -->
    <button type="button" class="chip-icon preset-filled">
        <CheckIcon size={16} />
    </button>
    <!-- A standard chip -->
    <button type="button" class="chip preset-filled">Chip</button>
    <!-- A chip + icon -->
    <button type="button" class="chip preset-filled">
        <span>Chip</span>
        <CheckIcon size={16} />
    </button>

    <div class="flex gap-4">
        <button type="button" class="chip preset-filled-primary-500"
            >Chip</button
        >
        <button type="button" class="chip preset-tonal-primary">Chip</button>
        <button type="button" class="chip preset-outlined-primary-500"
            >Chip</button
        >
    </div>
    <div class="flex gap-4">
        <button type="button" class="chip preset-filled-secondary-500"
            >Chip</button
        >
        <button type="button" class="chip preset-tonal-secondary">Chip</button>
        <button type="button" class="chip preset-outlined-secondary-500"
            >Chip</button
        >
    </div>
    <div class="flex gap-4">
        <button type="button" class="chip preset-filled-tertiary-500"
            >Chip</button
        >
        <button type="button" class="chip preset-tonal-tertiary">Chip</button>
        <button type="button" class="chip preset-outlined-tertiary-500"
            >Chip</button
        >
    </div>
    <div class="flex gap-4">
        <button type="button" class="chip preset-filled-success-500"
            >Chip</button
        >
        <button type="button" class="chip preset-tonal-success">Chip</button>
        <button type="button" class="chip preset-outlined-success-500"
            >Chip</button
        >
    </div>
    <div class="flex gap-4">
        <button type="button" class="chip preset-filled-warning-500"
            >Chip</button
        >
        <button type="button" class="chip preset-tonal-warning">Chip</button>
        <button type="button" class="chip preset-outlined-warning-500"
            >Chip</button
        >
    </div>
    <div class="flex gap-4">
        <button type="button" class="chip preset-filled-error-500">Chip</button>
        <button type="button" class="chip preset-tonal-error">Chip</button>
        <button type="button" class="chip preset-outlined-error-500"
            >Chip</button
        >
    </div>
    <div class="flex gap-4">
        <button type="button" class="chip preset-filled-surface-500"
            >Chip</button
        >
        <button type="button" class="chip preset-tonal-surface">Chip</button>
        <button type="button" class="chip preset-outlined-surface-500"
            >Chip</button
        >
    </div>
</div>
