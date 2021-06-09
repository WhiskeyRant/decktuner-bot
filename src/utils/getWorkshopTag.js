import client from './client';
import settings from '../data/settings';

export default () => {
    let workshop_suffix;
    const workshop_category = client.channels.cache.get(
        settings.channel('workshop_category')
    );
    if (!workshop_category.children.array().length) {
        workshop_suffix = 1;
    } else {
        const getTag = (channel) => +channel.name.split('-')[1];
        const highest_tag = workshop_category.children.reduce(
            (acc, channel) => {
                return getTag(channel) > getTag(acc) ? channel : acc;
            }
        );
        workshop_suffix = getTag(highest_tag);
    }

    if (workshop_suffix == 999) {
        workshop_suffix = 1;
    } else if (workshop_suffix >= 1) {
        workshop_suffix++;
    }

    return workshop_suffix.toString().padStart(3, '0');
};
