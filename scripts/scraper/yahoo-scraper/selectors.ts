export const yahooSelectors = {
    weeklyUpcoming: {
        rows: ".hr-tableLeft__dataArea",
        title: ".hr-tableLeft__title",
        grade: ".hr-label",
        status: ".hr-tableLeft__status",
        link: ".hr-tableLeft__link",
    },

    weeklyPast: {
        section: ".hr-modCommon02",
        heading: "h3",
        rows: ".hr-tableLeft__data",
        link: "a",
        grade: ".hr-label",
    },

    entries: {
        table: ".hr-table",
        rows: "tbody tr",
        frame: ".hr-icon__bracketNum",
        number: ".hr-table__data--number",
        nameCell: ".hr-table__data--name",
        odds: ".hr-table__data--odds",
    },

    result: {
        rows: ".hr-table__row",
        number: ".hr-table__data--number",
        nameCell: ".hr-table__data--name",
        time: ".hr-table__data--time",
        odds: ".hr-table__data--odds",
        frame: ".hr-icon__bracketNum",

        payout: {
            section: ".hr-splits__item",
            rows: "tbody tr",
            type: "th",
            cells: "td",
        },

        courseStatus: ".hr-predictRaceInfo__status .hr-predictRaceInfo__text",
    },

    regist: {
        table: ".hr-table",
        rows: "tbody tr",
        horseCell: ".hr-table__data--horse",
        horseNameLink: "a",
    },
} as const;