const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder,
  ChannelType,
  PermissionsBitField
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔒 ANTI DUPLICAÇÃO
const criandoTicket = new Map();

client.once('clientReady', () => {
  console.log(`🔥 Bot online como ${client.user.tag}`);
});


// ==========================
// 📌 COMANDO PAINEL SUPORTE
// ==========================
client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  if (message.content === '!MGL') {

    const embed = new EmbedBuilder()
      .setTitle('📋 PAINEL DE SUPORTE')
      .setDescription(`
🎫 **Atendimento**

Clique abaixo para abrir um ticket.

⏳ Aguarde resposta da equipe.
      `)
      .setColor('#8A2BE2');

    const select = new StringSelectMenuBuilder()
      .setCustomId('ticket_suporte') // 🔥 único
      .setPlaceholder('Abrir suporte')
      .addOptions([
        { label: '🛠 Suporte', value: 'suporte' }
      ]);

    const row = new ActionRowBuilder().addComponents(select);

    message.channel.send({ embeds: [embed], components: [row] });
  }

});


// ==========================
// 🔥 INTERAÇÃO GLOBAL
// ==========================
client.on('interactionCreate', async (interaction) => {

  if (!interaction.isStringSelectMenu()) return;

  const userId = interaction.user.id;

  // 🔒 trava clique
  if (criandoTicket.has(userId)) {
    return interaction.reply({
      content: '⏳ Aguarde...',
      ephemeral: true
    });
  }

  criandoTicket.set(userId, true);

  try {

    // ==========================
    // 🎟️ SUPORTE
    // ==========================
    if (interaction.customId === 'ticket_suporte') {

      const existente = interaction.guild.channels.cache.find(c => 
        c.name === `ticket-${userId}`
      );

      if (existente) {
        criandoTicket.delete(userId);
        return interaction.reply({
          content: `❌ Já existe: ${existente}`,
          ephemeral: true
        });
      }

      const canal = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: userId,
            allow: [PermissionsBitField.Flags.ViewChannel]
          }
        ]
      });

      const embed = new EmbedBuilder()
        .setTitle('🎟️ TICKET DE SUPORTE')
        .setDescription(`
👤 ${interaction.user}

Aguarde atendimento da equipe.
        `)
        .setColor('#8A2BE2');

      await canal.send({ embeds: [embed] });

      await interaction.reply({
        content: `✅ Ticket criado: ${canal}`,
        ephemeral: true
      });

      criandoTicket.delete(userId);
      return; // 🔥 IMPORTANTE
    }

    // ==========================
    // 💰 REEMBOLSO (EXEMPLO)
    // ==========================
    if (interaction.customId === 'ticket_reembolso') {

      const canal = await interaction.guild.channels.create({
        name: `reembolso-${interaction.user.username}`,
        type: ChannelType.GuildText
      });

      await canal.send(`💰 Ticket de reembolso: ${interaction.user}`);

      await interaction.reply({
        content: `✅ Criado: ${canal}`,
        ephemeral: true
      });

      criandoTicket.delete(userId);
      return;
    }

  } catch (err) {
    console.error(err);
  }

  criandoTicket.delete(userId);

});

client.login(process.env.TOKEN);
