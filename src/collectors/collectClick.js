import questionPrompt from '../embeds/questionPrompt';
import { confirm_button } from '../buttons/buttons';

const collectClick = async ({ buttoned_msg }) => {
    try {
        const collector = await buttoned_msg.awaitButtons(() => true, {
            time: 3 * 60000,
            max: 1,
        });
        const button = collector.first();

        if (button.message.id == buttoned_msg.id) {
            button.defer();
            if (button.id.includes('confirm')) {
                return { confirmed: true };
            } else if (button.id.includes('neutral')) {
                return { neutral: true };
            } else {
                return { rejected: true }
            }
        }
    } catch (e) {
        console.log(e);
    }
};

export default collectClick;