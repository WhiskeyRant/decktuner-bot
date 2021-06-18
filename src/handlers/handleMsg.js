import client from '../utils/client';
import questionnaire from '../utils/questionnaire';
import settings from '../../src/data/settings';
import bountyListing from '../embeds/bountyListing';
import createRoom from '../utils/createRoom';
import closeWorkshop from '../utils/closeWorkshop';
import tunerParticipation from '../utils/tunerParticipation';
import ActiveInterviews from '../utils/ActiveInterviews';
import { findFeedbackByUserId, findHighestFeedback } from '../db/controllers';
import feedback from '../embeds/feedback';

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

        if (
            ['!points', '!leaderboard'].some((x) =>
                msg.content.toLowerCase().startsWith(x)
            )
        ) {
            msg.channel.startTyping();

            const msg_array = msg.content.toLowerCase().split(' ');
            let time_parameter = 'all';

            if (msg_array[1]) {
                if (msg_array[1].includes('week')) {
                    time_parameter = 'week';
                } else if (msg_array[1].includes('month')) {
                    time_parameter = 'month';
                }
            }

            if (msg.content.toLowerCase().startsWith('!points')) {
                const [user] = await findFeedbackByUserId({
                    user_id: msg.author.id,
                    time_parameter,
                });

                if (!user) {
                    msg.channel.stopTyping();
                    return msg.reply(
                        'No feedback found for the given time parameter.'
                    );
                }
                
                msg.channel.stopTyping();
                msg.reply({
                    embed: feedback.create({
                        time_parameter,
                        user: msg.author,
                        points: user.toJSON().total_score,
                        ratio:
                            +user.toJSON().total_positives /
                            (+user.toJSON().total_positives +
                                +user.toJSON().total_negatives),
                    }),
                });
            } else {
                const leaderboard = await findHighestFeedback({
                    time_parameter,
                });

                if (!leaderboard.length) {
                    return msg.reply(`No users found in the leaderboard for given time parameter: \`${time_parameter}\`. Try a longer amount of time.`)
                }
                const {user: top_user} = await msg.guild.members.fetch(
                    leaderboard[0].user_id
                );

                msg.channel.stopTyping();
                msg.reply({
                    embed: feedback.create({
                        leaderboard,
                        time_parameter,
                        top_user
                    }),
                });
            }

            msg.channel.stopTyping();
        }

        // if (msg.content.toLowerCase().startsWith('!leaderboard')) {
        //     msg.channel.startTyping();

        //     const msg_array = msg.content.toLowerCase().split(' ');
        //     let time_parameter = 'all';

        //     if (msg_array[1]) {
        //         if (msg_array[1].includes('week')) {
        //             time_parameter = 'week';
        //         } else if (msg_array[1].includes('month')) {
        //             time_parameter = 'month';
        //         }
        //     }

        //     msg.channel.stopTyping();
        // }
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
