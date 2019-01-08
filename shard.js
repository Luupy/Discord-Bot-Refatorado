const { ShardingManager } = require("discord.js"),
      { TOKEN }           = require("./setup/config.js")

let Manager = new ShardingManager('./struct/Client.js', {
  totalShards: 'auto',
  token: TOKEN
})

Manager.spawn()
