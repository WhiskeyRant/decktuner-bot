import parseTimeParameter from '../../utils/parseTimeParameter';
import { findHighestFeedback } from '../../db/controllers';
import logEvent from '../../utils/logEvent';
import Response from '../../utils/Response';

export default async ({ msg }) => {
    try {
        msg.channel.startTyping();
        logEvent({ id: 'command_leaderboard', details: { msg } });

        const time_parameter = parseTimeParameter({ content: msg.content });

        const leaderboard = await findHighestFeedback({
            time_parameter,
        });

        if (!leaderboard.length) {
            return Response.reject({
                msg,
                reason: `No users found in the leaderboard for given time parameter: \`${time_parameter}\`. Try a longer amount of time.`,
            });
        }

        Response.sendEmbed({
            ref: "leaderboard",
            msg,
            details: {
                leaderboard,
                time_parameter
            }
        })
        msg.channel.stopTyping();
    } catch (err) {
        console.log(err);
    }
};
