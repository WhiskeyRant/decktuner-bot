import client from '../utils/client';
import questionnaire from '../utils/questionnaire';
import settings from '../../src/data/settings';
import bountyListing from '../embeds/bountyListing';
import createRoom from '../utils/createRoom';
import closeWorkshop from '../utils/closeWorkshop';
import tunerParticipation from '../utils/tunerParticipation';
import ActiveInterviews from '../utils/ActiveInterviews';

const handleMsg = async (msg) => {
    try {
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
