import models from './models';

export const createUser = async ({ user_id }) => {
    try {
        const { User } = await models();
        return User.findOrCreate({
            where: { user_id },
            defaults: {
                user_id,
                feedback: 0,
            },
        });
    } catch (e) {
        console.log(e);
    }
};

export const updateUserFeedback = async ({ user_id, attitude }) => {
    try {
        const { User } = await models();

        // if ([-1, 0, 1].some(x => attitude == x)) {
        //     throw new Error (`updateUserFeedback: Value for property 'attitude' not recognized. `);
        // }

        const user = await User.findOne({where: { user_id }});

        if (!user) {
            throw new Error (`updateUserFeedback: User not found.`)
        };

        user.update({
            feedback: user.feedback + attitude
        });

        return user;
    } catch (e) {
        console.log(e);
    }
}

export const createWorkshop = async ({ channel_id, post_id, pilot }) => {
    try {
        const { Workshop } = await models();

        return Workshop.create({
            channel_id,
            post_id,
            pilot
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
            include: User 
        });

        const tuners = await workshop.getTuners();

        return [workshop, tuners];
    }
    catch (e) {
        console.log(e);
    }
};

// export const findUserById = async ({ user_id }) => {
//     try {
//         const { User } = await models();

//         const user = await User.findOne({ 
//             where: { user_id }
//         });

//         return user;
//     }
//     catch (e) {
//         console.log(e);
//     }
// };


export const addTunerToWorkshop = async ({ channel_id, user_id }) => {
    try {
        const { Workshop, User } = await models();
        const workshop = await Workshop.findOne({where: {channel_id}})
        const user = await User.findOne({where: {user_id} });
        return workshop.addTuner(user);
    }
    catch (e) {
        console.log(e);
    }
};