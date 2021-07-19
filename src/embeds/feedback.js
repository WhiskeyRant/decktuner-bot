import settings from '../data/settings';
import getAvatarLink from '../utils/getAvatarLink';

const joinWithDot = (arr) => arr.join(' • ');
const getIndRatio = ({ p, n }) => {
    const ratio = +p / (+p + +n);
    const ratio_as_perc = (ratio * 100).toFixed(2).replace(/[.,]00$/, '');
    return `(${ratio_as_perc}%)`;
};

export default {
    create: ({
        user,
        points,
        ratio,
        time_parameter,
        leaderboard,
        top_user,
    }) => {
        const embed = {
            color: 0x32aaff,
            author: {
                name: 'DeckTuner',
                icon_url: settings.image('bot_logo'),
                url: 'https://decktuner.com',
            },
            timestamp: new Date(),
            thumbnail: {
                url: top_user
                    ? getAvatarLink({
                          id: top_user.id,
                          avatar: top_user.avatar,
                      })
                    : getAvatarLink({ id: user.id, avatar: user.avatar }),
            },
        };


        if (!leaderboard && points) {
            embed.fields = [
                {
                    name: `${user.tag}`,
                    value: `⭐ Points: ${points} (${(ratio * 100)
                        .toFixed(2)
                        .replace(/[.,]00$/, '')}%)`,
                },
            ];
        } else if (leaderboard) {
            embed.fields = [
                {
                    name: `⭐ __Leaderboard__ ⭐`,
                    value: leaderboard.map(
                        (x, i) =>
                            `${i+1}. <@${x.user_id}>: ${x.total_score} ${getIndRatio({
                                p: x.positive_count,
                                n: x.negative_count,
                            })}`
                    ),
                },
            ];
        } else {
            embed.fields = [
                {
                    name: `⭐ Winner: ${user.tag}`,
                    value: `ID: ${user.id}`,
                },
            ];
        }

        if (points || leaderboard) {
            embed.footer = {
                text:
                    'Points By ' +
                    { week: 'Week', month: 'Month', all: 'All Time' }[
                        time_parameter
                    ],
            }
        }

        return embed;
    },
};
