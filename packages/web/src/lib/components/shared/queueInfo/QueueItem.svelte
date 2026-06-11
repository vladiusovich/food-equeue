<script lang="ts">
    let { title, value }: { title: string; value: number } = $props();
</script>

<div class="flex flex-col gap-1 items-center">
    <h6 class="h6">
        {title}
    </h6>
    <p>{value}</p>
</div>
