import client from './client';
import settings from '../config/settings';

export default () => {
    let workshop_suffix;
    const workshops = settings
        .channel('workshop_category')
        .map((x) => client.channels.cache.get(x).children.array())
        .flat();
    if (!workshops.length) {
        return `001`;
    } else {
        const getTag = (channel) => +channel.name.split('-')[1];
        const highest_tag = workshops.reduce(
            (acc, channel) => {
                return getTag(channel) > getTag(acc) ? channel : acc;
            }
        );
        workshop_suffix = getTag(highest_tag);
    }

    workshop_suffix++;

    return workshop_suffix.toString();
};
