require('dotenv').config();
const { Sequelize } = require('sequelize');

class db {
    static sequelize;

    static use() {
        if (!this.sequelize) {
            this.sequelize = new Sequelize({
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
                        rejectUnauthorized: false,
                    },
                },
                pool: {
                    max: 100,
                    min: 0,
                    idle: 200000,
                    // @note https://github.com/sequelize/sequelize/issues/8133#issuecomment-359993057
                    acquire: 1000000,
                },
            });
        }

        return this.sequelize;
    }
}
export default db;
