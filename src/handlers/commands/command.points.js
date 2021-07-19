import parseTimeParameter from '../../utils/parseTimeParameter';
import { findFeedbackByUserId } from '../../db/controllers';
import feedback from '../../embeds/feedback';
import logEvent from '../../utils/logEvent';

export default async ({ msg }) => {
    try {
        logEvent({ id: 'command_points', details: { msg } });
        msg.channel.startTyping();

        const time_parameter = parseTimeParameter({ content: msg.content });
        console.log(time_parameter);

        const [user] = await findFeedbackByUserId({
            user_id: msg.author.id,
            time_parameter,
        });

        if (!user) {
            msg.channel.stopTyping();
            return msg.reply('No feedback found for the given time parameter.');
        }

        msg.channel.stopTyping();
        msg.reply({
            embed: feedback.create({
                time_parameter,
                user: msg.author,
                points: user.toJSON().total_score,
                ratio:
                    +user.toJSON().total_positives /
                    (+user.toJSON().total_positives + +user.toJSON().total_negatives),
            }),
        });
    } catch (err) {
        console.log(err);
    }
};
