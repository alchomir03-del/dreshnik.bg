// ============================================================
// DRESHNIK.bg — Legal texts (Privacy Policy + Terms of Service)
// Structured as arrays of sections for rendering in LegalPage
// ============================================================

export function getPrivacyPolicy(lang) {
  return lang === "en" ? PRIVACY_EN : PRIVACY_BG;
}

export function getTermsOfService(lang) {
  return lang === "en" ? TERMS_EN : TERMS_BG;
}

// ============================================================
// ПОЛИТИКА ЗА ПОВЕРИТЕЛНОСТ (BG)
// ============================================================
const PRIVACY_BG = {
  title: "Политика за поверителност",
  lastUpdated: "Последна актуализация: 1 март 2026 г.",
  sections: [
    {
      heading: "1. Какви данни събираме",
      paragraphs: [
        "Когато използваш DRESHNIK.bg, събираме следните данни:",
        "• Имейл адрес и име — при регистрация с имейл или Google акаунт.",
        "• Профилна снимка — ако я качиш или използваш Google акаунт.",
        "• Данни за гардероб — описания, снимки на дрехи, категории, стилове, цветове, марки, цени и тагове.",
        "• Запазени визии — комбинации от дрехи, които си запазил/а.",
        "• Календар на носенията — дати, на които си отбелязал/а носени дрехи.",
        "• Настройки — предпочитан език, тема (тъмна/светла), валута, размери.",
        "• Камера — ако дадеш разрешение, приложението използва камерата на устройството ти за снимане на дрехи. Видеопотокът се обработва изцяло локално на устройството ти и НЕ се изпраща на сървър.",
        "• Геолокация — ако дадеш разрешение, използваме GPS координатите ти за извличане на данни за времето от Open-Meteo и за определяне на града чрез OpenStreetMap Nominatim.",
      ],
    },
    {
      heading: "2. Как съхраняваме данните",
      paragraphs: [
        "Данните ти се съхраняват в Google Firebase — облачна платформа, управлявана от Google LLC.",
        "Използваме следните Firebase услуги:",
        "• Firebase Authentication — за сигурно влизане в акаунта.",
        "• Cloud Firestore — за съхранение на профил, настройки, артикули и визии.",
        "• Firebase Storage — за съхранение на снимки на дрехи и профилна снимка.",
        "Данните се съхраняват на сървъри на Google в Европейския съюз и/или САЩ, в съответствие с условията за защита на данни на Google Cloud.",
      ],
    },
    {
      heading: "3. Снимки на дрехи",
      paragraphs: [
        "Снимките, които качваш, се компресират до максимум 1000×1000 пиксела в JPEG формат с цел оптимизация на размера.",
        "При качване на снимка, приложението автоматично премахва фона с помощта на библиотеката @imgly/background-removal. Тази обработка се извършва изцяло на твоето устройство (client-side) — снимките НЕ се изпращат към външни сървъри за обработка. Библиотеката изтегля ML модел (~40 MB) от CDN на IMG.LY (staticimgly.com), който се кешира в браузъра за следващи употреби.",
        "Снимките се съхраняват в Firebase Storage и са достъпни само за теб чрез твоя акаунт.",
        "НЕ използваме снимките ти за рекламни, маркетингови или други цели извън предоставяне на услугата.",
        "При изтриване на артикул или акаунт, снимките се изтриват безвъзвратно от сървърите.",
      ],
    },
    {
      heading: "4. Твоите права (GDPR)",
      paragraphs: [
        "Съгласно Общия регламент за защита на данните (GDPR), имаш следните права:",
        "• Право на достъп — можеш да видиш всички свои данни в приложението.",
        "• Право на преносимост — можеш да експортираш данните си като JSON файл от раздел Профил.",
        "• Право на изтриване — можеш да изтриеш акаунта си и ВСИЧКИ свързани данни чрез бутона 'Изтрий акаунт' в Профил.",
        "• Право на оттегляне на съгласие — можеш по всяко време да изтриеш акаунта си.",
        "При изтриване на акаунт се изтриват: профилните данни, всички артикули и снимки, запазени визии, календар и настройки.",
      ],
    },
    {
      heading: "5. Бисквитки и локално съхранение",
      paragraphs: [
        "DRESHNIK.bg НЕ използва бисквитки за проследяване или реклама.",
        "Използваме localStorage на браузъра за съхранение на тема, артикули от гардероба, визии, календар и настройки, когато не си влязъл/а в акаунт. Тези данни остават само на твоето устройство.",
        "Firebase Authentication използва IndexedDB за поддържане на сесия. Това е строго необходимо за работата на приложението и не изисква отделно съгласие.",
      ],
    },
    {
      heading: "6. Трети страни",
      paragraphs: [
        "DRESHNIK.bg използва следните външни услуги:",
        "• Google Firebase — съхранение на данни, автентикация и хостинг на файлове.",
        "• Google Fonts — зареждане на шрифтове (Playfair Display, Syne, JetBrains Mono).",
        "• Open-Meteo — данни за времето. Заявките съдържат GPS координати за определяне на местната прогноза.",
        "• OpenStreetMap Nominatim — обратно геокодиране за определяне на името на града по GPS координати. Заявките не съдържат лични идентификатори.",
        "• IMG.LY (staticimgly.com) — CDN за изтегляне на ML модел за премахване на фон. Не се изпращат снимки или лични данни.",
        "• Vercel — хостинг на уебсайта.",
        "Не продаваме, не отдаваме и не споделяме личните ти данни с трети страни за маркетингови цели.",
      ],
    },
    {
      heading: "7. Сигурност",
      paragraphs: [
        "Предприемаме подходящи мерки за защита на данните ти:",
        "• Комуникацията е криптирана чрез HTTPS/TLS.",
        "• Firebase правилата за достъп ограничават данните само до собственика на акаунта.",
        "• Паролите се хешират от Firebase Authentication и не се съхраняват в чист текст.",
      ],
    },
    {
      heading: "8. Контакт",
      paragraphs: [
        "За въпроси относно поверителност и лични данни, свържи се с нас на:",
        "✉ info@dreshnik.bg",
      ],
    },
  ],
};

// ============================================================
// PRIVACY POLICY (EN)
// ============================================================
const PRIVACY_EN = {
  title: "Privacy Policy",
  lastUpdated: "Last updated: March 1, 2026",
  sections: [
    {
      heading: "1. What Data We Collect",
      paragraphs: [
        "When you use DRESHNIK.bg, we collect the following data:",
        "• Email address and name — upon registration via email or Google account.",
        "• Profile photo — if you upload one or sign in with Google.",
        "• Wardrobe data — descriptions, photos of clothing items, categories, styles, colors, brands, prices, and tags.",
        "• Saved outfits — clothing combinations you have saved.",
        "• Wear calendar — dates when you marked items as worn.",
        "• Settings — preferred language, theme (dark/light), currency, sizes.",
        "• Camera — if you grant permission, the app uses your device camera to photograph clothing items. The video stream is processed entirely on your device and is NOT sent to any server.",
        "• Geolocation — if you grant permission, we use your GPS coordinates to retrieve weather data from Open-Meteo and to determine your city via OpenStreetMap Nominatim.",
      ],
    },
    {
      heading: "2. How We Store Data",
      paragraphs: [
        "Your data is stored in Google Firebase — a cloud platform managed by Google LLC.",
        "We use the following Firebase services:",
        "• Firebase Authentication — for secure account access.",
        "• Cloud Firestore — for storing profile, settings, items, and outfits.",
        "• Firebase Storage — for storing clothing photos and profile pictures.",
        "Data is stored on Google servers in the European Union and/or the United States, in accordance with Google Cloud data protection terms.",
      ],
    },
    {
      heading: "3. Clothing Photos",
      paragraphs: [
        "Photos you upload are compressed to a maximum of 1000×1000 pixels in JPEG format for size optimization.",
        "When you upload a photo, the app automatically removes the background using the @imgly/background-removal library. This processing happens entirely on your device (client-side) — photos are NOT sent to external servers for processing. The library downloads an ML model (~40 MB) from IMG.LY's CDN (staticimgly.com), which is cached in your browser for future use.",
        "Photos are stored in Firebase Storage and are accessible only to you through your account.",
        "We do NOT use your photos for advertising, marketing, or any purposes beyond providing the service.",
        "When you delete an item or your account, photos are permanently deleted from the servers.",
      ],
    },
    {
      heading: "4. Your Rights (GDPR)",
      paragraphs: [
        "Under the General Data Protection Regulation (GDPR), you have the following rights:",
        "• Right of access — you can view all your data within the application.",
        "• Right to data portability — you can export your data as a JSON file from the Profile section.",
        "• Right to erasure — you can delete your account and ALL associated data via the \"Delete account\" button in Profile.",
        "• Right to withdraw consent — you can delete your account at any time.",
        "Account deletion removes: profile data, all items and photos, saved outfits, calendar, and settings.",
      ],
    },
    {
      heading: "5. Cookies and Local Storage",
      paragraphs: [
        "DRESHNIK.bg does NOT use tracking or advertising cookies.",
        "We use browser localStorage for storing theme, wardrobe items, outfits, calendar, and settings when you are not logged in. This data remains only on your device.",
        "Firebase Authentication uses IndexedDB for session persistence. This is strictly necessary for the application to function and does not require separate consent.",
      ],
    },
    {
      heading: "6. Third Parties",
      paragraphs: [
        "DRESHNIK.bg uses the following external services:",
        "• Google Firebase — data storage, authentication, and file hosting.",
        "• Google Fonts — font loading (Playfair Display, Syne, JetBrains Mono).",
        "• Open-Meteo — weather data. Requests contain GPS coordinates to determine local weather.",
        "• OpenStreetMap Nominatim — reverse geocoding to determine city name from GPS coordinates. Requests contain no personal identifiers.",
        "• IMG.LY (staticimgly.com) — CDN for downloading the ML model for background removal. No photos or personal data are sent.",
        "• Vercel — website hosting.",
        "We do not sell, rent, or share your personal data with third parties for marketing purposes.",
      ],
    },
    {
      heading: "7. Security",
      paragraphs: [
        "We take appropriate measures to protect your data:",
        "• Communication is encrypted via HTTPS/TLS.",
        "• Firebase access rules restrict data to the account owner only.",
        "• Passwords are hashed by Firebase Authentication and are never stored in plain text.",
      ],
    },
    {
      heading: "8. Contact",
      paragraphs: [
        "For questions about privacy and personal data, contact us at:",
        "✉ info@dreshnik.bg",
      ],
    },
  ],
};

// ============================================================
// ОБЩИ УСЛОВИЯ (BG)
// ============================================================
const TERMS_BG = {
  title: "Общи условия за ползване",
  lastUpdated: "Последна актуализация: 1 март 2026 г.",
  sections: [
    {
      heading: "1. Общи положения",
      paragraphs: [
        "Настоящите Общи условия уреждат отношенията между DRESHNIK.bg (\"Услугата\") и потребителите (\"Потребител\", \"ти\").",
        "С регистрацията или използването на DRESHNIK.bg, ти приемаш настоящите условия.",
        "DRESHNIK.bg е безплатно уеб приложение за каталогизиране на лични дрехи и генериране на визии (комбинации от дрехи).",
      ],
    },
    {
      heading: "2. Регистрация и акаунт",
      paragraphs: [
        "За да използваш пълните функции на приложението, е необходимо да създадеш акаунт чрез имейл или Google профил.",
        "Ти си отговорен/на за сигурността на своя акаунт и парола.",
        "Ако забележиш неоторизиран достъп, свържи се с нас незабавно на info@dreshnik.bg.",
        "Един потребител може да има само един акаунт.",
      ],
    },
    {
      heading: "3. Допустимо използване",
      paragraphs: [
        "DRESHNIK.bg е предназначен за лична употреба — каталогизиране на собствен гардероб.",
        "Забранено е:",
        "• Качването на съдържание, което нарушава авторски права или е незаконно.",
        "• Използването на услугата за комерсиални цели без разрешение.",
        "• Опити за неоторизиран достъп до данните на други потребители.",
        "• Злоупотреба с услугата чрез автоматизирани заявки или атаки.",
      ],
    },
    {
      heading: "4. Съдържание на потребителя",
      paragraphs: [
        "Всички данни, които качваш (снимки, описания, настройки), остават твоя собственост.",
        "С качването на съдържание, ни предоставяш ограничено право да го съхраняваме и обработваме единствено за целите на предоставяне на услугата.",
        "Можеш по всяко време да изтриеш съдържанието си или целия си акаунт.",
      ],
    },
    {
      heading: "5. Интелектуална собственост",
      paragraphs: [
        "Дизайнът, кодът, логото и марката DRESHNIK.bg са собственост на създателите на услугата.",
        "Нямаш право да копираш, модифицираш или разпространяваш части от приложението без изрично разрешение.",
      ],
    },
    {
      heading: "6. Ограничение на отговорността",
      paragraphs: [
        "DRESHNIK.bg се предоставя 'такъв какъвто е' (as is), без гаранции за непрекъсваемост или безгрешност.",
        "Не носим отговорност за:",
        "• Загуба на данни вследствие на технически проблеми извън наш контрол.",
        "• Модни съвети, генерирани от алгоритъма — те са насочващи и не представляват професионална консултация.",
        "• Щети, произтичащи от неоторизиран достъп до акаунта ти по твоя вина.",
        "Препоръчваме периодичен експорт на данните от раздел Профил.",
      ],
    },
    {
      heading: "7. Прекратяване",
      paragraphs: [
        "Можеш да прекратиш използването на услугата по всяко време, като изтриеш акаунта си.",
        "Запазваме си правото да прекратим или ограничим достъпа на потребители, които нарушават настоящите условия.",
      ],
    },
    {
      heading: "8. Промени в условията",
      paragraphs: [
        "Запазваме си правото да актуализираме тези условия. При съществени промени ще те уведомим чрез приложението.",
        "Продължаването на използването след промяна означава приемане на новите условия.",
      ],
    },
    {
      heading: "9. Приложимо право",
      paragraphs: [
        "Настоящите условия се уреждат от законодателството на Република България.",
        "Всички спорове се решават от компетентния български съд.",
      ],
    },
    {
      heading: "10. Контакт",
      paragraphs: [
        "За въпроси относно условията за ползване:",
        "✉ info@dreshnik.bg",
      ],
    },
  ],
};

// ============================================================
// TERMS OF SERVICE (EN)
// ============================================================
const TERMS_EN = {
  title: "Terms of Service",
  lastUpdated: "Last updated: March 1, 2026",
  sections: [
    {
      heading: "1. General",
      paragraphs: [
        "These Terms of Service govern the relationship between DRESHNIK.bg (the \"Service\") and users (\"User\", \"you\").",
        "By registering or using DRESHNIK.bg, you accept these terms.",
        "DRESHNIK.bg is a free web application for cataloging personal clothing and generating outfit combinations.",
      ],
    },
    {
      heading: "2. Registration and Account",
      paragraphs: [
        "To use the full features of the application, you must create an account via email or Google.",
        "You are responsible for the security of your account and password.",
        "If you notice unauthorized access, contact us immediately at info@dreshnik.bg.",
        "Each user may have only one account.",
      ],
    },
    {
      heading: "3. Acceptable Use",
      paragraphs: [
        "DRESHNIK.bg is intended for personal use — cataloging your own wardrobe.",
        "The following is prohibited:",
        "• Uploading content that infringes copyrights or is illegal.",
        "• Using the service for commercial purposes without permission.",
        "• Attempting unauthorized access to other users' data.",
        "• Abusing the service through automated requests or attacks.",
      ],
    },
    {
      heading: "4. User Content",
      paragraphs: [
        "All data you upload (photos, descriptions, settings) remains your property.",
        "By uploading content, you grant us a limited right to store and process it solely for the purpose of providing the service.",
        "You may delete your content or your entire account at any time.",
      ],
    },
    {
      heading: "5. Intellectual Property",
      paragraphs: [
        "The design, code, logo, and DRESHNIK.bg brand are the property of the service creators.",
        "You may not copy, modify, or distribute parts of the application without explicit permission.",
      ],
    },
    {
      heading: "6. Limitation of Liability",
      paragraphs: [
        "DRESHNIK.bg is provided \"as is\", without guarantees of uninterrupted or error-free operation.",
        "We are not liable for:",
        "• Data loss due to technical issues beyond our control.",
        "• Fashion advice generated by the algorithm — these are suggestive and do not constitute professional consultation.",
        "• Damages resulting from unauthorized access to your account due to your negligence.",
        "We recommend periodic data export from the Profile section.",
      ],
    },
    {
      heading: "7. Termination",
      paragraphs: [
        "You may stop using the service at any time by deleting your account.",
        "We reserve the right to terminate or restrict access for users who violate these terms.",
      ],
    },
    {
      heading: "8. Changes to Terms",
      paragraphs: [
        "We reserve the right to update these terms. For significant changes, we will notify you through the application.",
        "Continued use after changes constitutes acceptance of the new terms.",
      ],
    },
    {
      heading: "9. Governing Law",
      paragraphs: [
        "These terms are governed by the laws of the Republic of Bulgaria.",
        "All disputes shall be resolved by the competent Bulgarian court.",
      ],
    },
    {
      heading: "10. Contact",
      paragraphs: [
        "For questions about the terms of service:",
        "✉ info@dreshnik.bg",
      ],
    },
  ],
};
