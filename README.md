# FMDB ~ Fastify MariaDB plugin

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
![CI](https://github.com/victor0801x/fastify-mariadb/workflows/CI/badge.svg)
[![npm version](https://img.shields.io/npm/v/fastify-mariadb.svg?style=flat)](https://www.npmjs.com/package/fmdb)
[![npm downloads](https://img.shields.io/npm/dm/fastify-mariadb.svg?style=flat)](https://www.npmjs.com/package/fmdb)
<!-- [![Known Vulnerabilities](https://snyk.io/test/github/victor0801x/fastify-mariadb/badge.svg?targetFile=package.json&style=flat)](https://snyk.io/test/github/victor0801x/fastify-mariadb?targetFile=package.json) -->
<!-- [![codecov](https://codecov.io/gh/victor0801x/fastify-mariadb/branch/master/graph/badge.svg?style=flat)](https://codecov.io/gh/victor0801x/fastify-mariadb) -->
<!--[![Greenkeeper badge](https://badges.greenkeeper.io/victor0801x/fastify-mariadb.svg?style=flat)](https://greenkeeper.io/)-->

Fastify MariaDB **connection Pool** plugin, with this you can share the same MariaDB connection pool in every part of your server.

Under the hood the official [MariaDB Node.js connector](https://github.com/MariaDB/mariadb-connector-nodejs) is used, the options that you pass to `register` will be passed to the MariaDB pool builder.

## Install

```
npm i fmdb
```

## Usage

Add it to your project with `register` and you are done!
This plugin will add the `db` namespace in your Fastify requests, with the following properties:

```
query: an utility to perform a query without a transaction
format: a way to swap out ? for variables
escape: unwrap variables in sql statements to just fields by type
escapeId: put quotes around named field ids
```

Example:
```js
const fastify = require('fastify')()

fastify.register(require('fmdb'), {
  host: 'localhost',
  user: 'root',
  database: 'mysql',
  connectionLimit: 5
})

fastify.get('/user/:id', (req, reply) => {
  // `pool.getConnection` -> `conn.query` -> `conn.release`
  req.db.query('SELECT username FROM users WHERE id=?', [req.params.id], (err, result) => {
      reply.send(err || result)
    })
})

fastify.listen(3000, (err) => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
```
As you can see there is no need to close the client, since is done internally.

```js
const fastify = require('fastify')()

fastify.register(require('fmdb'), {
  promise: true,
  connectionString: 'mariadb://root@localhost/mysql'
})

fastify.get('/user/:id', async req => {
  return await req.db.query('SELECT username FROM users WHERE id=?', [req.params.id])
})

fastify.listen(3000, (err) => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
```

## options
Either a connection String e.g: `mariadb://user:pass@host/db?debug=true` or [Pool options](https://github.com/MariaDB/mariadb-connector-nodejs/blob/master/documentation/promise-api.md#pool-options).

`MariaDB connector/Node.js` most options are similar to `mysql/mysql2` driver with more features and performant.
More usage, please see [mariadb-connector-nodejs](https://github.com/MariaDB/mariadb-connector-nodejs)

