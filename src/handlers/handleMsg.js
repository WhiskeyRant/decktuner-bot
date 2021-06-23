import client from '../utils/client';
import questionnaire from '../utils/questionnaire';
import settings from '../../src/data/settings';
import bountyListing from '../embeds/bountyListing';
import createRoom from '../utils/createRoom';
import closeWorkshop from '../utils/closeWorkshop';
import tunerParticipation from '../utils/tunerParticipation';
import ActiveInterviews from '../utils/ActiveInterviews';
import {
    findFeedbackByUserId,
    findHighestFeedback,
    findWorkshopById,
} from '../db/controllers';
import feedback from '../embeds/feedback';
import tune from './commands/command.tune';
import points from './commands/command.points';
import leaderboard from './commands/command.leaderboard';
import setpoints from './commands/command.setpoints';

const handleMsg = async (msg) => {
    try {
        if (msg.content.startsWith('!points')) {
            points({ msg });
            return;
        }
        if (msg.content.startsWith('!leaderboard')) {
            leaderboard({ msg });
            return;
        }
        if (
            msg.content.startsWith('!tune') &&
            settings.channel('get_help') === msg.channel.id
        ) {
            tune({ msg });
            return;
        }
        // if (
        //     msg.content.startsWith('!setpoints')
        // ) {
        //     setpoints({msg});
        //     return;
        // }

        if (
            msg.type !== 'PINS_ADD' &&
            !msg.author.bot &&
            msg.channel.parent &&
            msg.channel.parent.id == settings.channel('workshop_category')
        ) {
            if (
                msg.content.trim() === '!close' &&
                msg.member.roles.cache.some((role) =>
                    ['moderator', 'admin', 'tuner', 'pilot'].includes(
                        role.name.toLowerCase().trim()
                    )
                )
            ) {
                const [workshop] = await findWorkshopById({
                    channel_id: msg.channel.id,
                });
                if (
                    workshop.toJSON().pilot !== msg.author.id &&
                    msg.member.roles.cache.some((role) =>
                        ['pilot'].includes(role.name.toLowerCase().trim())
                    )
                ) {
                    msg.react('❌');
                    return msg.reply(
                        '❌ You do not have permissions to close this channel.'
                    );
                }
                await closeWorkshop({ msg });
                return;
            }
            if (msg.content.trim() === '!forceclose') {
                if (
                    !msg.member.roles.cache.some((role) =>
                        ['moderator', 'admin'].includes(
                            role.name.toLowerCase().trim()
                        )
                    )
                ) {
                    msg.react('❌');
                    return msg.reply(
                        '❌ You do not have permissions to force close this channel.'
                    );
                }
                await closeWorkshop({ msg, force: true });
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
