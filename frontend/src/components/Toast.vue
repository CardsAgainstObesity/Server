<script setup>
import { game } from "@/services/cards.mjs";
defineProps({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  }
});
</script>

<template>
    <dialog class="error" style="display: none;" open>
        <div class="content">
            <span class="text">
                <svg style="width:20px; vertical-align: bottom;" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
                ERROR: {{text}}
            </span>
        </div>
    </dialog>
</template>

<style scoped>
dialog.error {
    position: fixed;
	transform: translateX(-95%);
	left: 95%;
	width: 300px;
	background-color: #ef476f;
	border: none;
	touch-action: pan-x;
	display: flex;
	justify-content: space-between;
	position: fixed;
	min-height: 64px;
	max-height: 800px;
	box-sizing: border-box;
	overflow: hidden;
	padding: 12px 8px;
	word-break: break-word;
	min-width: 312px;
	max-width: 480px;
	z-index: 9999;
	width: -webkit-max-content;
	width: -moz-max-content;
	width: max-content;
	transition: top .3s ease-out .5s,bottom .3s ease-out .5s;
	border-radius: 8px;
	box-shadow: 0 1px 10px 0 rgba(0,0,0,.1),0 2px 15px 0 rgba(0,0,0,.05);
	margin: 0 16px;
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
	align-items: center;
}

dialog > .content {
	font-family: sans-serif;
	line-height: 20px;
	display: flex;
	flex-direction: column;
	color: #fff;
}

dialog > .content > .text {
	margin-bottom: 2px;
	font-size: 16px;
	font-weight: 700;
}
</style>