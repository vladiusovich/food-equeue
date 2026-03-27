<script lang="ts">
    let props = $props();
</script>

<div class="flex flex-col gap-1 items-center">
    <h6 class="h6">
        {props.title}
    </h6>
    <p>{props.value}</p>
</div>
