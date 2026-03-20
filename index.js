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

// 🔥 ID DO BOT QUE PODE RESPONDER
const BOT_ATIVO = '1484260544310677645';

// 🔒 SISTEMA ANTI DUPLICAÇÃO
const criandoTicket = new Map();

client.once('clientReady', () => {
  console.log(`🔥 Bot online como ${client.user.tag}`);
});

// 📌 COMANDO PARA CRIAR O PAINEL
client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  if (message.content === '!MGL') {

    const embed = new EmbedBuilder()
      .setTitle('📋 PAINEL DE ATENDIMENTO')
      .setDescription(`
🎫 **REGRAS DOS TICKETS** 🎫

⏰ **Horário de Atendimento**  
Das **08:00 até 00:00**

📌 **Abertura de Tickets**  
Seja direto e evite mensagens desnecessárias.

⌛ **Tempo de Resposta**  
Até **1 hora**

⚖️ **Análise**  
Sem discussões após decisão.

🚨 **Revisão de Punição**  
Até **3 horas**

━━━━━━━━━━━━━━━━━━━━━━

📩 Selecione abaixo o tipo de atendimento
      `)
      .setColor('#8A2BE2')
      .setThumbnail('https://media.discordapp.net/attachments/1482528899903782932/1484254280088027216/file_000000008530720eb8922a615208f883.png');

    const select = new StringSelectMenuBuilder()
      .setCustomId('menu_ticket_gbz')
      .setPlaceholder('📩 Selecione o tipo de ticket')
      .addOptions([
        { label: '🛠 Suporte', value: 'suporte' },
        { label: '💰 Reembolso', value: 'reembolso' },
        { label: '📰 Evento', value: 'evento' },
        { label: '⚜ Mediador', value: 'vaga' }
      ]);

    const row = new ActionRowBuilder().addComponents(select);

    message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }

});

// 🔥 INTERAÇÃO PRINCIPAL (ÚNICA)
client.on('interactionCreate', async (interaction) => {

  // 🔒 Só esse bot responde
  if (interaction.client.user.id !== BOT_ATIVO) return;

  // só menu
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== 'menu_ticket_gbz') return;

  const userId = interaction.user.id;

  // 🔒 trava clique duplo
  if (criandoTicket.has(userId)) {
    return interaction.reply({
      content: '⏳ Aguarde, seu ticket já está sendo criado...',
      ephemeral: true
    });
  }

  criandoTicket.set(userId, true);

  try {

    // 🔍 verifica se já existe
    const existente = interaction.guild.channels.cache.find(c => 
      c.name === `ticket-${userId}`
    );

    if (existente) {
      criandoTicket.delete(userId);
      return interaction.reply({
        content: `❌ Você já possui um ticket: ${existente}`,
        ephemeral: true
      });
    }

    // 📂 cria canal
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

    // 🎟️ mensagem do ticket
    const embedTicket = new EmbedBuilder()
      .setTitle('🎟️ TICKET DE ATENDIMENTO')
      .setDescription(`
👤 **Usuário:** ${interaction.user}

📌 Seu atendimento foi iniciado com sucesso.

⏳ Aguarde um membro da equipe responder.
      `)
      .setColor('#8A2BE2');

    await canal.send({ embeds: [embedTicket] });

    await interaction.reply({
      content: `✅ Ticket criado: ${canal}`,
      ephemeral: true
    });

  } catch (err) {
    console.error(err);
  }

  // 🔓 libera trava
  setTimeout(() => {
    criandoTicket.delete(userId);
  }, 5000);

});

client.login(process.env.TOKEN);
