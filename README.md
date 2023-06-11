# simplewhatsappapi
Simple whatsapp api untuk microservice atau untuk layanan internal anda

Tanpa authentikasi
Bisa digabung dengan identityserver anda sendiri melalui api gateway

default port: 80

endpoint:
  1. GET / -> simple message
  2. GET /status -> json status koneksi whatsapp dan qr string untuk diolah sendiri
  3. GET /qr -> image qr yang bisa digunakan untuk scan
  4. POST /message -> kirim instant message

debug program:
  yarn install
  yarn run build
  yarn run start

penggunaan:
  docker pull taufikdev88/simplewhatsappapi
  docker run -d --restart always -p 80:80 -e ./data:/app/data taufikdev88/simplewhatsappapi
