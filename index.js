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

  if (message.content === '!MG') {

    // EMBED REGRAS
    const regras = new EmbedBuilder()
      .setTitle('📋 Painel de Atendimento')
      .setDescription(`
💎 **Regras Tickets**

🕐 **Horário de Atendimento**  
Das 08:00 às 00:00  

📌 **Abertura de Tickets**  
Seja direto e objetivo  

⏳ **Tempo de Espera**  
Pode haver demora dependendo do horário  

📎 **Análise de Provas**  
Evite discussões desnecessárias  

🔁 **Revisão de Punição**  
Respeite os prazos
      `)
      .setColor(0x2b2d31);

    const botao = new ButtonBuilder()
      .setCustomId('abrir_painel')
      .setLabel('Abrir Ticket')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(botao);

    message.channel.send({
      embeds: [regras],
      components: [row]
    });
  }
});

// INTERAÇÕES
client.on('interactionCreate', async (interaction) => {

  // MENU
  if (interaction.isButton() && interaction.customId === 'abrir_painel') {

    const select = new StringSelectMenuBuilder()
      .setCustomId('tipo_ticket')
      .setPlaceholder('Selecione o tipo de ticket')
      .addOptions([
        { label: 'Suporte', value: 'suporte' },
        { label: 'Reembolso', value: 'reembolso' },
        { label: 'Receber Evento', value: 'evento' },
        { label: 'Vagas Mediador', value: 'vaga' }
      ]);

    return interaction.reply({
      content: 'Selecione o tipo de ticket que deseja abrir.',
      components: [new ActionRowBuilder().addComponents(select)],
      ephemeral: true
    });
  }

  // CRIAR TICKET
  if (interaction.isStringSelectMenu()) {

    const tipo = interaction.values[0];

    const canal = await interaction.guild.channels.create({
      name: `suporte-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
      ]
    });

    // EMBED DO TICKET
    const embedTicket = new EmbedBuilder()
      .setTitle('🎟️ TICKET DE SUPORTE')
      .setDescription(`
Seja bem-vindo(a) ao painel de controle deste ticket.  
Em breve a equipe irá lhe atender.  

*Peço que tenha paciência.*
      `)
      .setColor(0x2b2d31)
      .setThumbnail('https://media.discordapp.net/attachments/1482528899903782932/1484254280088027216/file_000000008530720eb8922a615208f883.png');

    // BOTÕES
    const assumir = new ButtonBuilder()
      .setCustomId('assumir_ticket')
      .setLabel('Assumir Ticket')
      .setStyle(ButtonStyle.Success);

    const staff = new ButtonBuilder()
      .setCustomId('painel_staff')
      .setLabel('Painel Staff')
      .setStyle(ButtonStyle.Secondary);

    const sair = new ButtonBuilder()
      .setCustomId('sair_ticket')
      .setLabel('Sair do Ticket')
      .setStyle(ButtonStyle.Danger);

    const fechar = new ButtonBuilder()
      .setCustomId('fechar_ticket')
      .setLabel('Finalizar Ticket')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(assumir, staff, sair, fechar);

    await canal.send(`
📌 Ticket iniciado por ${interaction.user}
📂 Tipo: ${tipo}
    `);

    await canal.send({
      embeds: [embedTicket],
      components: [row]
    });

    return interaction.reply({
      content: `✅ Ticket criado: ${canal}`,
      ephemeral: true
    });
  }

  // ASSUMIR
  if (interaction.customId === 'assumir_ticket') {

    const membro = interaction.member;

    const temPermissao = membro.roles.cache.some(role => 
      CARGOS_SUPORTE.includes(role.id)
    );

    if (!temPermissao) {
      return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    }

    if (interaction.channel.topic === 'assumido') {
      return interaction.reply({ content: '❌ Já assumido!', ephemeral: true });
    }

    await interaction.channel.setTopic('assumido');

    await interaction.channel.send(`✅ ${interaction.user} assumiu o ticket.`);

    interaction.reply({ content: '✔️ Assumido!', ephemeral: true });
  }

  // SAIR
  if (interaction.customId === 'sair_ticket') {
    await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
      ViewChannel: false
    });

    interaction.reply({ content: '🚪 Você saiu!', ephemeral: true });
  }

  // FECHAR
  if (interaction.customId === 'fechar_ticket') {
    interaction.reply({ content: '❌ Fechando...', ephemeral: true });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 2000);
  }

  // STAFF
  if (interaction.customId === 'painel_staff') {
    interaction.reply({ content: '⚙️ Painel staff...', ephemeral: true });
  }

});

client.login(process.env.TOKEN);
