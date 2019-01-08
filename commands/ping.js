exports.run = async function(client, message, args, level) {
  message.reply("Calculando latência...").then(m => {
    m.edit(`Levei **${Date.now() - message.createdTimestamp}ms** para responder.\nTempo de resposta com o API do Discord: **${client.ping}ms**`)
  })
}

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["p"],
    permLevel: "User"
};

exports.help = {
    name: "ping",
    category: "Util",
    description: "Veja o tempo de resposta entre o bot e a API do Discord",
    usage: "ping"
};
