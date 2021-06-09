require('dotenv').config();
import client from './src/utils/client';
import handleMsg from './src/handlers/handleMsg';
client.on('ready', async () => {
    try {
        console.log(`Logged in as ${client.user.tag}!`);
    } catch (e) {
        console.log(e);
    }
});

client.on('message', handleMsg);

client.login(process.env.DISCORD_TOKEN);
