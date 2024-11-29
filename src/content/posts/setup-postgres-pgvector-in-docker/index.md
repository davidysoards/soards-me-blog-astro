---
title: 'Quick Tip: Setup PostgreSQL w/ pgvector in a docker container'
description: Quickly get an instance of PostgreSQL with pgvector running to use for local development of a RAG pipeline.
pubDate: 2024-11-28T05:10:00.000Z
heroImage: docker-postgres.png
tags:
  - postgres
  - pgvector
  - docker
  - tip
---

This post is a follow-up to my [previous post](/posts/setup-local-mysql-in-docker/) on how to setup a local MySQL instance in docker.

RAG (Retrieval Augmented Generation) is quickly becoming the "Hello World" of AI apps. If you are working or playing with Large Language Models, you will no doubt need to create a RAG pipeline at some point. An important component of RAG is a vector database, and a popular option is `pgvector` - an open-source vector similarity search for Postgres. **Here's how to quickly setup a local instance in a Docker container.**

## Pull and run the image

Pull the latest image from the docker repository. Replace `17` with your Postgres server version of choice.

```sh
docker pull pgvector/pgvector:pg17
```

Run the image, set the root user password, and expose the default Postgres port.

```sh
docker run -d --name <container_name> -e POSTGRES_PASSWORD=postgres -p 5432:5432 pgvector/pgvector:pg17
```

## Create a db inside the container

With the Postgres server running, create a database inside the container.

```sh
docker exec -it <container_name> createdb -U postgres <database_name>
```

## Connect to the database

Now we can connect to the database from our application and initialize the `pgvector` extension. I'll be using JavaScript. Setting up the entire application is outside the scope of this post, but you will need to install a couple dependencies:

```sh
pnpm add pg pgvector
```

Set a `DATABASE_URL` in your environment. I use a `.env` file. It should follow this format:

```sh
DATABASE_URL=postgresql://<pg_user>:<pg_password>@localhost:5432/<database_name>
```

For local development use `@localhost`, but if you are using something like `docker-compose.yml` and have named the service, you should use the name of the service e.g. `@db`.

In your application code, create the connection:

```js
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
```

Then, initialize `pgvector` and create a new table:

```js
async function createStore() {
  // Initialize pgvector extension and create table if not exists
  await pool.query('CREATE EXTENSION IF NOT EXISTS vector');

  return {
    vectorStore: await PGVectorStore.initialize(embeddings, {
      postgresConnectionOptions: {
        connectionString: process.env.DATABASE_URL,
      },
      tableName: 'documents', // Default table name
    }),
  };
}
```

With the `vectorStore` setup, you can add content to it using `vectorStore.addDocuments` and query for context using `vectorStore.similaritySearch`.

That's it for this post. Maybe next time I will explore more specific uses of `pgvector`, and/or using it with [Drizzle ORM](https://github.com/pgvector/pgvector-node?tab=readme-ov-file#drizzle-orm)! 👋
