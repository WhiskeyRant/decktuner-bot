import parseTimeParameter from '../../utils/parseTimeParameter';
import { findFeedbackByUserId } from '../../db/controllers';
import feedback from '../../embeds/feedback';

export default async ({ msg }) => {
    try {
        msg.channel.startTyping();

        const time_parameter = parseTimeParameter({ content: msg.content });

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
                    (+user.toJSON().total_positives +
                        +user.toJSON().total_negatives),
            }),
        });
    } catch (err) {
        console.log(err);
    }
};
