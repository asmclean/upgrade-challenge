## Description

This service is a simple REST API which provides island campsite availability as well as the ability to create, update, and cancel reservations to the island campsite.  It is written in TypeScript using the [NestJS](https://nestjs.com/) framework, and uses a [PostgreSQL](https://www.postgresql.org/) database for storage.

## Service API

A Swagger UI is available on the service using the `/api` endpoint, and the Swagger JSON file is available at `/api-json`.

The service supports the following operations:

`GET /availabillity`: This returns the dates that are currently available to be reserved.  Query parameters `start` and `end` can be used to specify a range in which to look for available dates.  Query parameters must be in `YYYY-MM-DD` format.  The response is memoized with a lifetime of one second in order to minimize database requests during high traffic.

`POST /reservation`: Create a new reservation.  The body must supply `fullName`, `email`, `arrival`, and `departure` values.  Dates should be in `YYYY-MM-DD` format.  If the requested dates conflict with an existing reservation, the request will fail with HTTP status code 409.  If successful, the reservation's data will be returned, which includes the specified values as well as a randomly generated `id` value which can be used to update or cancel the reservation.

`PATCH /reservation/:id`: Update an existing reservation.  The `id` parameter must refer to an existing reservation.  All other body values as mentioned in `POST /reservation` are supported but are optional.

`DELETE /reservation/:id`: Cancel an existing reservation.  The reservation with the specified `id` will be removed from the service.

## Installation

```bash
$ npm install
```

Service configuration is managed through environment variables, which can easily be set using a `.env` file that contains simple assignments, e.g. `DB_HOST=localhost`.  See https://github.com/motdotla/dotenv for more information.

To ease testing and development, a simple `docker-compose.yml` file is included in the top-level of the project which supports quickly launching a PostgreSQL database.  Running `docker-compose up -d` in the root of the project will provide an instance that is configured for end-to-end tests.  The instance can also be used while running the service locally.  To do so, populate the `.env` file in the project root with:

```
DB_HOST=localhost
DB_PORT=55432
DB_USERNAME=user
DB_PASSWORD=pass
DB_DATABASE=test
DB_SYNCHRONIZE=true
```

## Running the Service

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Testing the Service
Unit test files are placed in the source tree alongside the code under test, using the `.spec.ts` suffix.  End-to-end tests and supporting files are found inside the `test` directory.

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```

## Building a Container
The top-level of the project also contains a `Dockerfile` which can be used to build a containerized version of the service using a standard `docker build` command.
