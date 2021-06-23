import interview_questions from '../data/interview_questions';
import collectAnswer from '../collectors/collectAnswer';
import client from './client';
import createRoom from './createRoom';
import bountyListing from '../embeds/bountyListing';
import { confirm_button } from '../buttons/buttons';
import collectClick from '../collectors/collectClick';
import settings from '../data/settings';
import { createUser, createWorkshop } from '../db/controllers';
import getWorkshopTag from './getWorkshopTag';
import { confirmationRow } from '../buttons/row';
import ActiveInterviews from './ActiveInterviews';

export default {
    start: async (msg) => {
        try {
            ActiveInterviews.addUser(msg.author.id);
            const intro_msg = await msg.author.send(
                'Please complete a series of questions so that the tuning session can begin.'
            );
            const questions = [...interview_questions];
            let answers = [];
            let i = 0;
            while (i < questions.length) {
                const question = questions[i];

                const { proceed, content, error, cancel, details } =
                    await collectAnswer({
                        question,
                        channel: intro_msg.channel,
                        i,
                        questions_length: questions.length,
                    });

                if (error || cancel) {
                    await intro_msg.channel.send(error);
                    if (cancel) {
                        break;
                    }
                } else {
                    answers.push({ key: question.key, content, details });
                    i++;
                }
            }

            // const answers = [
            //     {
            //         key: 'decklist',
            //         content: 'https://archidekt.com/decks/1071348',
            //         details: undefined,
            //     },
            //     {
            //         key: 'commander',
            //         content: 'doran',
            //         details: {
            //             name: 'Doran, the Siege Tower',
            //             colorIdentity: ['B', 'G', 'W'],
            //             image: 'http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=140201&type=card',
            //             art_image:
            //                 'https://c1.scryfall.com/file/scryfall-cards/art_crop/front/b/0/b006b169-295d-4ead-8e8e-29a9c3246025.jpg?1562363463',
            //         },
            //     },
            //     {
            //         key: 'desired_experience',
            //         content: 'casual',
            //         details: undefined,
            //     },
            //     { key: 'budget', content: '$50', details: undefined },
            //     { key: 'deck_goals', content: 'whatever', details: undefined },
            //     { key: 'tuning_goals', content: 'whatever', details: undefined },
            // ];

            if (answers.length !== questions.length) {
                return ActiveInterviews.removeUser(msg.author.id);
            }

            this.default.finish({ intro_msg, answers, msg });
        } catch (err) {
            console.log(err);
        }
    },
    finish: async ({ intro_msg, answers, msg }) => {
        try {
            const embed = bountyListing.create({
                fields: answers,
                author: msg.author,
            });
            const confirmation_msg_text = 'This is a preview of what the tuning board post will look like. Is this ok?';

            const preview_msg = await intro_msg.channel.send(
                confirmation_msg_text,
                {
                    embed: embed,
                }
            );
            const edited_msg = await preview_msg.edit(
                confirmation_msg_text,
                {
                    component: confirmationRow({
                        message_id: preview_msg.id,
                    }),
                    embed: embed,
                }
            );

            const { confirmed, rejected } = await collectClick({
                buttoned_msg: edited_msg,
            });
            if (confirmed) {
                const workshop_suffix = getWorkshopTag();
                const created_room = await createRoom({
                    author: msg.author,
                    fields: answers,
                    suffix: workshop_suffix,
                });

                const bounty_board = client.channels.cache.get(
                    settings.channel('bounty_board')
                );
                const [bounty_board_post, [user, created]] = await Promise.all([
                    bounty_board.send({
                        embed: bountyListing.create({
                            fields: answers,
                            author: msg.author,
                            channel: created_room.id,
                        }),
                    }),
                    createUser({
                        user_id: msg.author.id,
                    })
                ]);
                Promise.all([
                    createWorkshop({
                        channel_id: created_room.id,
                        post_id: bounty_board_post.id,
                        pilot: user.toJSON().user_id,
                    }),
                    preview_msg.edit(
                        confirmation_msg_text,
                        {
                            component: confirmationRow({
                                message_id: preview_msg.id,
                                disabled: true,
                            }),
                            embed: embed,
                        }
                    ),
                    msg.author.send(
                        `✅ Your workshop has been created and named **#workshop-${workshop_suffix}**. You can go to the #tuning-board channel to see your tuning request which includes a link to your channel. You can also use the ctrl+k command and type in your workshop number to directly search for your designated workshop channel.`
                    ),
                ]);
            } else if (rejected) {
                edited_msg.channel.send(
                    `❌ Tuning initiation cancelled. You can start the process again by typing !tune in the #get-help channel on the server.`
                );
                preview_msg.edit(
                    confirmation_msg_text,
                    {
                        component: confirmationRow({
                            message_id: preview_msg.id,
                            disabled: true,
                        }),
                        embed: embed,
                    }
                );
            }

            ActiveInterviews.removeUser(msg.author.id);

            return;
        } catch (err) {
            console.log(err);
        }
    },
};
