const { MessageActionRow } = require('discord-buttons');
import { confirm_button, neutral_button, reject_button } from './buttons';

export const feedbackRow = ({ disabled = false, message_id, chosen } = {}) => {
    try {
        return new MessageActionRow()
            .addComponent(
                confirm_button.create({
                    message_id,
                    disabled,
                    text: 'Positive',
                    prefix: chosen == 1 ? '✅' : '',
                })
            )
            .addComponent(
                neutral_button.create({
                    message_id,
                    disabled,
                    text: 'Neutral',
                    prefix: chosen == 0 ? '➖' : '',
                })
            )
            .addComponent(
                reject_button.create({
                    message_id,
                    disabled,
                    text: 'Negative',
                    prefix: chosen == -1 ? '✖️' : '',
                })
            );
    } catch (e) {
        console.log(e);
    }
};

export const confirmationRow = ({message_id, disabled, chosen}) => {
    try {
        return new MessageActionRow()
            .addComponent(
                confirm_button.create({
                    message_id,
                    disabled,
                    text: 'Confirm',
                    prefix: chosen == 1 ? '✅' : '',
                })
            )
            .addComponent(
                reject_button.create({
                    message_id,
                    disabled,
                    text: 'Try again',
                    prefix: chosen == -1 ? '✖️' : '',
                })
            );
    } catch (e) {
        console.log(e);
    }
};
