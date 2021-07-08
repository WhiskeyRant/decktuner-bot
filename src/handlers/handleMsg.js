import settings from '../../src/data/settings';
import closeWorkshop from '../logic/closeWorkshop';
import updateCardAPI from '../logic/updateCardAPI';
import logEvent from '../utils/logEvent';
import tunerParticipation from '../utils/tunerParticipation';
import leaderboard from './commands/command.leaderboard';
import points from './commands/command.points';
import tune from './commands/command.tune';

const handleMsg = async (msg) => {
    try {
        if (msg.content.startsWith('!test')) {
            const users_roles = msg.member.roles.cache
                .map((role) => role.name.toLowerCase().trim())
                .filter((role) => ['moderator', 'admin', 'tuner', 'pilot'].includes(role));
            logEvent({
                id: 'command_close_force_bad_permissions',
                details: {
                    msg,
                    roles: users_roles,
                },
            });
        }
        if (
            msg.content.startsWith('!api') &&
            msg.member.roles.cache.some((role) => role.name.toLowerCase().trim() === 'admin')
        ) {
            updateCardAPI({ msg });
        }
        if (msg.content.startsWith('!points')) {
            points({ msg });
            return;
        }
        if (msg.content.startsWith('!leaderboard')) {
            leaderboard({ msg });
            return;
        }
        if (msg.content.startsWith('!tune')) {
            // if () {

            // }
            await tune({ msg });
            return;
        }
        // if (
        //     msg.content.startsWith('!setpoints')
        // ) {
        //     setpoints({msg});
        //     return;
        // }

        if (
            msg.type !== 'PINS_ADD' &&
            !msg.author.bot &&
            msg.channel.parent &&
            settings.channel('workshop_category').includes(msg.channel.parent.id)
        ) {
            const users_roles = msg.member.roles.cache
                .map((role) => role.name.toLowerCase().trim())
                .filter((role) => ['moderator', 'admin', 'tuner', 'pilot'].includes(role));

            if (msg.content.trim() === '!close' && users_roles.length) {
                return await closeWorkshop({ msg });
            } else if (msg.content.trim() === '!forceclose') {
                if (!users_roles.some((role) => ['moderator', 'admin'].includes(role))) {
                    logEvent({
                        id: 'command_close_force_bad_permissions',
                        details: {
                            msg,
                            roles: users_roles,
                        },
                    });
                    msg.react('❌');
                    return msg.reply('❌ You do not have permissions to force close this channel.');
                }
                return closeWorkshop({ msg, force: true });
            }

            if (msg.member.roles.cache.some((role) => role.name.toLowerCase().trim() === 'tuner')) {
                return tunerParticipation({ msg });
            }
        }
    } catch (e) {
        console.log(e);
    }
};

export default handleMsg;
