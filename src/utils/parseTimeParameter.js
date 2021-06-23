export default ({ content }) => {
    const msg_array = content.toLowerCase().split(' ');
    let time_parameter = 'all';

    if (msg_array[1]) {
        if (msg_array[1].includes('week')) {
            time_parameter = 'week';
        } else if (msg_array[1].includes('month')) {
            time_parameter = 'month';
        }
    };

    return time_parameter;
};
