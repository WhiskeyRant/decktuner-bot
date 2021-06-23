import parseTimeParameter from '../../utils/parseTimeParameter';
import { findHighestFeedback } from '../../db/controllers';
import feedback from '../../embeds/feedback';

export default async ({ msg }) => {
    try {
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
