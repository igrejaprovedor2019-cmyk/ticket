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

// 🔥 BOT PRINCIPAL
const BOT_ATIVO = '1484260544310677645';

// 🔒 ANTI DUPLICAÇÃO
const criandoTicket = new Map();

client.once('clientReady', () => {
  console.log(`🔥 Bot online como ${client.user.tag}`);
});

// 📌 COMANDO DO PAINEL
client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  if (message.content === '!MGL') {

    const embed = new EmbedBuilder()
      .setTitle('📋 PAINEL DE ATENDIMENTO')
      .setDescription(`
🎫 **REGRAS DOS TICKETS** 🎫

⏰ **Horário de Atendimento**  
Das **08:00 até 00:00**, nossa equipe estará disponível.

📌 **Abertura de Tickets**  
Seja **direto e objetivo**, evite mensagens desnecessárias.

⌛ **Tempo de Resposta**  
Prazo máximo de **1 hora**.

⚖️ **Análise**  
Após decisão da equipe, **não insista**.

🚨 **Revisão de Punição**  
Prazo de até **3 horas**.

━━━━━━━━━━━━━━━━━━━━━━

📩 **Selecione abaixo o tipo de atendimento**
      `)
      .setColor('#8A2BE2')
      .setThumbnail('https://media.discordapp.net/attachments/1482528899903782932/1484254280088027216/file_000000008530720eb8922a615208f883.png');

    const select = new StringSelectMenuBuilder()
      .setCustomId('menu_ticket_gbz') // 🔥 único
      .setPlaceholder('📩 Selecione o tipo de ticket')
      .addOptions([
        { label: '🛠 Suporte', value: 'suporte
