const validateURL = require('valid-url');
import { approved_websites } from '../data/interview_questions';
import validateAnswerLength from '../utils/validateAnswerLength';
import axios from 'axios';
import questionPrompt from '../embeds/questionPrompt';
import collectClick from '../collectors/collectClick';
import { confirmationRow } from '../buttons/row';
const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');
import { MessageAttachment } from 'discord.js';

const collectAnswer = async ({ question, channel, i, questions_length }) => {
    try {
        const embed = questionPrompt.create({
            question: question.question,
            details: question.details,
            i,
            questions_length,
        });
        await channel.send({ embed });

        const collected = await channel.awaitMessages((response) => response, {
            max: 1,
            time: 5 * 60000,
        });

        if (!collected.size) {
            return {
                cancel: true,
                proceed: false,
                error: "Time expired. Restart the questionnaire when you're ready.",
            };
        }

        if (collected.first().content.startsWith('!cancel')) {
            await collected.first().react('✅');
            return {
                cancel: true,
                proceed: false,
                error: 'Questionnaire cancelled. If you would like to begin again go back to the server and type !tune in the designated channel.',
            };
        }

        const { content, proceed, error, details, cancel } =
            await proceedReducer({
                content: collected.first().content,
                key: question.key,
                channel,
            });

        if (proceed) {
            collected.first().react('✅');
        }

        return { proceed, error, content, details, cancel };
    } catch (e) {
        console.log(e);
        return {
            cancel: true,
            proceed: false,
            error: 'An unexpected error occured. An API that the bot utilizes is likely down right now, but please contact an admin if the problem persists.',
        };
    }
};

const proceedReducer = async ({ content, key, channel }) => {
    try {
        const { valid: lengthValid, length } = validateAnswerLength({
            content,
            key,
        });
        if (lengthValid === false) {
            return {
                content,
                proceed: false,
                error: `Length of answer too long. Please cut down the length. Max char count: ${length}`,
            };
        }

        if (key === 'decklist') {
            if (!validateURL.isUri(content)) {
                return { content, proceed: false, error: 'Invalid link.' };
            }
            if (
                !approved_websites.some((x) =>
                    content.toLowerCase().includes(x.base_url.toLowerCase())
                )
            ) {
                return {
                    content,
                    proceed: false,
                    error: 'Submitted deck is not from an approved site.',
                };
            }
            return { content, proceed: true };
        } else if (key === 'commander') {
            channel.startTyping();

            const please_wait_msg = await channel.send(
                'Fetching commander details. Sometimes this might take a moment.'
            );

            const lcContent = content.toLowerCase();
            let commander_list = lcContent.includes('+')
                ? lcContent.split('+').map((x) => x.trim())
                : lcContent
                      .split('\n')
                      .filter((x) => x)
                      .map((x) => x.trim());

            let fetched_commander_list = [];
            let i = 0;
            while (i < commander_list.length) {
                const commander = commander_list[i];

                const { data: mtgio_data } = await axios.get(
                    `https://api.magicthegathering.io/v1/cards?name=${commander.toLowerCase()}`,
                    { timeout: 2000 }
                );

                // restrict search from api to only cards that can be possible
                const valid_commanders = mtgio_data.cards.filter(
                    (card) =>
                        card.supertypes &&
                        card.supertypes.includes('Legendary') &&
                        card.imageUrl
                );

                if (!valid_commanders.length) {
                    channel.stopTyping();
                    return {
                        content,
                        proceed: false,
                        error: "❌ One or more of the commanders you selected weren't found. Please try again.",
                    };
                };

                console.log(valid_commanders[0].name);

                const { data: scryfall_data } = await axios.get(
                    `https://api.scryfall.com/cards/named?exact=${valid_commanders[0].name}`
                );


                if (
                    commander_list.length > 1 &&
                    !scryfall_data.keywords.includes('Partner')
                ) {
                    channel.stopTyping();
                    return {
                        content,
                        proceed: false,
                        error: "❌ One or more of the commanders you selected aren't partners. Please try again.",
                    };
                }

                fetched_commander_list.push({
                    name: valid_commanders[0].name,
                    color_identity: valid_commanders[0].colorIdentity || ['X'],
                    image: scryfall_data.card_faces
                        ? scryfall_data.card_faces[0].image_uris.normal
                        : scryfall_data.image_uris.normal,
                    art_image: scryfall_data.card_faces
                        ? scryfall_data.card_faces[0].image_uris.art_crop
                        : scryfall_data.image_uris.art_crop,
                });

                i++;
            }

            let file;
            if (fetched_commander_list.length > 1) {
                let images = fetched_commander_list.map((x) => {
                    return {
                        src: x.image,
                        x: 0,
                        y: 0,
                    };
                });
                images[1].x = 488;
                const b64 = await mergeImages(images, {
                    Canvas: Canvas,
                    Image: Image,
                    width: 488 * 2,
                });

                let buff = new Buffer.from(
                    b64.split(';base64,').pop(),
                    'base64'
                );
                file = new MessageAttachment(buff, 'commanders.jpg');
            }

            const embed = questionPrompt.create({
                question:
                    fetched_commander_list.length == 1
                        ? 'Please confirm if this is your commander'
                        : 'Please confirm if these are your commanders',
                details: {
                    title: fetched_commander_list
                        .map((x) => x.name)
                        .join(' + '),
                    image:
                        fetched_commander_list.length == 1 &&
                        fetched_commander_list[0].image,
                },
                attachment: !!file,
            });
            const msg_opt_default = { files: file && [file], embed };

            const sent_question = await channel.send(msg_opt_default);
            const edited_question = await sent_question.edit({
                ...msg_opt_default,
                component: confirmationRow({ message_id: sent_question.id }),
            });

            please_wait_msg.delete();
            channel.stopTyping();

            const { confirmed, rejected } = await collectClick({
                buttoned_msg: edited_question,
            });

            if (rejected) {
                return {
                    proceed: false,
                    error: '❌ Commander rejected. Try typing in a new commander name. Try to be more specific this time.',
                };
            }

            const edited_question_disabled = await edited_question.edit({
                ...msg_opt_default,
                component: confirmationRow({
                    message_id: sent_question.id,
                    disabled: true,
                }),
            });

            const getClrIdentity = () => {
                let identity = [
                    ...new Set(
                        fetched_commander_list
                            .map((x) => x.color_identity)
                            .flat()
                    ),
                ];
                if (identity.includes('X') && identity.length > 1) {
                    identity = identity.filter((x) => x !== 'X');
                }

                return identity;
            };

            return {
                content,
                proceed: confirmed,
                details: {
                    attachment: !!file,
                    name: fetched_commander_list
                        .map((cmdr) => cmdr.name)
                        .join(' + '),
                    colorIdentity: getClrIdentity(),
                    image: file || fetched_commander_list[0].image,
                    art_image:
                        fetched_commander_list.length == 1
                            ? fetched_commander_list[0].art_image
                            : 'https://c1.scryfall.com/file/scryfall-cards/art_crop/front/d/e/de4f53fc-69d7-49fb-885b-4cc02bf5facc.jpg?1562594477',
                },
            };
        } else {
            return { content, proceed: true };
        }
    } catch (e) {
        console.log(e);
    }
};

export default collectAnswer;

// const embed = questionPrompt.create({
//     question: 'Please confirm if this is your commander',
//     details: {
//         title: valid_commanders[0].name,
//         image: valid_commanders[0].imageUrl,
//     },
// });
// const sent_question = await channel.send({ embed });

// const edited_question = await sent_question.edit({
//     embed,
//     component: confirmationRow({ message_id: sent_question.id }),
// });
