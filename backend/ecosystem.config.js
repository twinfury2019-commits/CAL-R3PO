module.exports = {
  apps: [
    {
      name:             'arms-license-api',
      script:           'server.js',
      watch:            false,
      autorestart:      true,
      max_memory_restart: '200M',
      restart_delay:    3000,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
