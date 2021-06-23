export default async ({ msg }) => {
    try {
        if (
            !msg.member.roles.cache.some((role) =>
                ['moderator', 'admin'].includes(role.name.toLowerCase().trim())
            )
        ) {
            msg.react('❌');
            msg.reply('❌ You do not have permission to set points.');
            return;
        }

        const amount_parameter = msg.content.split(' ')[1];
        
    } catch (e) {
        console.log(e);
    }
};
