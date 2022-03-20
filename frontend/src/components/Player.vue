<script setup>
import IconPlayer from "@/components/icons/IconPlayer.vue";
import IconPlayerReady from "@/components/icons/IconPlayerReady.vue";
defineProps({
    name: {
        type: String,
        required: true
    },
    ready: {
        type: Boolean,
        required: false
    },
    avatar: {
        type: String,
        required: false
    }
})
</script>

<template>
    <div class="player">
        <IconPlayer />
        <span>{{name}}</span>
    </div>
</template>