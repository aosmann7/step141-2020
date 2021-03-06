# Biogrid

## Setting up
- First make sure to have node js and npm installed.
  - [Install Node and Npm](https://www.geeksforgeeks.org/installation-of-node-js-on-linux/)

- Then install Nx globally
  ```
  sudo npm i -g @nrwl/cli
  ```

- Then you have to install tsoa and run the tsoa script so that you can run `npm i` without any errors
  ```
  npm i tsoa
  npm run build:tsoa
  ```

- Then you have to install the libraries for and build the client api
  ```
  sudo apt install default-jdk
  sudo npm install @openapitools/openapi-generator-cli -g
  npm run build-api-client:dev
  ```

- Then install all npm modules for this workspace
  ```
  npm i
  ```

- Then install docker
  ```
  sudo apt install docker.io
  ```

## Deployment
In order to deploy you will first need access to [the biogrid heroku deploy repository](https://github.com/Lev-Stambler/biogrid-heroku-deploy).

Then clone it into the folder adjacent to this repositories parent folder
```
📂

 ┣ 📂 step141-2020

 ┣ 📂 biogrid-heroku-deploy
```

Then, when ready to deploy run
```
npm run deploy:heroku
```

## Getting running
- In order to run the development instance locally (frontend and backend)
  ```
  npm run fullstack:dev
  ```

## Tsoa and API Background
The backend uses [Tsoa](https://github.com/lukeautry/tsoa) and takes inspiration from a [Tsoa Api repo](https://github.com/MakingSense/tsoa-api).

## NX
This project was generated using [Nx](https://nx.dev)

<p align="center"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="450"></p>

🔎 **Nx is a set of Extensible Dev Tools for Monorepos.**

### Adding capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are our core plugins:

- [React](https://reactjs.org)
  - `npm install --save-dev @nrwl/react`
- Web (no framework frontends)
  - `npm install --save-dev @nrwl/web`
- [Angular](https://angular.io)
  - `npm install --save-dev @nrwl/angular`
- [Nest](https://nestjs.com)
  - `npm install --save-dev @nrwl/nest`
- [Express](https://expressjs.com)
  - `npm install --save-dev @nrwl/express`
- [Node](https://nodejs.org)
  - `npm install --save-dev @nrwl/node`

There are also many [community plugins](https://nx.dev/nx-community) you could add.

### Generate an application

Run `nx g @nrwl/react:app my-app` to generate an application.

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

### Generate a library

Run `nx g @nrwl/react:lib my-lib` to generate a library.

> You can also use any of the plugins above to generate libraries as well.

Libraries are sharable across libraries and applications. They can be imported from `@biogrid/mylib`.

### Development server

Run `nx serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `nx g @nrwl/react:component my-component --project=my-app` to generate a new component.

### Build

Run `nx build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `nx test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

### Running end-to-end tests

Run `ng e2e my-app` to execute the end-to-end tests via [Cypress](https://www.cypress.io).

Run `nx affected:e2e` to execute the end-to-end tests affected by a change.

### Understand your workspace

Run `nx dep-graph` to see a diagram of the dependencies of your projects.

### Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.

### ☁ Nx Cloud

#### Computation Memoization in the Cloud

<p align="center"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-cloud-card.png"></p>

Nx Cloud pairs with Nx in order to enable you to build and test code more rapidly, by up to 10 times. Even teams that are new to Nx can connect to Nx Cloud and start saving time instantly.

Teams using Nx gain the advantage of building full-stack applications with their preferred framework alongside Nx’s advanced code generation and project dependency graph, plus a unified experience for both frontend and backend developers.

Visit [Nx Cloud](https://nx.app/) to learn more.
