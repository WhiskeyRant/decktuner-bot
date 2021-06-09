import client from '../utils/client';
import questionnaire from '../utils/questionnaire';
import settings from '../../src/data/settings';
import bountyListing from '../embeds/bountyListing';
import createRoom from '../utils/createRoom';
import closeWorkshop from '../utils/closeWorkshop';
import initDB from '../db/init';
import tunerParticipation from '../utils/tunerParticipation';
import ActiveInterviews from '../utils/ActiveInterviews';
const nodeHtmlToImage = require('node-html-to-image');
const { MessageAttachment } = require('discord.js')

const handleMsg = async (msg) => {
    try {
        if (msg.content.startsWith('!test')) {
            const _htmlTemplate = `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta http-equiv="X-UA-Compatible" content="ie=edge" />
                <style>
                  body {
                    font-family: "Poppins", Arial, Helvetica, sans-serif;
                    background: rgb(22, 22, 22);
                    color: #fff;
                    max-width: 300px;
                  }
            
                  .app {
                    max-width: 300px;
                    padding: 20px;
                    display: flex;
                    flex-direction: row;
                    border-top: 3px solid rgb(16, 180, 209);
                    background: rgb(31, 31, 31);
                    align-items: center;
                  }
            
                  img {
                    width: 50px;
                    height: 50px;
                    margin-right: 20px;
                    border-radius: 50%;
                    border: 1px solid #fff;
                    padding: 5px;
                  }
                </style>
              </head>
              <body>
                <div class="app">
                  <img src="https://i.imgur.com/4zSAWJ5.jpg" />
            
                  <h4>Welcome dog</h4>
                </div>
              </body>
            </html>
            `;

            const images = await nodeHtmlToImage({
                html: _htmlTemplate,
                quality: 100,
                type: 'jpeg',
                puppeteerArgs: {
                    args: ['--no-sandbox'],
                },
                encoding: 'buffer',
            });
            // for more configuration options refer to the library

            return msg.channel.send(
                new MessageAttachment(images, `dog.jpeg`)
            );
        }
        if (
            msg.content.startsWith('!tune') &&
            settings.channel('get_help') === msg.channel.id
        ) {
            if (ActiveInterviews.userExists(msg.author.id)) {
                return msg.reply(
                    'Looks like you are already in the process of a tuning interview. If you want to exit the interview, message !cancel in private messages to me.'
                );
            }
            msg.reply(
                'Deck Tuning process initiated!\nCheck your messages to answer some questions to get started.'
            );
            questionnaire.start(msg);
            return;
        }

        if (
            msg.type !== 'PINS_ADD' &&
            !msg.author.bot &&
            msg.channel.parent &&
            msg.channel.parent.id == settings.channel('workshop_category')
        ) {
            if (
                msg.content.trim() == '!close' &&
                msg.member.roles.cache.some((role) => 
                    ['moderator', 'admin', 'tuner'].includes(role.name.toLowerCase().trim()) // prettier-ignore
                ) // prettier-ignore
            ) {
                await closeWorkshop({ msg });
                return;
            }

            if (
                msg.member.roles.cache.some(
                    (role) => role.name.toLowerCase().trim() === 'tuner'
                )
            ) {
                await tunerParticipation({ msg });
                return;
            }
        }
    } catch (e) {
        console.log(e);
    }
};

export default handleMsg;

// {
//     id: "357490324643512321",
//     system: false,
//     locale: null,
//     flags: {
//       bitfield: 768,
//     },
//     username: "Ox",
//     bot: false,
//     discriminator: "9999",
//     avatar: "d4b1ae45fca70e065815d7c53db116e0",
//     lastMessageID: "846020554586325013",
//     lastMessageChannelID: "846013084896067614",
//   }
