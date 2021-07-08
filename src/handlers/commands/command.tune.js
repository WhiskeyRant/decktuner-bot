import ActiveInterviews from '../../utils/ActiveInterviews';
import startInterview from '../../logic/startInterview';
import settings from '../../data/settings';
import { findWorkshopByPilot } from '../../db/controllers';

export default async ({ msg }) => {
    try {
        if (settings.channel('get_help') !== msg.channel.id) {
            return;
        }
        if (ActiveInterviews.userExists(msg.author.id)) {
            return msg.reply(
                'Looks like you are already in the process of a tuning interview. If you want to exit the interview, message !cancel in private messages to me.'
            );
        }
        if (
            await findWorkshopByPilot({ pilot: msg.author.id }) &&
            process.env.NODE_ENV === 'production'
        ) {
            return msg.reply(
                `Looks like you already have an active workshop. If you're finished with your current workshop, enter !close in the workshop channel and then follow the prompt to leave feedback for the tuners that helped you. Then you will be able to open a new workshop.`
            );
        }
        msg.reply(
            'Deck Tuning process initiated!\nCheck your messages to answer some questions to get started.'
        );
        startInterview(msg);
        return;
    } catch (err) {
        console.log(err);
    }
};
