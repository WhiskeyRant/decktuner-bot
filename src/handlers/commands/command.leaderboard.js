import parseTimeParameter from '../../utils/parseTimeParameter';
import { findHighestFeedback } from '../../db/controllers';
import feedback from '../../embeds/feedback';
import logEvent from '../../utils/logEvent';

export default async ({ msg }) => {
    try {
        logEvent({ id: 'command_leaderboard', details: { msg } });
        msg.channel.startTyping();

        const time_parameter = parseTimeParameter({ content: msg.content });

        const leaderboard = await findHighestFeedback({
            time_parameter,
        });

        if (!leaderboard.length) {
            return msg.reply(
                `No users found in the leaderboard for given time parameter: \`${time_parameter}\`. Try a longer amount of time.`
            );
        }
        const { user: top_user } = await msg.guild.members.fetch(
            leaderboard[0].user_id
        );

        msg.channel.stopTyping();
        msg.reply({
            embed: feedback.create({
                leaderboard,
                time_parameter,
                top_user,
            }),
        });
    } catch (err) {
        console.log(err);
    }
};
