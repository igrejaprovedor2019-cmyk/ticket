const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
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

client.once('clientReady', () => {
  console.log(`🔥 Bot online como ${client.user.tag}`);
});

// COMANDO
client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  if (message.content === '!MGL') {

    const embed = new EmbedBuilder()
      .setTitle('📋 PAINEL DE ATENDIMENTO')
      .setDescription(`
🎫 **REGRAS DOS TICKETS** 🎫

⏰ **Horário de Atendimento**  
Das **08:00 até 00:00**, nossa equipe estará disponível para te ajudar.

📌 **Abertura de Tickets**  
Seja **direto e objetivo** ao abrir seu ticket.  
Evite mensagens desnecessárias.

⌛ **Tempo de Resposta**  
O prazo máximo de resposta é de **1 hora**.

⚖️ **Análise**  
Após a análise da equipe, **não serão aceitas discussões**.

🚨 **Revisão de Punição**  
Prazo máximo para revisão: **3 horas**.

━━━━━━━━━━━━━━━━━━━━━━

📩 **Escolha abaixo o tipo de atendimento**
      `)
      .setColor('#8A2BE2')
      .setThumbnail('https://media.discordapp.net/attachments/1482528899903782932/1484254280088027216/file_000000008530720eb8922a615208f883.png');

    const select = new StringSelectMenuBuilder()
      .setCustomId('menu_ticket')
      .setPlaceholder('📩 Selecione o tipo de ticket')
      .addOptions([
        { label: '🛠 Suporte', value: 'suporte' },
        { label: '💰 Reembolso', value: 'reembolso' },
        { label: '📰 Evento', value: 'evento' },
        { label: '⚜ Mediador', value: 'vaga' }
      ]);

    const row = new ActionRowBuilder().addComponents(select);

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

// ÚNICO EVENTO
client.on('interactionCreate', async (interaction) => {

  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId !== 'menu_ticket') return;

  const existente = interaction.guild.channels.cache.find(c => 
    c.name === `ticket-${interaction.user.id}`
  );

  if (existente) {
    return interaction.reply({
      content: `❌ Você já possui um ticket aberto: ${existente}`,
      ephemeral: true
    });
  }

  const canal = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.username}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
    ]
  });

  const embedTicket = new EmbedBuilder()
    .setTitle('🎟️ TICKET DE ATENDIMENTO')
    .setDescription(`
👤 **Usuário:** ${interaction.user}

📌 Seu atendimento foi iniciado com sucesso.

⏳ Aguarde um membro da equipe responder.
    `)
    .setColor('#8A2BE2');

  await canal.send({ embeds: [embedTicket] });

  interaction.reply({
    content: `✅ Ticket criado: ${canal}`,
    ephemeral: true
  });

});

client.login(process.env.TOKEN);
