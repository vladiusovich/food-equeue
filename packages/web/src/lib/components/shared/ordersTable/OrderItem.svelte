<script lang="ts">
    let { value, isCurrent } = $props();
</script>

<span class={["chip", isCurrent && "preset-filled-success-500"]}>
    {value}
</span>
