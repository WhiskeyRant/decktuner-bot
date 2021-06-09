
const settings = {
    channels: {
        get_help: {
            development: "846013084896067614",
            production: "847356745986867240"
        },
        bounty_board: {
            development: "846020389062443028",
            production: "851479909532434453"
        },
        workshop_category: {
            development: "847460751940780072",
            production: "852304713478176779"
        },
        history: {
            development: "850215136962936902",
            production: "852304818553749505"
        }
    },
    servers: {
        development: "845671055384772698",
        production: "845023235422421056"
    },
    images: {
        bot_logo: "https://i.imgur.com/ZgRIZKY.png"
    }
}

export default {
    channel: channel => {
        const { NODE_ENV } = process.env;
        if (NODE_ENV === "development" || NODE_ENV === "production") {
            return settings.channels[channel][NODE_ENV];
        } else {
            throw new Error('channel() method: Environment variable: "NODE_ENV" has unknown value.')
        }
    },
    server: () => {
        const { NODE_ENV } = process.env;
        if (NODE_ENV === "development" || NODE_ENV === "production") {
            return settings.servers[NODE_ENV];
        } else {
            throw new Error('server() method: Environment variable: "NODE_ENV" has unknown value.')
        }
    },
    image: arg => {
        return settings.images[arg];
    }
};