import models from './models';
import db from './init';
import timeConstraintProperty from './timeConstraintProperty';
import { countVotesAllLiteral, countVotesLiteral } from './literals';
import { QueryTypes } from 'sequelize';
import { sub } from 'date-fns';

export const createUser = async ({ user_id }) => {
    try {
        const { User } = await models();
        return User.findOrCreate({
            where: { user_id },
            defaults: {
                user_id,
            },
        });
    } catch (e) {
        console.log(e);
    }
};

export const addUserFeedback = async ({ user_id, attitude }) => {
    try {
        const { Feedback } = await models();

        if (![-1, 0, 1].some((x) => x === attitude)) {
            throw new Error(
                'Attitude value invalid' + JSON.stringify({ user_id, attitude })
            );
        }

        return Feedback.create({
            score: attitude,
            user_id,
        });
    } catch (e) {
        console.log(e);
    }
};

export const createWorkshop = async ({ channel_id, post_id, pilot }) => {
    try {
        const { Workshop } = await models();

        return Workshop.create({
            channel_id,
            post_id,
            pilot,
        });
    } catch (e) {
        console.log(e);
    }
};

export const deleteWorkshop = async ({ channel_id }) => {
    try {
        const { Workshop } = await models();

        return Workshop.destroy({
            where: { channel_id },
        });
    } catch (e) {
        console.log(e);
    }
};

export const findWorkshopById = async ({ channel_id }) => {
    try {
        const { Workshop, User } = await models();

        const workshop = await Workshop.findOne({
            where: { channel_id },
            include: User,
        });

        const tuners = await workshop.getTuners();

        return [workshop, tuners];
    } catch (e) {
        console.log(e);
    }
};

export const addTunerToWorkshop = async ({ channel_id, user_id }) => {
    try {
        const { Workshop, User } = await models();
        const workshop = await Workshop.findOne({ where: { channel_id } });
        const user = await User.findOne({ where: { user_id } });
        return workshop.addTuner(user);
    } catch (e) {
        console.log(e);
    }
};

export const findFeedbackByUserId = async ({ user_id, time_parameter }) => {
    try {
        const { Feedback } = await models();
        const sequelize = db.use();
        // const negatives_literal = `(SELECT COUNT(score), user_id FROM feedback WHERE score = -1 AND user_id = ${user_id})`
        // const positives_literal = `(SELECT COUNT(score), user_id FROM feedback WHERE score = 1 AND user_id = ${user_id})`

        const user = await Feedback.findAll({
            where: timeConstraintProperty({
                before: { user_id },
                time_parameter,
            }),
            attributes: [
                'user_id',
                [sequelize.fn('sum', sequelize.col('score')), 'total_score'],
                [
                    sequelize.literal(
                        countVotesLiteral({ user_id, attitude: 1 })
                    ),
                    'total_positives',
                ],
                [
                    sequelize.literal(
                        countVotesLiteral({ user_id, attitude: -1 })
                    ),
                    'total_negatives',
                ],
                // [sequelize.fn('count', sequelize.literal('SELECT score FROM feedback WHERE score = 1')), 'total_positive'],
                // [sequelize.literal(negatives_literal), 'total_negatives'],
                // [sequelize.literal(positives_literal), 'total_positives'],
            ],
            group: ['user_id'],
        });

        return user;
    } catch (e) {
        console.log(e);
    }
};

export const findHighestFeedback = async ({ time_parameter }) => {
    try {
        const sequelize = db.use();

        const time_stamp = {
            get week() {
                return sub(new Date(), { minutes: 5 });
            },
            get month() {
                return sub(new Date(), { days: 1 });
            },
            get all() {
                return sub(new Date(), { years: 10 });
            },
        }[time_parameter];

        const leaderboard = await sequelize.query(countVotesAllLiteral, {
            bind: [time_stamp],
            type: QueryTypes.SELECT,
        });

        return leaderboard;
    } catch (e) {
        console.log(e);
    }
};

// const findAll = (statement) =>
//     Feedback.findAll({
//         where: timeConstraintProperty({
//             time_parameter,
//         }),
//         attributes: ['user_id', statement],
//         group: ['user_id'],
//         order: sequelize.literal('total_score DESC'),
//         limit: 10,
//     });
// sequelize.query('SELECT * FROM `users`', { type: QueryTypes.SELECT });

// const aggregates = [
//     [sequelize.fn('sum', sequelize.col('score')), 'total_score'],
//     [sequelize.fn('count', sequelize.col('score')), 'positives_count'],
//     [sequelize.fn('count', sequelize.col('score')), 'negatives_count'],
// ];

// const leaderboard = await Feedback.findAll({
//     where: timeConstraintProperty({
//         time_parameter,
//     }),
//     attributes: [
//         'user_id',
//         [sequelize.fn('sum', sequelize.col('score')), 'total_score'],
//     ],
//     group: ['user_id'],
//     order: sequelize.literal('total_score DESC'),
//     limit: 10,
// });
