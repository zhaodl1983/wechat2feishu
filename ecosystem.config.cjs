module.exports = {
  apps: [
    {
      name: 'wechat2doc',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        // 这里后续需要填入服务器上的真实环境变量，或者使用 .env 文件
      },
      cwd: '/var/www/wechat2doc',
    },
  ],
};
