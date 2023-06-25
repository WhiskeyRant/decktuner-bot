import settings from './settings';

export default [
    {
        key: 'decklist',
        question:
            "Welcome to DeckTuner! Let's get started. First, paste a link to your deck in the message box below using one of the following approved deck builder sites:",
        details: {
            title: '\u200b',
            body: settings
                .approved_sites()
                .map((x) => `${x.emoji} [${x.site_name}](${x.base_url})`)
                .join('\n'),
        },
    },
    {
        question:
            "Perfect, now tell me who is commanding your deck.\nSeparate each commander's name with a plus sign (+) if you have partners. Please check your spelling if I can't find your commander. Keep in mind that new cards may not be in my database yet. You may need to try again in a few days.",
        key: 'commander',
    },
    {
        question: `Ok, now lets choose what kind of multiplayer experience you want this deck to create. On a scale of 1-10, with 1 being *I don't care who wins, I just want to have fun playing thematic cards* and 10 being *I want to win at all costs, regardless if anyone is having fun*, what number are you trying to get to?`,
        key: 'desired_experience',
    },
    {
        question: [
            `Got it. Now set your budget for **changes and upgrades**. If you have a **per card** spending limit, you can add that after the changes budget and separate them with “/”.`,
            `*Please convert all currency to USD*.`,
            `**Example:**`,
            '```$50/$10```',
            `If your entire deck needs to stay under a total budget, be sure to mention that in the question about tuning goals later. If you're a supreme being with no financial restrictions just say **"No budget"**.`,
        ].join('\n'),
        key: 'budget',
    },
    {
        question: `Now, in a few sentences, describe how you want this deck to work. For example: *What's the overall strategy? How does it use the commander? How do you want to win games?*`,
        key: 'deck_goals',
    },
    {
        question: `Sounds good. Now tell me what you'd like a tuner to help you with. What are the main issues you're having? For example: *Does it feel too slow or underpowered? Does it run out of steam or have trouble closing out games?*`,
        key: 'tuning_goals',
    },
    {
        question: `Tuning a deck can take a lot of time and effort. How much would you be willing to tip your tuner if they do a great job? \n*Tipping is not required, but it may help attract a tuner to your workshop if you offer a tip.*
        \n*Our tuners use trusted payment services for their tip jars and will provide a link upon tuning completion. 100% of your tip will go to your tuner.*` ,
        key: 'tip_amount',
    },
];
