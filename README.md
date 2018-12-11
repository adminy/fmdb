# Fastify MariaDB Pool plugin
<!--
[![NPM](https://nodei.co/npm/fastify-mariadb.png??downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/fastify-mariadb)
-->
[![Build Status](https://travis-ci.org/victor0801x/fastify-mariadb.svg?branch=master)](https://travis-ci.org/victor0801x/fastify-mariadb)
[![codecov](https://codecov.io/gh/victor0801x/fastify-mariadb/branch/master/graph/badge.svg)](https://codecov.io/gh/victor0801x/fastify-mariadb)
[![Greenkeeper badge](https://badges.greenkeeper.io/victor0801x/fastify-mariadb.svg)](https://greenkeeper.io/)
[![npm version](https://img.shields.io/npm/v/fastify-mariadb.svg?style=flat-square)](https://www.npmjs.com/package/fastify-mariadb)
[![npm downloads](https://img.shields.io/npm/dm/fastify-mariadb.svg?style=flat-square)](https://www.npmjs.com/package/fastify-mariadb)

Fastify MariaDB connection Pool plugin, with this you can share the same MariaDB connection pool in every part of your server.

Under the hood the offical [MariaDB Node.js connector](https://github.com/MariaDB/mariadb-connector-nodejs) is used, the options that you pass to `register` will be passed to the MariaDB pool builder.

## Install

```
npm install fastify-mariadb --save
```

## Usage

Add it to your project with `register` and you are done!
This plugin will add the `mariadb` namespace in your Fastify instance, with the following properties:

```
pool: the pool instance
query: an utility to perform a query without a transaction
getConnection: get a connection from the pool

# synchronous SQL format and escape for MySQL/MariaDB
sqlstring: {
  format: an utility to generate SQL string
  escape: an utility to escape query values
  escapeId: an utility to escape query identifiers
}
```

Example:
```js
const fastify = require('fastify');

fastify.register(require('fastify-mariadb'), {
  host: 'localhost',
  user: 'root',
  database: 'mysql',
  connectionLimit: 5,
});

fastify.get('/user/:id', (req, reply) => {
  // `pool.getConnection` -> `conn.query` -> `conn.release`
  fastify.mariadb.getConnection((err, conn) => {
    if (err) return reply.send(err);
    conn.query('SELECT username FROM users WHERE id=?', [req.params.id], (err, result) => {
      client.release();
      reply.send(err || result);
    });
  });
});

fastify.get('/mariadb/time', (req, reply) => {
  // `pool.query`
  fastify.mariadb.query('SELECT now()', (err, result) => {
    reply.send(err || result)
  });
});

fastify.listen(3000, (err) => {
  if (err) throw err;
  console.log(`server listening on ${fastify.server.address().port}`);
});
```
As you can see there is no need to close the client, since is done internally.

Async await is supported, when register `promise` option is `true`:
```js
const fastify = require('fastify');

fastify.register(require('fastify-mariadb'), {
  promise: true,
  connectionString: 'mariadb://root@localhost/mysql',
});

fastify.get('/user/:id', async (req, reply) => {
  const connection = await fastify.mariadb.getConnection();
  const result = await fastify.mariadb.query(
    'SELECT username FROM users WHERE id=?', [req.params.id],
  );
  connection.release();
  return result[0];
});

fastify.listen(3000, (err) => {
  if (err) throw err;
  console.log(`server listening on ${fastify.server.address().port}`);
});
```

## options

* `promise` - `Boolean` (optional, if not present will use `callback` style pool)
* `connectionString` - `String` (optional)
* `native Pool options` - see offical documents [MariaDB connector/Node.js](https://mariadb.com/kb/en/library/about-mariadb-connector-nodejs/)
  * [`Promise API`](https://github.com/MariaDB/mariadb-connector-nodejs/blob/master/documentation/promise-api.md#promise-api)
  * [`Callback API`](https://github.com/MariaDB/mariadb-connector-nodejs/blob/master/documentation/callback-api.md#callback-api)

## Acknowledgements

Most of codes are copy from [fastify-mysql](https://github.com/fastify/fastify-mysql).  
`MariaDB connector/Node.js` most options are similar to `mysql`/`mysql2` driver with more features and performant. 


## License

Licensed under [MIT](./LICENSE).
