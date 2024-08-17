<p align="center">
  <img src="https://github.com/user-attachments/assets/62a1704b-14ad-412f-ad8e-196db8d63007
"
>
</p>

## Overview
- [Introduction](#picscape-backend)
- [Project Setup](#project-setup)
- [Project Status](#project-status)
- [API Routes](#api-routes)
- [Reporting Issues](#reporting-issues)



HayaseDB is a public anime database where users can find detailed information about their favorite shows. It provides data on anime titles, characters, episode counts, and more, all in one place. Ideal for anime fans and developers, HayaseDB is open-source and community-driven, ensuring up-to-date and accurate information.



## Project Setup

### Run in dev mode
```
npm run docker:dev
```

### Run in production  mode
```
npm run docker:prod
```


### For the complete functionality of this project, the [frontend](https://github.com/AIO-Develope/PicScape-Frontend/) is essential.

## API Routes (extremely outdated and I will move it to a wiki soon)

### authRoutes.js
```
POST /auth/login
The endpoint provides the JWT authentication key only if the email and password sent in the request body correctly correspond to a registered user.

POST /api/register
This endpoint receives a request with a password, email and username in the body, then  adds it to the "Account" collection.
```

### fetchRoutes.js
```
GET /fetch/account
This endpoint responds with the account information corresponding to the token contained in the "Authorization" header.

POST /fetch/account/:username
This endpoint responds with the account information corresponding to the username specified in the parameter ":username".
```

## Project Status
PicScape is a relatively new project and it may currently lack some functionality and features. However, I am continually improving the project in the future. Additionally, PicScape will be available as a fully functional service in the future, ready for you to use.

## Reporting Issues

If you encounter any problems while using PicScape or have suggestions for improvement, please don't hesitate to open an issue on the GitHub repository. Your feedback is crucial in helping me identify areas for enhancement and address any issues that arise.

To report an issue:

1. Go to the [Issues](https://github.com/AIO-Develope/PicScape-Backend/issues) section of the repository.
2. Provide a clear and detailed description of the problem you've encountered or the feature you'd like to suggest.
3. If possible, include steps to reproduce the issue or examples to clarify your suggestion.
5. Add any relevant files.

Thank you for your help.
