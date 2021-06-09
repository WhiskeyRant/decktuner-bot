import settings from '../data/settings';
import {
    addTunerToWorkshop,
    findWorkshopById,
    createUser,
} from '../db/controllers';
import client from './client';

export default async ({ msg }) => {
    const tuner = await createUser({ user_id: msg.author.id });

    const added_data = await addTunerToWorkshop({
        channel_id: msg.channel.id,
        user_id: msg.author.id,
    });

    // if (added_data) {
    const [workshop, tuners] = await findWorkshopById({
        channel_id: msg.channel.id,
    });

    const bounty_board = client.channels.cache.get(
        settings.channel('bounty_board')
    );
    const post = await bounty_board.messages.fetch(workshop.toJSON().post_id);
    const tuner_field_index = post.embeds[0].fields.findIndex((x) => x.name === 'Tuners');
    const tuner_field = post.embeds[0].fields[tuner_field_index];
    const tuner_value =
        '<@' + tuners.map((x) => x.toJSON().user_id).join('>\n<@') + '>';
    let fields_after_edit = [...post.embeds[0].fields];
    fields_after_edit[tuner_field_index] = {
        ...tuner_field,
        value: tuner_value
    }


    await post.edit({
        embed: {
            ...post.embeds[0],
            fields: fields_after_edit,
        },
    });
    // }
};
