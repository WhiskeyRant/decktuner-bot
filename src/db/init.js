require('dotenv').config();
const { Sequelize } = require('sequelize');

export default async () => {
    try {
        const sequelize = new Sequelize({
            database: process.env.DB_DATABASE,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'postgres',
            logging: false,
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                },
            },
        });

        return sequelize;

    } catch (error) {
        console.error(error, 'Unable to connect to the database:')
    }
};
