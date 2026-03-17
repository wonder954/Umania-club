export const toRegistUrl = (url: string) =>
    url.replace("/race/denma/", "/race/regist/");

export const toDenmaUrl = (url: string) =>
    url.includes("/race/denma/")
        ? url
        : url.replace("/race/index/", "/race/denma/");

export const toResultUrl = (url: string) =>
    url.replace("/race/denma/", "/race/result/");