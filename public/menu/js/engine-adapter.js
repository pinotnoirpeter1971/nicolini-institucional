import {
  exchangePreview,
  fetchPublicContent,
  houseStatus,
  menuKey,
  wallClock
} from './vendor/capilano-restaurants-public-sdk-0.3.0.js';

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

/*
 * Cada cardápio tem uma chave estável (`menu.key`), que não muda ao renomear.
 * Publicações antigas não trazem a chave nem os textos no cardápio: aí a chave sai
 * do nome (mesma regra do Engine) e os textos vêm dos campos `menus.<chave>.*`.
 * Quem decide é a presença do campo próprio no cardápio, nunca o valor: um texto
 * apagado no painel chega como `null` e não volta a ler o campo antigo.
 */
function pick(menu, fields, prefix, own, legacy) {
  return own in menu ? menu[own] : fields[prefix + '.' + legacy];
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
  const key = menuKey(menu);
  const prefix = 'menus.' + key;
  const fields = content.fields || {};
  const hero = mediaPhoto(pick(menu, fields, prefix, 'hero', 'hero'));
  const service = {
    /* `id` segue o nome (endereços que já circulam); `chave` acha o mesmo cardápio depois de renomear. */
    id: slug(menu.name),
    chave: key,
    engineId: menu.id,
    nome: menu.name,
    curto: pick(menu, fields, prefix, 'shortName', 'short') || menu.name,
    quando: pick(menu, fields, prefix, 'schedule', 'schedule') || '',
    nota: pick(menu, fields, prefix, 'note', 'note') || '',
    observacao: pick(menu, fields, prefix, 'observation', 'observation') || '',
    tipo: menu.mode === 'fixed' ? 'fixo' : 'carta',
    preco: menu.basePriceCents == null ? null : menu.basePriceCents / 100,
    precoNota: pick(menu, fields, prefix, 'priceNote', 'price_note') || 'por pessoa',
    foto: hero,
    foraDasAbas: key === 'vinhos',
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

/* === Página do site (manifesto `nicolini-site@2`) ===========================
 * Endereço, contatos e fotos da casa vêm do Engine quando publicados; sem valor
 * (ou numa publicação anterior ao @2), o site fica com o que está em `dados.js`. */
function text(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function phoneLink(value, prefix) {
  const digits = value.replace(/\D/g, '');
  return prefix + (digits.indexOf('55') === 0 && digits.length > 11 ? digits : '55' + digits);
}

function applyPage(fields) {
  const casa = window.BISTRO.casa;
  const endereco = text(fields['contato.endereco']);
  const cidade = text(fields['contato.cidade']);
  const telefone = text(fields['contato.telefone']);
  const whatsapp = text(fields['contato.whatsapp']);
  const instagram = text(fields['redes.instagram']);
  if (endereco) casa.endereco = endereco;
  if (cidade) casa.cidade = cidade;
  if (telefone) casa.telefone = { exibicao: telefone, link: phoneLink(telefone, 'tel:+') };
  if (whatsapp) casa.whatsapp = { exibicao: whatsapp, link: phoneLink(whatsapp, 'https://wa.me/') };
  if (instagram) {
    const handle = instagram.replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop();
    casa.instagram = { exibicao: handle ? '@' + handle.replace(/^@/, '') : instagram, link: instagram };
  }
  const galeria = Array.isArray(fields['casa.galeria']) ? fields['casa.galeria'].map(mediaPhoto).filter(Boolean) : [];
  if (galeria.length) casa.ambiente = galeria;
}

/* === Horário da casa (ao vivo, vem do Engine em `content.house`) ============ */

var DIAS_LONGOS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
var ORDEM = [1, 2, 3, 4, 5, 6, 0];

function hora(clock) {
  var parts = clock.split(':');
  return Number(parts[0]) + 'h' + (parts[1] === '00' ? '' : parts[1]);
}

function faixas(schedule, weekday) {
  return schedule.hours
    .filter(function (entry) { return entry.weekday === weekday; })
    .map(function (entry) { return hora(entry.opensAt) + '–' + hora(entry.closesAt); })
    .join(' · ');
}

/* Mesma forma de `casa.horarios` em dados.js: o resto do menu não muda. Dias vizinhos
 * com as mesmas faixas viram uma linha; os dias fechados vão para o fim. */
function horariosFromHouse(schedule) {
  var rows = [];
  ORDEM.forEach(function (weekday) {
    var texto = faixas(schedule, weekday);
    var last = rows[rows.length - 1];
    if (last && last.hora === (texto || 'Fechado')) {
      last.dias.push(weekday);
      return;
    }
    rows.push({ hora: texto || 'Fechado', dias: [weekday], fechado: !texto });
  });
  rows.forEach(function (row) {
    var first = DIAS_LONGOS[row.dias[0]];
    var lastName = DIAS_LONGOS[row.dias[row.dias.length - 1]];
    row.dia = row.dias.length === 1 ? first
      : row.dias.length === 2 ? first + ' e ' + lastName.toLowerCase()
      : first + ' a ' + lastName.toLowerCase();
  });
  return rows.filter(function (row) { return !row.fechado; })
    .concat(rows.filter(function (row) { return row.fechado; }));
}

function addDays(date, days) {
  var value = new Date(date + 'T00:00:00Z');
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

/* A frase da capa descreve o dia (não o instante): hoje aberto → "Hoje, 12h–15h · 19h–23h";
 * dia fechado → a frase pública que a casa escreveu, ou "Fechado hoje" e quando volta. */
function todayText(house, schedule) {
  var clock = wallClock(new Date(), house.timezone);
  var closure = function (date) {
    return house.closures.find(function (entry) { return entry.date === date; });
  };
  var today = closure(clock.date);
  var open = !today && faixas(schedule, clock.weekday);
  if (open) return 'Hoje, ' + open;
  if (today && today.publicNote) return today.publicNote;
  for (var ahead = 1; ahead <= 14; ahead++) {
    var date = addDays(clock.date, ahead);
    var weekday = new Date(date + 'T00:00:00Z').getUTCDay();
    var texto = !closure(date) && faixas(schedule, weekday);
    if (texto) {
      var quando = ahead === 1 ? 'amanhã' : DIAS_LONGOS[weekday].toLowerCase();
      return 'Fechado hoje. Retornamos ' + quando + ', às ' + texto.split('·')[0].split('–')[0].trim();
    }
  }
  return 'Fechado hoje';
}

function applyHouse(house) {
  var schedule = house.schedules.slice().sort(function (a, b) { return a.position - b.position; })[0];
  window.BISTRO.house = house;
  window.BISTRO.houseStatus = function () { return houseStatus(house, new Date()); };
  if (!schedule) return;
  window.BISTRO.casa.horarios = horariosFromHouse(schedule);
  window.BISTRO.casa.textoDeHoje = function () { return todayText(house, schedule); };
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
  applyPage(content.fields || {});
  if (content.house) applyHouse(content.house);
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
