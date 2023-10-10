#### 2.2.0 (2023-10-10)

##### Bug Fixes

*  add validation api callback before generate otp ([5005f4d0](https://github.com/taufikdev88/simplewhatsappapi/commit/5005f4d06992ebcb8a6c8ba281bf244ab1c018cb))
*  docker build error ([9d4874f0](https://github.com/taufikdev88/simplewhatsappapi/commit/9d4874f073e718374a3787909575921f70c21d02))
*  add payload to post callback api ([f017d473](https://github.com/taufikdev88/simplewhatsappapi/commit/f017d473f1ed4623a1905c39e3b46129224c13c4))
*  change attribute otp, change checkSchema for callback otp ([a2332e9a](https://github.com/taufikdev88/simplewhatsappapi/commit/a2332e9ad08cb0e1032fcd97bb8d38ca0043a8e1))

##### New Features

*  add optional function callback url when validate otp ([7d5dfbff](https://github.com/taufikdev88/simplewhatsappapi/commit/7d5dfbfffbfce98066626bcb2737293b06021cd3))
*  add validator date when get count request otp ([03500e8d](https://github.com/taufikdev88/simplewhatsappapi/commit/03500e8d2502ef4af9cf1e1374b2ce1e81108461))
*  get count request otp by range date ([fd044435](https://github.com/taufikdev88/simplewhatsappapi/commit/fd044435b6791ebc42e320fbd1d00c2ce95d14f1))
*  add validated otp log & add attr cs at otp ([f49d3919](https://github.com/taufikdev88/simplewhatsappapi/commit/f49d391953f6e20238f2a493dd1f59f3bfecf1eb))

#### 2.1.1 (2023-10-06)

##### Chores

*  upgrade baileys version to 6.5.0 ([df57b4e7](https://github.com/taufikdev88/simplewhatsappapi/commit/df57b4e72b2582f71a1a79b11ad348c4c445a43d))

##### New Features

*  add expiredAt attribute to otp generation ([5b875248](https://github.com/taufikdev88/simplewhatsappapi/commit/5b87524881d7441e0a889258899e9d1513bf4975))

##### Bug Fixes

*  cannot proces disappearing message ([02e1250c](https://github.com/taufikdev88/simplewhatsappapi/commit/02e1250c135b110830a57a805691ab3e60c4e8a9))

#### 2.1.0 (2023-08-09)

##### Build System / Dependencies

*  fixing dependencies (9e387a1d)
*  update docker compose (3fedfc79)
*  update release tag (d959bddf)

##### Chores

*  use logger over console (bad70b07)
*  update git ignore file (1fd08cd6)
*  upgrade baileys version to 6.4.0 (721740a2)

##### New Features

*  add otp request page (938f866e)
*  otp validation from recipient (a204a6c9)
*  request otp with custom message template (2170fc8a)
*  add otp-service for creation and validation (729dfcf0)
*  send message page (9c675608)

##### Bug Fixes

*  default session secret (18066999)
*  error response fixing (bbb902d7)
*  set submit button disabled when send form data (58e3f479)
*  formatter, otp action url encode, whatsapp service logger (a61865f3)
*  number formatting (77b476fe)
*  fixing formatting jid to phone number with cc (e21daa9f)
*  navbar collapse (70fe9e53)

##### Other Changes

*  full refactoring and styling (99808a4c)

##### Reverts

*  change default port to 80 (161e2455)

##### Code Style Changes

*  fixing express validation chain (9220b7fd)

