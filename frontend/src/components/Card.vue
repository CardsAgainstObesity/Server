<script setup>
defineProps({
    text: {
        type: String,
        required: true
    },
    dark: {
        type: Boolean,
        required: true
    }
})
</script>

<template>
    <div v-if="dark" class="event-card dark">
        <h1 class="noselect">{{text}}</h1>
    </div>
    <div v-else class="event-card">
        <p class="noselect">{{text}}</p>
    </div>
</template>
