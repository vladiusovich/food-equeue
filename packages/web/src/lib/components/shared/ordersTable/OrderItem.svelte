<script lang="ts">
    let { value, isCurrent } = $props();
</script>

<span
    class="chip"
    class:preset-filled-success-500={isCurrent}
>
    {value}
</span>
