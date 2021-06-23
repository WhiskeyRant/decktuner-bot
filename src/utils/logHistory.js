import client from './client';
import settings from '../data/settings';
import questionPrompt from '../embeds/questionPrompt';

export const logClosedWorkshop = async ({ msg, force, embed }) => {
    const history_channel = client.channels.cache.get(
        settings.channel('history')
    );
    history_channel.send(
        `${msg.author} closed a workshop` +
            `\n**Channel Name:** \`${msg.channel.name}\`` +
            `\n**Channel ID:** \`${msg.channel.id}\`` +
            (force ? `\n**Forced:** True` : ``) + 
            `\n**Embed:**` ,
        { embed }
    );
};

export const logFeedback = async ({ pilot, tuner, change }) => {
    const history_channel = await client.channels.cache.get(
        settings.channel('history')
    );

    const change_word = { 1: 'Positive', 0: 'Neutral', '-1': 'Negative' }[
        change
    ];
    history_channel.send({
        embed: questionPrompt.create({
            question:
                `<@${pilot}> left feedback for <@${tuner}>\n\n` +
                `Result: ${change_word}`,
        }),
    });
};

// export const logStartQuestionnaire = async ({ msg, embed }) => {
//     const
// }
