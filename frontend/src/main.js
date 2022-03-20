import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import WSConnection from './services/ws.mjs';

WSConnection.connect();

const app = createApp(App);
app.use(router);
app.mount('#app');