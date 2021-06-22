import settings from '../data/settings';
import {
    deleteWorkshop,
    findWorkshopById,
    addUserFeedback,
} from '../db/controllers';
import client from './client';
import { logClosedWorkshop, logFeedback } from './logHistory';
import questionPrompt from '../embeds/questionPrompt';
import getAvatarLink from './getAvatarLink';
import {
    confirm_button,
    reject_button,
    neutral_button,
} from '../buttons/buttons';
import collectClick from '../collectors/collectClick';
import { feedbackRow } from '../buttons/row';
const { MessageActionRow } = require('discord-buttons');

export default async ({ msg }) => {
    try {
        msg.channel.send({
            embed: questionPrompt.create({
                question:
                    'Looks like the tuning is complete!\n' +
                    'We ask that pilots leave feedback for the tuners whether it be positive, neutral, or negative.\n' +
                    'Please check your inbox to complete the feedback process.\n',
            }),
        });

        const [workshop, tuners] = await findWorkshopById({
            channel_id: msg.channel.id,
        });
        const tuner_user_data = await getTunerUserData({ msg, tuners });

        const pilot = await msg.guild.members.fetch(workshop.toJSON().pilot);

        let i = 0;
        while (i < tuner_user_data.length) {
            await processFeedbackQuestion({
                tuner: tuner_user_data[i],
                pilot,
            });
            i++;
        }

        const pinned_messages = await msg.channel.messages.fetchPinned();
        const { embeds } = pinned_messages.find(
            (pin) => pin.author.id == client.user.id
        );

        const deleted = await deleteWorkshop({ channel_id: msg.channel.id });

        if (deleted == 0) {
            throw new Error(
                `Something went wrong. Channel couldn't be deleted.`,
                msg
            );
        }

        const bounty_board = client.channels.cache.get(
            settings.channel('bounty_board')
        );
        const post = await bounty_board.messages.fetch(workshop.toJSON().post_id);
        Promise.all([
            logClosedWorkshop({ msg, embed: embeds[0] }),
            msg.channel.delete(),
            post.delete(),
            pilot.send('✅ The workshop has been successfully closed and your feedback has been submitted. Thanks for using DeckTuner!')
        ]);
    } catch (e) {
        console.log(e);
    }
};

const processFeedbackQuestion = async ({ tuner, pilot }) => {
    try {
        const embed = questionPrompt.create({
            question: `How did you feel about the help you received from ${tuner.name}?`,
            details: {
                thumbnail: tuner.pfp,
            },
        });
        const feedback_question_first = await pilot.send({
            embed,
        });

        const feedback_question_edited = await feedback_question_first.edit({
            embed,
            component: feedbackRow({ message_id: feedback_question_first.id }),
        });

        const click = await collectClick({
            buttoned_msg: feedback_question_edited,
        });
        const change = click.confirmed ? 1 : click.rejected ? -1 : 0;

        Promise.all([
            feedback_question_first.edit({
                embed,
                component: feedbackRow({
                    disabled: true,
                    message_id: feedback_question_first.id,
                    chosen: change,
                }),
            }),
            logFeedback({
                pilot: pilot.id,
                tuner: tuner.id,
                change,
            }),
            addUserFeedback({
                user_id: tuner.id,
                attitude: change,
            }),
        ]);
    } catch (e) {
        console.log(e);
    }
};

const getTunerUserData = async ({ msg, tuners }) => {
    let i = 0;
    const tuner_user_data = [];
    while (i < tuners.length) {
        const { user } = await msg.guild.members.fetch(
            tuners[i].toJSON().user_id
        );
        tuner_user_data.push({
            name: user.username + '#' + user.discriminator,
            id: user.id,
            pfp: getAvatarLink(user),
        });
        i++;
    }

    return tuner_user_data;
};
