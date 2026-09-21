export class RestaurantsPublicError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function readJson(response) {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new RestaurantsPublicError(
      body && body.error && body.error.message
        ? body.error.message
        : 'Não foi possível carregar o cardápio.',
      response.status
    );
  }
  return body;
}

export async function fetchPublicContent(config) {
  const base = config.apiBaseUrl.replace(/\/$/, '');
  const response = await fetch(
    base + '/api/v1/public/restaurants/' + encodeURIComponent(config.restaurantKey),
    { headers: { accept: 'application/json' }, signal: config.signal }
  );
  return (await readJson(response)).data;
}

export async function exchangePreview(config) {
  const base = config.apiBaseUrl.replace(/\/$/, '');
  const response = await fetch(base + '/api/v1/public/preview/exchange', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ token: config.token }),
    signal: config.signal
  });
  return (await readJson(response)).data;
}

export function formatPrice(cents, currency, locale) {
  return new Intl.NumberFormat(locale || 'pt-BR', {
    style: 'currency',
    currency: currency
  }).format(cents / 100);
}

export function mediaSrcSet(media) {
  if (media.kind !== 'image') return '';
  return (media.sources || []).map(function (source) {
    return source.url + ' ' + source.width + 'w';
  }).join(', ');
}
