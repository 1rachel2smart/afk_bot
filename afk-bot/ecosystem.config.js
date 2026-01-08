module.exports = {
  apps: [
    {
      name: 'afk-bot',
      script: 'npm',
      args: 'start',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
