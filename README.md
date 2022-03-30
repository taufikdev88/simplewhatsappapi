# simplewhatsappapi
Simple whatsapp api untuk microservice atau untuk layanan internal anda

Tanpa authentikasi
Bisa digabung dengan identityserver anda sendiri melalui api gateway

default port: 80

endpoint:
  1. HTTPGET / -> simple message
  2. HTTPGET /status -> json status koneksi whatsapp dan qr string untuk diolah sendiri
  3. HTTPGET /qr -> image qr yang bisa digunakan untuk scan
  4. HTTPPOST /message -> kirim instant message
  5. HTTPPOST /logout -> menghapus file session

penggunaan:
  docker pull taufikdev88/simplewhatsappapi
  docker run -d --restart always -p 80:80 -e ./data:/app/data taufikdev88/simplewhatsappapi
