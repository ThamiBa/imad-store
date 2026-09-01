import { getRequestConfig } from "next-intl/server";

const locales = ["fr", "ar", "en"];

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Fallback to default locale if not found
    if (!locale || !locales.includes(locale)) {
        locale = "fr";
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    };
});
