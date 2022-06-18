import { createApp } from './app'

createApp()
  .then((app) => {
    app.listen({
      port: Number(process.env.PORT) || 8080,
      host: '0.0.0.0',
    })
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
