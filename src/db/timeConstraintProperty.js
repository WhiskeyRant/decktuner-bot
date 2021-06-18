import { Op } from 'sequelize';
import { sub } from 'date-fns';

export default ({ before = {}, time_parameter }) => {
    try {
        let where = {
            ...before,
        };

        if (time_parameter === 'week') {
            where.createdAt = {
                [Op.gte]: sub(new Date(), { minutes: 5 }),
            };
        } else if (time_parameter === 'month') {
            where.createdAt = {
                [Op.gte]: sub(new Date(), { days: 1 }),
            };
        } else if (time_parameter !== 'all') {
            throw new Error(
                'Invalid time_parameter' +
                    JSON.stringify({ user_id, time_parameter })
            );
        }

        return where;
    } catch (err) {
        console.log(err);
    }
};