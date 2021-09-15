require('dotenv').config();
import commandReducer from './src/handlers/commandReducer';
import client from './src/utils/client';

client.on('ready', async () => {
    try {
        console.log(`Logged in as ${client.user.tag}!`);
    } catch (e) {
        console.log(e);
    }
});

client.on('message', commandReducer);

client.login(process.env.DISCORD_TOKEN);
