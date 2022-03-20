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

<style>
.dark {
    background: #2e3440 !important;
    width: 320px !important;
    min-height: 450px !important;
}

.event-card {
	height: auto;
    width: 160px;
    min-height: 225px;
	background: #5e81ac;
	border-radius: 20px;
	overflow: hidden;
	padding: 10px 15px;
	margin-bottom: 24px;
	margin-right: 10px;
	transition: all 0.2s linear;
	cursor: pointer;
	color: white;
}

.event-card:hover {
	transform: scale(1.01);
	box-shadow: 0 3px 12px 0 rgba(0, 0, 0, 0.2),
		0 1px 15px 0 rgba(0, 0, 0, 0.19);
}

.event-card > .title {
	margin: 0;
}

.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}
</style>
