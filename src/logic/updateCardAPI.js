import axios from 'axios';
import settings from '../config/settings';
import { addCard } from '../db/controllers';
import logEvent from '../utils/logEvent';
import Permissions from '../utils/Permissions';

const updateCardAPI = async ({ msg }) => {
    try {
        if (!Permissions.checkRole({ user: msg.member, roles: 'admin' })) return;
        logEvent({
            id: 'update_card_api',
            details: {
                msg,
            },
        });

        let page = 1;
        let hasMore = true;
        let total_additions = 0;
        let total_count = 0;
        let formatted_legends = [];

        while (hasMore) {
            const { data } = await axios.get(`https://api.scryfall.com/cards/search?page=${page}&q=...`);

            const legends = data.data.filter(x => {
                if (!x.type_line) return false;
                const type_line = x.type_line.toLowerCase();
                const real_card = Object.entries(x.legalities).some(
                    ([format, legality]) => legality === 'legal' && format === 'commander'
                );
                return (
                    type_line.includes('legend') &&
                    (type_line.includes('creature') || type_line.includes('planeswalker')) &&
                    real_card &&
                    (x.image_uris || x.card_faces)
                );
            });



            const page_legends = legends.map(x => ({
                name: x.name,
                image_normal: x.image_uris ? x.image_uris.normal : x.card_faces[0].image_uris.normal,
                image_art_crop: x.image_uris
                    ? x.image_uris.art_crop
                    : x.card_faces[0].image_uris.art_crop,
                color_identity: x.color_identity,
                is_edh_legal: x.legalities.commander === 'legal',
                is_partner: x.keywords.some(keyword => keyword.toLowerCase() === 'partner'),
                scryfall_id: x.id,



            }));

            formatted_legends = formatted_legends.concat(page_legends);
            
            const submission = await addCard({ cards: page_legends });
            total_additions += submission.reduce((acc, item) => (item[1] ? acc + 1 : acc), 0);
            total_count += submission.length;
           
            hasMore = data.has_more;
            page += 1;
        }
        
        msg.channel.send(
          `✅ Finished submitting to the database. There were ${total_additions} new additions, resulting in ${total_count} total valid commanders available.`
      );
    } catch (e) {        
        msg.channel.send(`Something went wrong.`);
        console.log(e);
    }
};

export default updateCardAPI;
