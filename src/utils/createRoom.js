import client from '../utils/client';
import settings from '../data/settings';
import bountyListing from '../embeds/bountyListing';

const temp = {
    id: '123',
};

export default async ({ author, fields, suffix }) => {
    const guild = client.guilds.cache.get(settings.server());
    const help_channel = await guild.channels.create('workshop-' + suffix, {
        topic: 'some topic here',
        parent: settings.channel('workshop_category'),
    });
    const starting_msg = await help_channel.send(
        `${author} Your bounty has been listed. Please wait for someone to assist you with tuning your deck.`,
        {
            embed: bountyListing.create({
                author,
                fields,
                channel: help_channel.id,
                empty_tuners: true,
            }),
        }
    );
    starting_msg.pin();
    return help_channel;
};
