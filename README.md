<h3 align="center">Simple Whatsapp Api</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/kylelobo/The-Documentation-Compendium.svg)](https://github.com/kylelobo/The-Documentation-Compendium/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/kylelobo/The-Documentation-Compendium.svg)](https://github.com/kylelobo/The-Documentation-Compendium/pulls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center"> 
  Free simple whatsapp api for notify your client or validate your client's phone number.<br> 
  Based on [whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)</a> project.
</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Usage](#usage)
- [Built Using](#built_using)
- [TODO](../TODO.md)
- [Contributing](../CONTRIBUTING.md)
- [Authors](#authors)
- [Acknowledgments](#acknowledgement)

## 🧐 About <a name = "about"></a>

TO DO

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

You will need Docker Installed on your computer. Please take a look on the get started section.

```
https://www.docker.com/get-started/
```

### Running

Running services on local.

Using Docker

```bash
#!/bin/bash
docker run -p 80:80 -e SESSION_SECRET=StrongSessionSecret -e DB_CONNECTION_STRING=mongodb://localhost:27017/swa -v ./data:/app/data taufikdev88/simplewhatsappapi
```

## 🚀 Deployment <a name = "deployment"></a>

You can deploy using docker-compose file or using kubernetes as a internal service. Don't publish port to external network because this service has no authentication/authorization method configured.

## ⛏️ Built Using <a name = "built_using"></a>

- [MongoDB](https://www.mongodb.com/) - Database
- [Express](https://expressjs.com/) - Server Framework
- [NodeJs](https://nodejs.org/en/) - Server Environment

## ✍️ Authors <a name = "authors"></a>

- [@taufikdev88](https://github.com/taufikdev88) - Idea & Initial work

See also the list of [contributors](https://github.com/taufikdev88/simplewhatsappapi/contributors) who participated in this project.

## 🎉 Acknowledgements <a name = "acknowledgement"></a>

- Hat tip to anyone whose code was used
- Inspiration
- References
