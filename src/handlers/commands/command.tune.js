import ActiveInterviews from '../../utils/ActiveInterviews';
import questionnaire from '../../utils/questionnaire';

export default async ({ msg }) => {
    try {
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
    } catch (err) {
        console.log(err);
    }
};
