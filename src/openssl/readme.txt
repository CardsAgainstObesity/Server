Evidentemente estas llaves son solo para hacer pruebas, en producción se usarán certificados de Let's Encrypt y ni de coña se subirán a GitHub

Comando para generar las llaves:
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365