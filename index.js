'use strict'
const mysql = require('mariadb/promise')
const fp = require('fastify-plugin')
const { format, escape, escapeId } = require('sqlstring')
const fmdb = async (fastify, options) => {
  const pool = mysql.createPool(options)
  // await pool.query('select 1')
  await fastify.addHook('onClose', () => pool.end())
  await fastify.addHook('preHandler', async req => {
    const db = await pool.getConnection()
    req.db = {
      query: async (...args) => (await db.query(...args))[0],
      release: () => db.release(),
      format, escape, escapeId
    }
  })
  await fastify.addHook('onSend', async req => { req.db.release() })
}

module.exports = fp(fmdb, {
  fastify: '>=1.x',
  name: 'fmdb'
})
