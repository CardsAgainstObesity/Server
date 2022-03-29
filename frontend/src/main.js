import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import WSConnection from './services/ws.mjs';

WSConnection.connect();

const app = createApp(App);
app.use(router);
app.mount('#app');

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/service-worker.js').then(function (registration) {
            // Registration was successful
            console.log('Registered!');
        }, function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        }).catch(function (err) {
            console.log(err);
        });
    });
} else {
    console.log('service worker is not supported');
}