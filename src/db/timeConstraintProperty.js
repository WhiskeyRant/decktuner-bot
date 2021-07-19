import { Op } from 'sequelize';
import { sub } from 'date-fns';

export default ({ before = {}, time_parameter }) => {
    try {
        let where = {
            ...before,
        };

        if (time_parameter === 'week') {
            where.createdAt = {
                [Op.gte]: sub(new Date(), { days: 7 }),
            };
        } else if (time_parameter === 'cmonth') {
            let date = new Date();
            date.setDate(1);
            date.setHours(0, 0, 0, 0);

            where.createdAt = {
                [Op.gte]: date,
            };
        } else if (time_parameter === 'month') {
            where.createdAt = {
                [Op.gte]: sub(new Date(), { days: 30 }),
            };
        } else if (time_parameter !== 'all') {
            throw new Error('Invalid time_parameter' + JSON.stringify({ user_id, time_parameter }));
        }

        console.log(where);

        return where;
    } catch (err) {
        console.log(err);
    }
};
