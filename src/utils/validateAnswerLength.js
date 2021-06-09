const key_length_pairs = [
    {
        key: "decklist",
        max_length: 100
    },
    {
        key: "commander",
        max_length: 150
    },
    {
        key: "desired_experience",
        max_length: 20
    },
    {
        key: "budget",
        max_length: 10
    },
    {
        key: "deck_goals",
        max_length: 400
    },
    {
        key: "tuning_goals",
        max_length: 400
    },
]

export default ({content, key}) => {
    const length = key_length_pairs.find(x => x.key == key).max_length
    return {
        valid: content.length <= length,
        length
    }
}