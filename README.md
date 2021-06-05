# Create a fully type safe GraphQL API with Nodejs, Typescript and Prisma

Prisma is a modern object relational mapper (ORM) that lets you build new greenfield projects at high speed with few errors, it also has an introspect feature which can be used on existing databases to generate a schema.
Prisma currently supports PostgreSQL, MySQL and SQLite and our working on NoSQL databases. Prisma is easy to integrate into your framework of choice. Prisma simplifies database access and saves repetitive Create, Read, Update, Delete (CRUD) boilerplate and increases type safety. It's the ideal database toolkit for building robust and scalable web APIs.

## Tech stack

- Node.js ≥ 14.17.0 (LTS)
- Typescript
- Apollo Server
- Prisma
- GraphQL
- Node Package Manager

## What are we building ?

For the purposes of this demo, we'll model a very basic database for a sneaker store and expose some of the data via a graphql api.

## Scaffolding the app

```bash
mkdir graphql-node-typescript-prisma
npm init -y
npx tsc --init
```

### Install dependencies

```bash
npm i apollo-server graphql
```

### Install developer dependencies

```bash
npm i ts-node ts-node-dev typescript @types/node prisma -D
```

### Add scripts

We'll use ts-node-dev for hot reloading capabilities whilst we develop, you can also choose to use nodemon if thats what you prefer.

```json
  "scripts": {
    "compile": "tsc",
    "dev": "ts-node-dev src/app/main",
    "start": "node ./build/app/main.js"
  },
```

Your package.json should now look like this

```json
{
  "name": "graphql-node-typescript-prisma",
  "version": "0.0.1",
  "description": "Create a fully typesafe GraphQL API with Nodejs, Typescript and Prisma",
  "author": "Angad Gupta",
  "license": "MIT",
  "scripts": {
    "compile": "tsc",
    "dev": "ts-node-dev src/app/main",
    "start": "node ./build/app/main.js"
  },
  "dependencies": {
    "@prisma/client": "^2.23.0",
    "apollo-server": "^2.25.0",
    "graphql": "^15.5.0"
  },
  "devDependencies": {
    "@types/node": "^15.6.1",
    "prisma": "^2.23.0",
    "ts-node": "^10.0.0",
    "ts-node-dev": "^1.1.6",
    "typescript": "^4.3.2"
  }
}
```

## Basic commands

```json
npm run compile  // to compile typescript to javascript
npm run dev     // to start the dev server
npm run start  // to start the production server that serves the compiled javascript
```

## Bootstrap an apollo graphql server with

We'll initialise a new server using ApolloServer and pass our schema and context.

```typescript
import { ApolloServer } from 'apollo-server'
import { schema } from './graphql/schema'
import { context } from './graphql/context'

const server = new ApolloServer({
  schema,
  context,
})

server.listen().then(({ url }) => {
  console.log(`graphql api running at ${url}graphql`)
})
```

## Lets add Prisma

From the root directory init prisma

```bash
npx prisma init
```

This will add a new Prisma folder with some starter files.

## Set database

For the purposes of this demo we'll be using SQLite as its easier for people to get started, If you're familiar with docker, you can also run a docker container with postgres.

```typescript
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

## Data modelling in the Prisma schema

Central to Prisma is the schema - a declarative way to define your app's data models and their relations that's human-readable. And you don't have to painstakingly create it from scratch if you already have a database - prisma introspect takes care of that.

For our demo we'll use the following Shoe model

```typescript
model Shoe {
  shoeId     String  @id @default(uuid())
  name       String
  price      Int
  isTrending Boolean
  isSoldOut  Boolean
}
```

## Run migrations

Now that we have a basic model, let's run our initial migration.

```bash
npx prisma migrate dev
```

The migrations will generate a SQL statement before applying the changes to the database.

```SQL
-- CreateTable
CREATE TABLE "Shoe" (
    "shoeId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "isTrending" BOOLEAN NOT NULL,
    "isSoldOut" BOOLEAN NOT NULL
);
```

## Context

Lets add prisma and the generated prisma client to our graphql context

```bash
 cd src/app/graphql/
 touch context.ts
```

## Schema first approach

We'll use the schema first approach and then hook up our graphql resolvers with the generated prisma client for typesafe data querying.

```graphql
type Query {
  getAllShoes: [Shoe!]
  getShoeById(shoeId: String!): Shoe!
  getAllTrendingShoes: [Shoe!]
  getAllSoldOutShoes: [Shoe!]
}

type Mutation {
  createAShoe(name: String!, price: Int!, isTrending: Boolean!, isSoldOut: Boolean!): Shoe!
  updateAShoe(name: String!, price: Int!, isTrending: Boolean!, isSoldOut: Boolean!): Shoe!
  deleteAShoe(shoeId: String!): Shoe!
  markAShoeAsSoldOut(shoeId: String!): Shoe!
}

type Shoe {
  shoeId: String!
  name: String!
  price: Int!
  isTrending: Boolean!
  isSoldOut: Boolean!
}
```

## Resolvers

For the purposes of this demo, we'll add all our resolvers in a single schema.ts file, however for productions use cases these should be separated to individual node/typescript modules for better testing and maintainability. The resolvers are written using the async/await syntax.

```typescript
const resolvers = {
  Query: {
    getAllShoes: async (_obj: any, _args: any, context: Context, _info: any) => {
      const response = await context.prisma.shoe.findMany()

      return response
    },
    getShoeById: async (_obj: any, args: Prisma.ShoeWhereUniqueInput, context: Context, _info: any) => {
      const { shoeId } = args

      const response = await context.prisma.shoe.findUnique({
        where: {
          shoeId,
        },
      })

      return response
    },
    getAllTrendingShoes: async (_obj: any, _args: any, context: Context, _info: any) => {
      const response = await context.prisma.shoe.findMany({
        where: {
          isTrending: true,
        },
      })

      return response
    },
    getAllSoldOutShoes: async (_obj: any, _args: any, context: Context, _info: any) => {
      const response = await context.prisma.shoe.findMany({
        where: {
          isSoldOut: true,
        },
      })

      return response
    },
  },
  Mutation: {
    createAShoe: async (_parent: any, args: Prisma.ShoeCreateInput, context: Context, info: any) => {
      const { name, price, isTrending, isSoldOut } = args

      const response = await context.prisma.shoe.create({
        data: {
          name,
          price,
          isTrending,
          isSoldOut,
        },
      })

      return response
    },
    updateAShoe: async (_parent: any, args: Prisma.ShoeCreateInput, context: Context, info: any) => {
      const { shoeId, name, price, isTrending, isSoldOut } = args

      const response = await context.prisma.shoe.update({
        where: {
          shoeId,
        },
        data: {
          name,
          price,
          isTrending,
          isSoldOut,
        },
      })

      return response
    },
    deleteAShoe: async (_parent: any, args: Prisma.ShoeWhereUniqueInput, context: Context, info: any) => {
      const { shoeId } = args

      const response = await context.prisma.shoe.delete({
        where: {
          shoeId,
        },
      })

      return response
    },
    markAShoeAsSoldOut: async (_parent: any, args: Prisma.ShoeWhereUniqueInput, context: Context, info: any) => {
      const { shoeId } = args

      const response = await context.prisma.shoe.update({
        where: {
          shoeId,
        },
        data: {
          isSoldOut: true, // mark shoe as sold out
        },
      })

      return response
    },
  },
}
```

## Seed

Lets seed some data...

The seed.ts file contains three Shoe records. These records will be added to the database after running the commands

Run the following commands.

```bash
npx prisma db seed --preview-feature
```

```json
Result:
{
  nike: {
    shoeId: 'abb378df-f975-4b1e-8529-c90597ff477e',
    name: 'Nike ',
    price: 140,
    isTrending: true,
    isSoldOut: false
  },
  addidas: {
    shoeId: 'fc1a0e73-54cc-41ef-8a65-d5c959d2010c',
    name: 'Adidas',
    price: 220,
    isTrending: false,
    isSoldOut: false
  },
  timberland: {
    shoeId: '06ea4798-7aec-4920-8079-4ce8797551eb',
    name: 'Timberland',
    price: 240,
    isTrending: false,
    isSoldOut: true
  }
}

🌱  Your database has been seeded.
```

Initialise a new PrismaClient create an interface for the context and export the context, we'll now use this context in the main.ts file. Context is the third argument in a graphql resolver and we'll be able to use the prisma client to make calls to our database. Just a note, in this example we'll assume that we only have one client.

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface Context {
  prisma: PrismaClient
}

export const context: Context = {
  prisma: prisma,
}
```

## Start server

```bash
npm run dev
```

```bash
api ready at http://localhost:4000/graphql
```

## Lets explore via graphql playground

```bash
http://localhost:4000/graphql
```

## Available graphql queries

### getAllShoes

Returns a list of all shoes

```gql
query getAllShoes {
  getAllShoes {
    shoeId
    name
    price
    isTrending
    isSoldOut
  }
}
```

```json
{
  "data": {
    "getAllShoes": [
      {
        "shoeId": "0080a037-e338-4898-9ab3-5932473ad21a",
        "name": "Nike ",
        "price": 140,
        "isTrending": true,
        "isSoldOut": false
      },
      {
        "shoeId": "d4bda185-89d8-4c7c-873a-371388461874",
        "name": "Adidas",
        "price": 160,
        "isTrending": false,
        "isSoldOut": false
      },
      {
        "shoeId": "7e3eff3c-bd63-4b68-b844-5373894603e4",
        "name": "Timberland",
        "price": 240,
        "isTrending": false,
        "isSoldOut": true
      }
    ]
  }
}
```

### getShoeById

Returns a shoe by uuid

```gql
query getShoeById {
  getShoeById(shoeId: "0080a037-e338-4898-9ab3-5932473ad21a") {
    shoeId
    name
    price
    isTrending
  }
}
```

```json
{
  "data": {
    "getShoeById": {
      "shoeId": "0080a037-e338-4898-9ab3-5932473ad21a",
      "name": "Nike ",
      "price": 140,
      "isTrending": true
    }
  }
}
```

### getAllTrendingShoes

Returns a list of all trending shoes

```gql
query getAllTrendingShoes {
  getAllTrendingShoes {
    shoeId
    name
    price
    isTrending
  }
}
```

```json
{
  "data": {
    "getAllTrendingShoes": [
      {
        "shoeId": "0080a037-e338-4898-9ab3-5932473ad21a",
        "name": "Nike ",
        "price": 140,
        "isTrending": true
      }
    ]
  }
}
```

### getAllSoldOutShoes

Returns a list of all sold out shoes

```gql
query getAllSoldOutShoes {
  getAllSoldOutShoes {
    shoeId
    name
    price
    isTrending
  }
}
```

```json
{
  "data": {
    "getAllSoldOutShoes": [
      {
        "shoeId": "7e3eff3c-bd63-4b68-b844-5373894603e4",
        "name": "Timberland",
        "price": 240,
        "isTrending": false
      }
    ]
  }
}
```

## Available graphql mutations

### createAShoe

Adds a new shoe

```gql
mutation {
  createAShoe(name: "yeezys 350", price: 600, isTrending: true, isSoldOut: false) {
    shoeId
    name
    price
    isTrending
    isSoldOut
  }
}
```

```json
{
  "data": {
    "createAShoe": {
      "shoeId": "249d54dc-c7fa-48fe-a657-fbf6349fb308",
      "name": "yeezys 350",
      "price": 600,
      "isTrending": false,
      "isSoldOut": false
    }
  }
}
```

### updateAShoe

Updates a shoe by using a shoeId.

Lets update the shoe added in previous mutation set it as trending by setting isTrending to true.

```gql
mutation updateAShoe {
  updateAShoe(shoeId: "249d54dc-c7fa-48fe-a657-fbf6349fb308", isTrending: true) {
    shoeId
    name
    price
    isTrending
    isSoldOut
  }
}
```

```json
{
  "data": {
    "updateAShoe": {
      "shoeId": "249d54dc-c7fa-48fe-a657-fbf6349fb308",
      "name": "yeezys 350",
      "price": 600,
      "isTrending": true,
      "isSoldOut": false
    }
  }
}
```

### markAShoeAsSoldOut

Marks a shoe as sold out.

Lets set the shoe we previously updated to be sold out.

```graphql
mutation {
  markAShoeAsSoldOut(shoeId: "249d54dc-c7fa-48fe-a657-fbf6349fb308") {
    shoeId
    name
    price
    isTrending
    isSoldOut
  }
}
```

```json
{
  "data": {
    "markAShoeAsSoldOut": {
      "shoeId": "249d54dc-c7fa-48fe-a657-fbf6349fb308",
      "name": "yeezys 350",
      "price": 600,
      "isTrending": true,
      "isSoldOut": true
    }
  }
}
```

### deleteAShoe

Delete a shoe by shoeId

Lets delete the shoe permanently from the database. Note this is a hard delete, in instances where you would like to only soft delete, you can use the update flow and introduce a new field in the to the model called isDeleted and set that to true.

```graphql
mutation {
  deleteAShoe(shoeId: "249d54dc-c7fa-48fe-a657-fbf6349fb308") {
    shoeId
    name
    price
    isTrending
    isSoldOut
  }
}
```

```json
{
  "data": {
    "deleteAShoe": {
      "shoeId": "249d54dc-c7fa-48fe-a657-fbf6349fb308",
      "name": "yeezys 350",
      "price": 600,
      "isTrending": true,
      "isSoldOut": true
    }
  }
}
```

## Inspecting the database directly

You can inspect the database directly by running the following

```bash
npx prisma studio

Environment variables loaded from prisma/.env
Prisma schema loaded from prisma/schema.prisma
Prisma Studio is up on http://localhost:5555
```

This will instantly open a graphical user interface (gui) on <http://localhost:5555> very helpful for quickly viewing, adding, editing or adding new records.

## Conclusion

We learnt how to create a new graphql api and use prisma to query our database in a type safe manner.
Prisma is a solid ORM with many advantages that are yet to be introduced by others. Use this database toolkit to enhance your productivity and delivery velocity.

## Code

Feel free to extend this tutorial by adding more functionality. This tutorial only lightly touches the capabilities of Prisma. You can clone and fork this repository in its entirety via my GitHub here.

## Learn more about Prisma

<https://www.prisma.io/>
