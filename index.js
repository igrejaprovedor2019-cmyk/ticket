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

// CARGOS STAFF
const CARGOS_SUPORTE = [
  '1484272650795880709',
  '1484275813477122278',
  '1484276434586566756',
  '1484273613430460576'
];

client.once('clientReady', () => {
  console.log(`🔥 Bot online como ${client.user.tag}`);
});

// COMANDO
client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  if (message.content === '!MGL') {

    const embed = new EmbedBuilder()
      .setTitle('📋 Painel de Atendimento')
      .setDescription(`
🎫 **Regras Tickets** 🎫

• Atendimento: 08:00 às 00:00  
• Seja objetivo  
• Tempo de resposta: até 1h  
• Sem discussões após análise  
• Revisão: até 3h
      `)
      .setColor('#8A2BE2')
      .setThumbnail('https://media.discordapp.net/attachments/1482528899903782932/1484254280088027216/file_000000008530720eb8922a615208f883.png');

    const select = new StringSelectMenuBuilder()
      .setCustomId('menu_ticket')
      .setPlaceholder('Selecione o tipo de ticket')
      .addOptions([
        { label: '🛠 Suporte', value: 'suporte' },
        { label: '⇄ Reembolso', value: 'reembolso' },
        { label: '📰 Evento', value: 'evento' },
        { label: '⚜ Mediador', value: 'vaga' }
      ]);

    const row = new ActionRowBuilder().addComponents(select);

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

// 🔥 ÚNICO interactionCreate (IMPORTANTÍSSIMO)
client.on('interactionCreate', async (interaction) => {

  // =======================
  // MENU → CRIAR TICKET
  // =======================
  if (interaction.isStringSelectMenu() && interaction.customId === 'menu_ticket') {

    const tipo = interaction.values[0];

    const existente = interaction.guild.channels.cache.find(c => 
      c.name === `ticket-${interaction.user.id}`
    );

    if (existente) {
      return interaction.reply({
        content: `❌ Você já tem um ticket: ${existente}`,
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
      .setTitle('🎟️ TICKET DE SUPORTE')
      .setDescription(`
👤 Usuário: ${interaction.user}
📂 Tipo: ${tipo}

Aguarde atendimento.
      `)
      .setColor('#8A2BE2');

    const botoes = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('assumir').setLabel('Assumir').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('sair').setLabel('Sair').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('fechar').setLabel('Fechar').setStyle(ButtonStyle.Danger)
    );

    await canal.send({ embeds: [embedTicket], components: [botoes] });

    await interaction.reply({
      content: `✅ Ticket criado: ${canal}`,
      ephemeral: true
    });

    return; // 🔥 trava aqui (não duplica)
  }

  // =======================
  // BOTÕES
  // =======================
  if (interaction.isButton()) {

    // ASSUMIR
    if (interaction.customId === 'assumir') {

      const membro = interaction.member;

      const temPermissao = membro.roles.cache.some(role => 
        CARGOS_SUPORTE.includes(role.id)
      );

      if (!temPermissao) {
        return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
      }

      await interaction.channel.send(`✅ ${interaction.user} assumiu o ticket.`);
      return interaction.reply({ content: '✔️ Assumido!', ephemeral: true });
    }

    // SAIR
    if (interaction.customId === 'sair') {

      await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
        ViewChannel: false
      });

      return interaction.reply({ content: '🚪 Você saiu do ticket!', ephemeral: true });
    }

    // FECHAR
    if (interaction.customId === 'fechar') {

      await interaction.reply({ content: '❌ Fechando...', ephemeral: true });

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 2000);

      return;
    }

  }

});

client.login(process.env.TOKEN);
