export class RestaurantsPublicError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
async function readJson(response) {
    const body = await response.json().catch(() => null);
    if (!response.ok)
        throw new RestaurantsPublicError(body?.error?.message ?? "Não foi possível carregar o cardápio.", response.status);
    return body;
}
function delivery(body) {
    if (!body || typeof body !== "object")
        throw new RestaurantsPublicError("Resposta pública inválida.", 502);
    const value = body;
    if (!["published", "empty", "paused", "suspended"].includes(value.state))
        throw new RestaurantsPublicError("Estado público inválido.", 502);
    return value;
}
export async function fetchPublicContent(input) {
    const base = input.apiBaseUrl.replace(/\/$/, "");
    const response = await fetch(`${base}/api/v1/public/restaurants/${encodeURIComponent(input.restaurantKey)}`, { headers: { accept: "application/json" }, signal: input.signal });
    const body = await readJson(response);
    return delivery(body.data);
}
export async function exchangePreview(input) {
    const base = input.apiBaseUrl.replace(/\/$/, "");
    const response = await fetch(`${base}/api/v1/public/preview/exchange`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ token: input.token }),
        signal: input.signal,
    });
    return (await readJson(response)).data;
}
export function formatPrice(cents, currency, locale = "pt-BR") {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
    }).format(cents / 100);
}
export function mediaSrcSet(media) {
    if (media.kind !== "image")
        return "";
    return (media.sources ?? [])
        .map((source) => `${source.url} ${source.width}w`)
        .join(", ");
}
const minutesOf = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
const shiftDate = (date, days) => {
    const value = new Date(`${date}T00:00:00Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
};
const weekdayOf = (date) => new Date(`${date}T00:00:00Z`).getUTCDay();
/** Relógio de parede de um instante em um fuso (nunca o fuso do aparelho). */
export function wallClock(now, timeZone) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
        .formatToParts(now).map((part) => [part.type, part.value]));
    const date = `${parts.year}-${parts.month}-${parts.day}`;
    return { date, weekday: weekdayOf(date), minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}
/**
 * Aberto ou fechado agora, pelo horário da casa e no fuso da casa. Pura, sem rede.
 * Uma faixa com `closesAt < opensAt` cobre [opensAt, 24:00) do dia e [00:00, closesAt) do seguinte.
 * Dia em `closures` fica fechado o dia inteiro, madrugada incluída.
 */
export function houseStatus(house, now = new Date(), scheduleKey) {
    const closed = (extra = {}) => ({ state: "closed", scheduleKey: null, closesAt: null, opensAt: null, opensOn: null, publicNote: null, ...extra });
    if (!house)
        return closed();
    const schedule = scheduleKey
        ? house.schedules.find((entry) => entry.key === scheduleKey)
        : [...house.schedules].sort((a, b) => a.position - b.position)[0];
    const clock = wallClock(now, house.timezone);
    const closure = (date) => house.closures.find((entry) => entry.date === date);
    const today = closure(clock.date);
    if (!schedule)
        return closed({ publicNote: today?.publicNote ?? null });
    const spans = (date) => {
        if (closure(date))
            return [];
        const previous = shiftDate(date, -1);
        const own = schedule.hours.filter((entry) => entry.weekday === weekdayOf(date)).map((entry) => ({
            from: minutesOf(entry.opensAt), to: minutesOf(entry.closesAt) > minutesOf(entry.opensAt) ? minutesOf(entry.closesAt) : 1440,
        }));
        const spill = closure(previous) ? [] : schedule.hours.filter((entry) => entry.weekday === weekdayOf(previous) && minutesOf(entry.closesAt) < minutesOf(entry.opensAt))
            .map((entry) => ({ from: 0, to: minutesOf(entry.closesAt) }));
        return [...spill, ...own].sort((a, b) => a.from - b.from);
    };
    const format = (value) => `${String(Math.floor((value % 1440) / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
    const current = spans(clock.date).find((span) => span.from <= clock.minutes && clock.minutes < span.to);
    if (current) {
        let end = current.to;
        // Faixa que vai até a meia-noite e continua amanhã fecha na hora de amanhã.
        if (end === 1440) {
            const next = spans(shiftDate(clock.date, 1)).find((span) => span.from === 0);
            if (next)
                end = 1440 + next.to;
        }
        return { state: "open", scheduleKey: schedule.key, closesAt: format(end), opensAt: null, opensOn: null, publicNote: null };
    }
    const later = spans(clock.date).find((span) => span.from > clock.minutes);
    if (later)
        return closed({ scheduleKey: schedule.key, opensAt: format(later.from), opensOn: clock.date, publicNote: today?.publicNote ?? null });
    for (let ahead = 1; ahead <= 60; ahead++) {
        const date = shiftDate(clock.date, ahead);
        const first = spans(date)[0];
        if (first)
            return closed({ scheduleKey: schedule.key, opensAt: format(first.from), opensOn: date, publicNote: today?.publicNote ?? null });
    }
    return closed({ scheduleKey: schedule.key, publicNote: today?.publicNote ?? null });
}
