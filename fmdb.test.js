const { test } = require('tap')
const Fastify = require('fastify')
const fmdb = require('./index')

const options = {
  host: 'localhost',
  user: 'root',
  database: 'mysql',
  connectionLimit: 5
}

const dbFunctions = ['query', 'release', 'format', 'escape', 'escapeId']

test('fastify maria db plugin', async ({test}) => {
  test('query async', async t => {
    const fastify = Fastify()
    await fastify.register(fmdb, options)
    await fastify.after(err => t.ok(!err, 'error loading plugin'))
    fastify.get('/', async req => {
      t.same(Object.keys(req.db), dbFunctions, 'db object in request')
      const res = await req.db.query('SELECT 1')
      t.same(res, { '1': 1 }, 'db response')
      return res
    })
    await fastify.ready()
    const res = await fastify.inject({ method: 'GET', url: '/' })
    t.same(res.statusCode, 200, 'status code')
    t.same(res.json(), { '1': 1 }, 'db response on API call')
    fastify.close()
    t.end()
  })

  test('query sync', t => {
    const fastify = Fastify()
    fastify.register(fmdb, options)
    fastify.after(err => t.ok(!err, 'error loading plugin'))
    fastify.get('/', (req, res) => {
      req.db.query('SELECT 1 AS `ping`').then(queryRes => {
        t.same(queryRes, { ping: 1 }, 'db response')
        res.send(queryRes)
      })
    })
    fastify.ready().then(() => {
      fastify.inject({ method: 'GET', url: '/' }).then(res => {
        t.same(res.statusCode, 200, 'status code')
        t.same(res.json(), { ping: 1 }, 'db response on API call')
        fastify.close()
        t.end()  
      })
    })
  })

  test('sqlstring utils & Connection String', async t => {
    const fastify = Fastify()
    fastify.register(fmdb, 'mariadb://root@localhost:3306/mysql')
    fastify.after(err => t.ok(!err, 'error loading plugin'))
    fastify.get('/', async req => {
      t.same(
        req.db.format('SELECT ? AS `now`', [1]),
        'SELECT 1 AS `now`',
        message='DB format'
      )
      const id = 'userId'
      t.same(
        'SELECT * FROM users WHERE id = ' + req.db.escape(id),
        `SELECT * FROM users WHERE id = '${id}'`,
        message='DB escape'
      )
      const sorter = 'date'
      t.same(
        'SELECT * FROM posts ORDER BY ' + req.db.escapeId('posts.' + sorter),
        'SELECT * FROM posts ORDER BY `posts`.`date`',
        message='DB escape Id'
      )
    })
    await fastify.ready()
    await fastify.inject({ method: 'GET', url: '/' })
    fastify.close()
    t.end()
  })
})
