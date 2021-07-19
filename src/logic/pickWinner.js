export default ({ commandMsg }) => {
    try {
        console.log(commandMsg.content);
    } catch (e) {
        console.log(e);
    }
};
