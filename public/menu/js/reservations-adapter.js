(function () {
  'use strict';

  var config = window.CAPILANO_ENGINE || {};
  var base = String(config.reservationApiBaseUrl || config.apiBaseUrl || '').replace(/\/$/, '');
  var restaurantKey = String(config.restaurantKey || '');
  var resource = base + '/api/v1/public/restaurants/' + encodeURIComponent(restaurantKey) + '/reservations';

  function randomIdempotencyKey() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    var bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    var hex = Array.prototype.map.call(bytes, function (byte) { return byte.toString(16).padStart(2, '0'); }).join('');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
  }

  function randomManageToken() {
    var bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    var binary = '';
    bytes.forEach(function (byte) { binary += String.fromCharCode(byte); });
    return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function ApiError(message, status, code, details) {
    this.name = 'ReservationApiError';
    this.message = message;
    this.status = status;
    this.code = code || null;
    this.details = details || null;
  }
  ApiError.prototype = Object.create(Error.prototype);
  ApiError.prototype.constructor = ApiError;

  async function request(path, options) {
    if (!base || !restaurantKey) {
      throw new ApiError('As reservas ainda não foram configuradas.', 0, 'NOT_CONFIGURED');
    }

    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, 12000);
    var init = Object.assign({
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: { Accept: 'application/json' },
      signal: controller.signal
    }, options || {});

    if (init.body) {
      init.headers = Object.assign({}, init.headers, { 'Content-Type': 'application/json' });
    }

    try {
      var response = await fetch(resource + path, init);
      var payload = null;
      try { payload = await response.json(); } catch (_) { /* resposta vazia ou inválida */ }
      if (!response.ok) {
        var error = payload && payload.error ? payload.error : payload;
        throw new ApiError(
          error && error.message ? error.message : 'Não foi possível concluir a reserva.',
          response.status,
          error && error.code,
          error && error.details
        );
      }
      if (!payload || typeof payload !== 'object') {
        throw new ApiError('O serviço de reservas respondeu de forma inesperada.', response.status, 'INVALID_RESPONSE');
      }
      if (!Object.prototype.hasOwnProperty.call(payload, 'data')) {
        throw new ApiError('O serviço de reservas respondeu de forma inesperada.', response.status, 'INVALID_RESPONSE');
      }
      return payload.data;
    } catch (error) {
      if (error && error.name === 'AbortError') {
        throw new ApiError('O serviço demorou para responder. Tente novamente.', 0, 'TIMEOUT');
      }
      if (error instanceof ApiError) throw error;
      throw new ApiError('Não foi possível falar com o serviço de reservas.', 0, 'NETWORK_ERROR');
    } finally {
      window.clearTimeout(timer);
    }
  }

  window.BISTRO_RESERVATIONS = Object.freeze({
    randomIdempotencyKey: randomIdempotencyKey,
    randomManageToken: randomManageToken,
    config: function () { return request('/config'); },
    availability: function (date, partySize) {
      return request('/availability?date=' + encodeURIComponent(date) + '&partySize=' + encodeURIComponent(partySize));
    },
    availabilityForManagement: function (date, partySize, manageToken) {
      return request('/availability', {
        method: 'POST',
        body: JSON.stringify({ date: date, partySize: partySize, manageToken: manageToken })
      });
    },
    create: function (data) {
      return request('', { method: 'POST', body: JSON.stringify(data) });
    },
    manage: function (manageToken) {
      return request('/manage', { method: 'POST', body: JSON.stringify({ manageToken: manageToken }) });
    },
    cancel: function (manageToken, expectedRevision) {
      return request('/cancel', {
        method: 'POST',
        body: JSON.stringify({ manageToken: manageToken, expectedRevision: expectedRevision })
      });
    },
    reschedule: function (manageToken, expectedRevision, date, arrivalTime) {
      return request('/reschedule', {
        method: 'POST',
        body: JSON.stringify({
          manageToken: manageToken,
          expectedRevision: expectedRevision,
          date: date,
          arrivalTime: arrivalTime
        })
      });
    }
  });
})();
