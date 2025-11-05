import Fastify from "fastify"

const fastify = Fastify({
  logger: true
})

fastify.get("/health", async () => {
  return { status: "ok" }
})

const port = Number(process.env.PORT ?? 4000)

async function start() {
  try {
    await fastify.listen({ port, host: "0.0.0.0" })
    console.log(`API ready on http://localhost:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
