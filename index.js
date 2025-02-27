const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

const SERVICE_CHANNEL_ID = '1343647866564116615'; // Canal donde se envían los mensajes de servicio
const ADMIN_CHANNEL_ID = '1343647866744344635'; // Canal donde los admins ven la actividad

let serviceTimes = new Map();

client.once('ready', () => {
    console.log(`Bot iniciado como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const now = Date.now();
    const serviceChannel = interaction.guild.channels.cache.get(SERVICE_CHANNEL_ID);
    const adminChannel = interaction.guild.channels.cache.get(ADMIN_CHANNEL_ID);
    
    if (!serviceChannel || !adminChannel) {
        return interaction.reply({ content: 'No se pudo encontrar uno de los canales configurados.', ephemeral: true });
    }
    
    if (interaction.customId === 'start_service') {
        if (serviceTimes.has(userId)) {
            return interaction.reply({ content: 'Ya has iniciado tu servicio.', ephemeral: true });
        }
        serviceTimes.set(userId, now);
        
        const adminRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`force_end_${userId}`)
                    .setLabel(`Sacar a ${username} del servicio`)
                    .setStyle(ButtonStyle.Danger)
            );
        
        adminChannel.send({ content: `**${username} ha entrado en servicio.**`, components: [adminRow] });
        return interaction.reply({ content: 'Has comenzado tu servicio.', ephemeral: true });
    }
    
    if (interaction.customId.startsWith('force_end_')) {
        const targetUserId = interaction.customId.split('_')[2];
        if (!serviceTimes.has(targetUserId)) {
            return interaction.reply({ content: 'El usuario no tiene un servicio activo.', ephemeral: true });
        }
        
        const startTime = serviceTimes.get(targetUserId);
        serviceTimes.delete(targetUserId);
        const elapsedTime = Math.floor((now - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        
        adminChannel.send(`**${username} ha sido sacado del servicio por un administrador. Tiempo total: ${minutes} minutos y ${seconds} segundos.**`);
    }
    
    if (interaction.customId === 'end_service') {
        if (!serviceTimes.has(userId)) {
            return interaction.reply({ content: 'No has iniciado ningun servicio.', ephemeral: true });
        }
        
        const startTime = serviceTimes.get(userId);
        serviceTimes.delete(userId);
        const elapsedTime = Math.floor((now - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        
        adminChannel.send(`**${username} ha salido de servicio. Tiempo total: ${minutes} minutos y ${seconds} segundos.**`);
        return interaction.reply({ content: `Has terminado tu servicio. Tiempo total: ${minutes} minutos y ${seconds} segundos.`, ephemeral: true });
    }
});

client.on('messageCreate', async message => {
    if (message.content === '!servicio') {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('start_service')
                    .setLabel('Entrar en servicio')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('end_service')
                    .setLabel('Salir de servicio')
                    .setStyle(ButtonStyle.Danger)
            );
        
        await message.reply({ content: 'Servicio:', components: [row] });
    }
});

client.login("NTE4MTIwNzY4MjI4NTU2ODEx.GHrva3.Co6JAVKNeAu1iWHg34Fb-vTN58GX8LlAOgnwR4");
