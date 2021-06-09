export const approved_websites = [
    {
        base_url: 'https://archidekt.com/',
        site_name: 'Archidekt',
        emoji: '<:archidekt:851756895358550016>',
    },
    {
        base_url: 'https://www.moxfield.com/',
        site_name: 'Moxfield',
        emoji: '<:moxfield:851757319067140106>',
    },
    {
        base_url: 'https://tappedout.net/',
        site_name: 'TappedOut',
        emoji: '<:tappedout:851757413836259369>',
    },
    {
        base_url: 'https://deckstats.net/',
        site_name: 'DeckStats',
        emoji: '<:deckstats:851757582339014678>',
    },
    {
        base_url: 'https://aetherhub.com/',
        site_name: 'AetherHub',
        emoji: '<:aetherhub:851757268894482462>',
    },
];

export default [
    {
        key: 'decklist',
        question:
            "Thanks for using DeckTuner! Let's get started. First, paste a link to your deck in the message box below using one of the following approved deck builder sites:",
        details: {
            title: '\u200b',
            body: approved_websites
                .map((x) => `${x.emoji} [${x.site_name}](${x.base_url})`)
                .join('\n'),
        },
    },
    {
        question:
            'Perfect, now tell us who your commander is along with partners or companions. Separate each commander\'s name with a plus sign (+) or with a new line (shift+enter). You can use an approximate search although the exact name will be more accurate to the commander you\'re looking for.',
        key: 'commander',
    },
    {
        question:
            'Ok, now lets choose what kind of multiplayer experience you want this deck to create. Refer to [our list of categories here](https://docs.google.com/document/d/13ni10EIW3hvKNdKXSLUHo2uBaQOn-Y7A4Pxwo1IY8mU/edit) to help you decide.',
        key: 'desired_experience',
    },
    {
        question:
            'Got it. Now set your budget for changes and or upgrades. You can set a total amount and/or a per card amount. Please use your preferred currency denotations. Example: $50 total and no more than $10 per card',
        key: 'budget',
    },
    {
        question: `Nice, we can work with that. Now, in a few sentences, describe how you want this deck to work. If you're not exactly sure, try answering the following questions: How do you want to win? What's the overall strategy? Is it built around the commander(s) or a certain set of cards?`,
        key: 'deck_goals',
    },
    {
        question: `Sounds good. Now tell us what you'd like the tuners to help you with. It can be anything from “upgrade it to a competitive deck” to “help me find more Nirvana references for my janky tribute deck`,
        key: 'tuning_goals',
    },
];
