export type PublicMediaData = {
    kind: "image";
    url: string;
    width: number;
    height: number;
    alt: string;
    focus: {
        x: number;
        y: number;
    };
    sources: Array<{
        url: string;
        width: number;
    }>;
} | {
    kind: "video";
    url: string;
    width: number;
    height: number;
    alt: string;
    focus: {
        x: number;
        y: number;
    };
    poster: string;
    durationSeconds: number;
};
export type PublicContentData = {
    contractVersion: 1;
    publicationId: string;
    restaurant: {
        key: string;
        name: string;
        currency: string;
        timezone: string;
    };
    capabilities: {
        catalog: boolean;
        images: boolean;
        video: boolean;
        tags: boolean;
        maxDishMedia: number;
    };
    menus: Array<{
        id: string;
        name: string;
        position: number;
        mode: "per_item" | "fixed";
        basePriceCents: number | null;
        sections: Array<{
            id: string;
            name: string;
            position: number;
            dishes: Array<{
                id: string;
                name: string;
                description: string;
                position: number;
                price: ({
                    mode: "amount" | "supplement";
                    cents: number;
                } | {
                    mode: "included" | "on_request";
                }) | null;
                variants: Array<{
                    id: string;
                    name: string;
                    position: number;
                    price: ({
                        mode: "amount" | "supplement";
                        cents: number;
                    } | {
                        mode: "included" | "on_request";
                    });
                }>;
                media: PublicMediaData[];
                tags: Array<{
                    id: string;
                    label: string;
                    semanticKey: string | null;
                    category: "dietary" | "descriptor" | "allergen";
                    assertion: string;
                }>;
                availability: {
                    available: boolean;
                    returnsAt: string | null;
                };
            }>;
        }>;
        /** Desde a fatia B; ausentes em publicação anterior. `null` é "publicado sem valor". */
        key?: string;
        shortName?: string | null;
        schedule?: string | null;
        note?: string | null;
        observation?: string | null;
        priceNote?: string | null;
        hero?: PublicMediaData | null;
    }>;
    fields: Record<string, string | boolean | null | PublicMediaData | PublicMediaData[]>;
    branding: Record<string, string | boolean | null | PublicMediaData | PublicMediaData[]>;
    /** Ao vivo, no fuso da casa; ausente em publicação antiga. */
    house?: PublicHouseData;
    /** Contato, endereço e links da casa, ao vivo (SDK 0.4.0); ausente em Engine anterior. */
    profile?: PublicHouseProfileData;
};
export type PublicHouseProfileData = {
    /** Telefones em E.164 (+55…). Instagram é o nome do perfil, sem @. */
    contact: {
        whatsapp: string | null;
        phone: string | null;
        email: string | null;
        instagram: string | null;
    };
    address: {
        street: string | null;
        complement: string | null;
        district: string | null;
        city: string | null;
        state: string | null;
        postalCode: string | null;
        mapUrl: string | null;
        latitude: number | null;
        longitude: number | null;
    };
    /** Botões da página da casa, em ordem. "Menu" e "Reservar" vêm de `modules`, não daqui. */
    links: Array<{
        label: string;
        url: string;
    }>;
};
/** Entrega da casa: não depende do cardápio estar ligado ou publicado. */
export type PublicHouseDeliveryData = {
    contractVersion: 1;
    restaurant: {
        key: string;
        name: string;
        timezone: string;
    };
    house: PublicHouseData;
    profile: PublicHouseProfileData;
    modules: {
        menu: "published" | "paused" | "empty";
        reservations: boolean;
    };
};
export type PublicHouseHoursData = {
    weekday: number;
    opensAt: string;
    closesAt: string;
    label: string | null;
};
export type PublicHouseData = {
    timezone: string;
    generatedAt: string;
    today: {
        date: string;
        weekday: number;
        closed: boolean;
    };
    schedules: Array<{
        key: string;
        name: string;
        position: number;
        hours: PublicHouseHoursData[];
    }>;
    closures: Array<{
        date: string;
        publicNote: string | null;
    }>;
};
export type PublicReservationConfigData = {
    enabled: boolean;
    confirmationMode: "automatic" | "manual";
    arrivalTimes: string[];
    emailEnabled: boolean;
    blockedDates: string[];
    closures?: Array<{
        date: string;
        publicNote: string | null;
    }>;
    timezone: string;
    bookingHorizonDays: number;
    minNoticeMinutes: number;
    slotMinutes: number;
    maxPartySize: number;
    windows: Array<{
        weekday: number;
        opensAt: string;
        closesAt: string;
    }>;
};
/** Chave estável do cardápio: `menu.key` ou, em publicação anterior que não a traz, a regra legada do backfill. */
export declare function menuKey(menu: {
    key?: string;
    name: string;
}): string;
export declare class RestaurantsPublicError extends Error {
    readonly status: number;
    constructor(message: string, status: number);
}
export type PublicDeliveryResult = {
    state: "published" | "empty" | "paused" | "suspended";
    content: PublicContentData | null;
};
export declare function fetchPublicContent(input: {
    apiBaseUrl: string;
    restaurantKey: string;
    signal?: AbortSignal;
}): Promise<PublicDeliveryResult>;
/** Dados da casa (horário, contato, endereço, links e módulos), sem o cardápio. */
export declare function fetchPublicHouse(input: {
    apiBaseUrl: string;
    restaurantKey: string;
    signal?: AbortSignal;
}): Promise<PublicHouseDeliveryData>;
/** Link do WhatsApp para um telefone E.164 da entrega, com texto opcional. */
export declare function whatsappUrl(phone: string, text?: string): string;
/** Link do perfil do Instagram a partir do nome guardado. */
export declare function instagramUrl(handle: string): string;
export declare function exchangePreview(input: {
    apiBaseUrl: string;
    token: string;
    signal?: AbortSignal;
}): Promise<PublicContentData>;
export declare function formatPrice(cents: number, currency: string, locale?: string): string;
export declare function mediaSrcSet(media: {
    kind: "image" | "video";
    sources?: Array<{
        url: string;
        width: number;
    }>;
}): string;
export type HouseStatus = {
    state: "open" | "closed";
    scheduleKey: string | null;
    /** HH:MM em que fecha, quando está aberta. */
    closesAt: string | null;
    /** HH:MM em que abre a próxima faixa. */
    opensAt: string | null;
    /** Data (AAAA-MM-DD) da próxima abertura; null além de 60 dias. */
    opensOn: string | null;
    /** Frase pública do dia fechado, quando houver. */
    publicNote: string | null;
};
/** Relógio de parede de um instante em um fuso (nunca o fuso do aparelho). */
export declare function wallClock(now: Date, timeZone: string): {
    date: string;
    weekday: number;
    minutes: number;
};
/**
 * Aberto ou fechado agora, pelo horário da casa e no fuso da casa. Pura, sem rede.
 * Uma faixa com `closesAt < opensAt` cobre [opensAt, 24:00) do dia e [00:00, closesAt) do seguinte.
 * Dia em `closures` fica fechado o dia inteiro, madrugada incluída.
 */
export declare function houseStatus(house: PublicHouseData | undefined | null, now?: Date, scheduleKey?: string): HouseStatus;
export * from "./blog.js";
export * from "./products.js";
export * from "./orders.js";
