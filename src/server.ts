import Fastify from 'fastify'
import cors from '@fastify/cors'

import Queue from 'bull'
import { createBullBoard } from '@bull-board/api'
import { FastifyAdapter } from '@bull-board/fastify'
import { BullAdapter } from '@bull-board/api/bullAdapter'

import { routes } from './routes/routes'

const SEVER_PORT = 3001
const SERVER_HOST = '0.0.0.0'

export const app = Fastify()

export const queue = new Queue('Processing Medical Relationship', {
	redis: {
		host: 'localhost',
		port: 6379,
		password: 'senha!'
	}
})

const serverAdapter = new FastifyAdapter()

createBullBoard({
	queues: [new BullAdapter(queue)],
	serverAdapter
})

serverAdapter.setBasePath('/ui')

app.register(
	(fastify, opts, done) => {
		serverAdapter.registerPlugin()(fastify, opts as any, done) // Chama corretamente o método
		done()
	},
	{ prefix: '/ui' }
)

app.register(routes)
app.register(cors, { origin: '*' })

app.listen({ host: SERVER_HOST, port: SEVER_PORT }, err => {
	if (err) {
		console.error(err.message)
		process.exit(1)
	}

	console.log(`Server running Port: ${SEVER_PORT}`)
})
