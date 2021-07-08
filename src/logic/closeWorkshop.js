import { feedbackRow } from '../buttons/row';
import collectClick from '../collectors/collectClick';
import settings from '../data/settings';
import { addUserFeedback, deleteWorkshop, findWorkshopById } from '../db/controllers';
import questionPrompt from '../embeds/questionPrompt';
import client from '../utils/client';
import getAvatarLink from '../utils/getAvatarLink';
import { logClosedWorkshop, logFeedback } from '../utils/logHistory';
import logEvent from '../utils/logEvent';

export default async ({ msg, force }) => {
    try {
        const [workshop, tuners] = await findWorkshopById({
            channel_id: msg.channel.id,
        });

        if (!force) {
            logEvent({
                id: 'command_close_self',
                details: {
                    msg,
                },
            });
        }

        const pilot = await msg.guild.members.fetch(workshop.toJSON().pilot);
        if (!force) {
            msg.channel.send({
                embed: questionPrompt.create({
                    question: [
                        'Looks like the tuning is complete!',
                        'We ask that pilots leave feedback for the tuners whether it be positive, neutral, or negative.',
                        'Please check your inbox to complete the feedback process.',
                    ].join('\n'),
                }),
            });

            const tuner_user_data = await getTunerUserData({ msg, tuners });

            for (let i = 0; i < tuner_user_data.length; i++) {
                const { timed_out } = await processFeedbackQuestion({
                    tuner: tuner_user_data[i],
                    pilot,
                });

                if (timed_out) {
                    return msg.channel.send(
                        "Looks like feedback question prompt expired. Restart the feedback process when you're ready."
                    );
                }
            }
        }

        const pinned_messages = await msg.channel.messages.fetchPinned();
        const { embeds } = pinned_messages.find((pin) => pin.author.id == client.user.id);

        const deleted = await deleteWorkshop({ channel_id: msg.channel.id });

        if (deleted == 0) {
            throw new Error(`Something went wrong. Channel couldn't be deleted.`, msg);
        }

        const bounty_board = client.channels.cache.get(settings.channel('bounty_board'));
        const post = await bounty_board.messages.fetch(workshop.toJSON().post_id);

        const channel_name = msg.channel.name;
        const channel_tag = channel_name.slice(channel_name.length - 3);

        msg.guild.roles.cache.find((role) => role.name === `role-${channel_tag}`).delete();

        //finish

        logEvent({
            id: 'workshop_close_success',
            details: {
                msg,
                force,
            },
        });

        await Promise.all([
            logClosedWorkshop({ msg, force, embed: embeds[0] }),
            msg.channel.delete(),
            post.delete(),
        ]);
        if (!force) {
            pilot.send(
                '✅ The workshop has been successfully closed and your feedback has been submitted. Thanks for using DeckTuner!'
            );
        }
    } catch (e) {
        console.log(e);
    }
};

const processFeedbackQuestion = async ({ tuner, pilot }) => {
    try {
        // send feedback prompt
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

        // await response and then process response
        const click = await collectClick({
            buttoned_msg: feedback_question_edited,
        });
        if (click.timed_out) {
            feedback_question_edited.edit(
                '*This message was a feedback question prompt that has now expired.*'
            );

            logEvent({
                id: 'feedback_button_click',
                details: {
                    expired: true,
                    tuner,
                    pilot,
                },
            });

            return {
                timed_out: true,
                error: click.error,
            };
        }
        const change = click.confirmed ? 1 : click.rejected ? -1 : 0;

        logEvent({
            id: 'feedback_button_click',
            details: {
                change,
                tuner,
                pilot,
            },
        });

        // finish
        feedback_question_first.edit({
            embed,
            component: feedbackRow({
                disabled: true,
                message_id: feedback_question_first.id,
                chosen: change,
            }),
        });
        logFeedback({
            pilot: pilot.id,
            tuner: tuner.id,
            change,
        });
        addUserFeedback({
            user_id: tuner.id,
            attitude: change,
        });

        return {};
    } catch (e) {
        console.log(e);
    }
};

const getTunerUserData = async ({ msg, tuners }) => {
    const tuner_user_data = [];
    for (let i = 0; i < tuners.length; i++) {
        const { user } = await msg.guild.members.fetch(tuners[i].toJSON().user_id);
        tuner_user_data.push({
            name: user.username + '#' + user.discriminator,
            id: user.id,
            pfp: getAvatarLink(user),
        });
    }

    return tuner_user_data;
};
