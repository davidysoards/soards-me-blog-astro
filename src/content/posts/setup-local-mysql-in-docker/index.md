---
title: 'Quick Tip: Setup a local MySQL in a docker container'
description: Quickly get an instance of MySQL running to use for local development without having to install MySQL on your system.
pubDate: 2024-07-14T05:10:00.000Z
heroImage: docker-mysql.png
tags:
  - mysql
  - docker
  - tip
---

I've been working through the [tutorials](https://go.dev/doc/tutorial/) in the Go docs (which are super helpful and I highly recommend them) and for the section on "Accessing a relational database", I needed an instance of MySQL.
**Not wanting to install it on my local machine**, I opted to use docker instead. **Here's how I got a quick throwaway instance up and seeded it with minimal effort.**

## Pull and run the image

Pull the MySQL image from the docker repository. This step can be skipped if `mysql` has been pulled previously.

```sh
docker pull mysql
```

Run the image, set the root user password and expose the default MySQL port. `latest` is a tag that specifies which MySQL version to use.

```sh
docker run -d --name docker-mysql -e MYSQL_ROOT_PASSWORD=youshallnotpass -p 3306:3306 mysql:latest
```

## Create a db and seed it

To run `mysql` commands on the db, open a bash inside the new container.

```sh
docker exec -it docker-mysql bash
```

Login as the root user. When prompted, use the `MYSQL_ROOT_PASSWORD` set above.

```sh
mysql -u root -p
# Enter password: <MYSQL_ROOT_PASSWORD>

# mysql>
```

Create a database and name it.

```sh
mysql> create database new-db;
```

Switch to that new database.

```sh
mysql> use new-db;
# Database changed
```

Seed the database by pasting SQL commands directly into the bash window, such as this one for creating a todo table:

```sql
DROP TABLE IF EXISTS todo;
CREATE TABLE todo (
  id      INT AUTO_INCREMENT NOT NULL,
  text    VARCHAR(255) NOT NULL,
  done    BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (id)
);

INSERT INTO todo
  (text, done)
VALUES
  ('Do the Laundry', true),
  ('Clean the Kitchen', false),
  ('Mow the Lawn', false);
```

Verify it worked by running a select statement.

```sh
mysql> select * from todo;
+----+-------------------+------+
| id | text              | done |
+----+-------------------+------+
|  1 | Do the Laundry    |    1 |
|  2 | Clean the Kitchen |    0 |
|  3 | Mow the Lawn      |    0 |
+----+-------------------+------+
3 rows in set (0.00 sec)
```

You now have a **local MySQL database** with data you can **query or write to** running at `127.0.0.1:3306`.
But you don't have to take my word for it! 🌈
