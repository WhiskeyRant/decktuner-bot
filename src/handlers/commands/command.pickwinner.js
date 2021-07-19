import logEvent from '../../../src/utils/logEvent';
import settings from '../../data/settings';
import { randomFeedback } from '../../db/controllers';
import feedbackEmbed from '../../embeds/feedback';

export default async ({ commandMsg }) => {
    try {
        logEvent({ id: 'command_pickwinner', details: { msg: commandMsg } });
        const pleaseWaitMsg = await commandMsg.channel.send(
            `${settings.emoji('loading')} Picking a winner... This may take a few moments.`
        );

        const [feedback] = await randomFeedback();

        const { user: winner } = await commandMsg.guild.members.fetch(feedback.toJSON().user_id);

        pleaseWaitMsg.edit('', {
            embed: feedbackEmbed.create({
                user: winner,
            }),
        });
    } catch (e) {
        console.log(e);
    }
};
