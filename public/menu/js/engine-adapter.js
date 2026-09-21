import {
  exchangePreview,
  fetchPublicContent
} from './vendor/capilano-restaurants-public-sdk-0.1.0.js';

const config = window.CAPILANO_ENGINE;

function localAsset(path) {
  return typeof path === 'string' && path.indexOf('assets/') === 0 ? './' + path : path;
}

window.BISTRO.casa.logo = localAsset(window.BISTRO.casa.logo);
window.BISTRO.casa.logoNome = localAsset(window.BISTRO.casa.logoNome);
window.BISTRO.casa.capa.src = localAsset(window.BISTRO.casa.capa.src);
window.BISTRO.casa.ambiente.forEach(function (photo) {
  photo.src = localAsset(photo.src);
});

function slug(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function fieldPrefix(menu) {
  const normalized = slug(menu.name);
  if (normalized.includes('vinho')) return 'menus.vinhos';
  if (normalized.includes('almoco') || normalized.includes('executivo')) return 'menus.executivo';
  if (normalized.includes('jantar')) return 'menus.jantar';
  return 'menus.' + normalized;
}

function mediaPhoto(media) {
  if (!media) return null;
  if (media.kind === 'video') {
    return {
      src: media.poster,
      video: media.url,
      alt: media.alt,
      foco: Math.round(media.focus.x * 100) + '% ' + Math.round(media.focus.y * 100) + '%'
    };
  }
  return {
    src: media.url,
    alt: media.alt,
    foco: Math.round(media.focus.x * 100) + '% ' + Math.round(media.focus.y * 100) + '%'
  };
}

function itemFromDish(dish, currency) {
  const photos = dish.media.map(mediaPhoto).filter(Boolean);
  const first = photos.shift();
  const item = {
    id: dish.id,
    nome: dish.name,
    descricao: dish.description,
    origem: 'engine',
    indisponivel: !dish.availability.available,
    tags: dish.tags
  };
  if (first) {
    item.foto = first.src;
    item.foco = first.foco;
    item.fotoAlt = first.alt;
    item.outrasFotos = photos.map(function (photo) {
      return { src: photo.src, alt: photo.alt };
    });
  }
  if (dish.variants.length) {
    item.precos = dish.variants.map(function (variant) {
      return {
        rotulo: variant.name,
        valor: 'cents' in variant.price ? variant.price.cents / 100 : null,
        modo: variant.price.mode,
        moeda: currency
      };
    });
  } else if (dish.price) {
    if (dish.price.mode === 'supplement') item.suplemento = dish.price.cents / 100;
    else if (dish.price.mode === 'amount') item.precos = [{ valor: dish.price.cents / 100, moeda: currency }];
    else item.precoModo = dish.price.mode;
  }
  return item;
}

function serviceFromMenu(menu, content) {
  const prefix = fieldPrefix(menu);
  const fields = content.fields || {};
  const hero = mediaPhoto(fields[prefix + '.hero']);
  const service = {
    id: slug(menu.name),
    engineId: menu.id,
    nome: menu.name,
    curto: fields[prefix + '.short'] || menu.name,
    quando: fields[prefix + '.schedule'] || '',
    nota: fields[prefix + '.note'] || '',
    observacao: fields[prefix + '.observation'] || '',
    tipo: menu.mode === 'fixed' ? 'fixo' : 'carta',
    preco: menu.basePriceCents == null ? null : menu.basePriceCents / 100,
    precoNota: fields[prefix + '.price_note'] || 'por pessoa',
    foto: hero,
    foraDasAbas: prefix.endsWith('.vinhos'),
    categorias: menu.sections.map(function (section) {
      return {
        id: slug(section.name) + '-' + section.id.slice(0, 8),
        nome: section.name,
        itens: section.dishes.map(function (dish) {
          return itemFromDish(dish, content.restaurant.currency);
        })
      };
    })
  };
  if (!service.foto) {
    for (const section of service.categorias) {
      const item = section.itens.find(function (candidate) { return candidate.foto; });
      if (item) {
        service.foto = { src: item.foto, alt: item.fotoAlt, foco: item.foco };
        break;
      }
    }
  }
  return service;
}

async function loadContent() {
  const preview = /^#preview=([A-Za-z0-9_-]+)$/.exec(window.location.hash);
  if (preview) {
    const content = await exchangePreview({ apiBaseUrl: config.apiBaseUrl, token: preview[1] });
    history.replaceState(null, '', window.location.pathname + window.location.search + '#/cardapio');
    return content;
  }
  const delivery = await fetchPublicContent({
    ...config,
    apiBaseUrl: config.publicApiBaseUrl ?? config.apiBaseUrl
  });
  if (delivery.state !== 'published' || !delivery.content) {
    throw new Error(
      delivery.state === 'suspended'
        ? 'Este cardápio está temporariamente indisponível.'
        : delivery.state === 'paused'
          ? 'O cardápio está pausado no momento.'
          : 'O cardápio ainda não foi publicado.'
    );
  }
  return delivery.content;
}

try {
  const content = await loadContent();
  const homeHero = mediaPhoto((content.fields || {})['home.hero']);
  if (homeHero) {
    window.BISTRO.casa.capa = {
      src: homeHero.src,
      alt: homeHero.alt,
      foco: homeHero.foco
    };
  }
  window.BISTRO.servicos = content.menus.map(function (menu) {
    return serviceFromMenu(menu, content);
  });
  window.BISTRO.integracaoEngine = true;
  window.BISTRO.publicationId = content.publicationId;
  window.BISTRO.engineRestaurant = content.restaurant;
} catch (error) {
  window.BISTRO.servicos = [];
  window.BISTRO.integracaoEngine = true;
  window.BISTRO_ENGINE_ERROR = error instanceof Error ? error.message : 'Não foi possível carregar o cardápio.';
}

await import('./app.js');
