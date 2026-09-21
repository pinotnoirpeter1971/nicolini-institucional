/*
 * Bistrô Nicolini — protótipo de cardápio e reservas.
 *
 * Sem build, sem dependências: script clássico, funciona abrindo o index.html
 * direto do disco ou servido por qualquer servidor estático.
 *
 * Organização: utilidades · ícones · estado · disponibilidade simulada ·
 * componentes · vistas · sobreposições · rotas.
 */
(function () {
  'use strict';

  var D = window.BISTRO;
  var raiz = document.getElementById('app');
  var avisos = document.getElementById('avisos');

  /* === Utilidades ======================================================== */

  function h(texto) {
    return String(texto == null ? '' : texto).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  function dinheiro(valor) {
    return 'R$ ' + valor.toLocaleString('pt-BR');
  }

  function anuncia(texto) {
    avisos.textContent = texto;
  }

  var DIAS_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  var MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var MESES = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  function chaveData(d) {
    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0')
    );
  }

  function dataDeChave(chave) {
    var p = chave.split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function dataPorExtenso(chave) {
    var d = dataDeChave(chave);
    return (
      DIAS_CURTOS[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()]
    );
  }

  /* Versao curta para os botoes de data alternativa, que precisam caber dois
   * por linha num celular estreito. */
  function dataCurta(chave) {
    var d = dataDeChave(chave);
    return DIAS_CURTOS[d.getDay()] + ', ' + d.getDate() + ' ' + MESES_CURTOS[d.getMonth()];
  }

  /* Hash estável a partir de uma string — o "sorteio" de disponibilidade
   * precisa dar sempre o mesmo resultado para a mesma data. */
  function semente(str) {
    var x = 2166136261;
    for (var i = 0; i < str.length; i++) {
      x ^= str.charCodeAt(i);
      x = (x * 16777619) >>> 0;
    }
    return x / 4294967295;
  }

  /* === Ícones ============================================================ */

  var ico = {
    busca: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>',
    fechar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    baixo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    relogio: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/></svg>',
    pino: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    fone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3.5l1.7 4.2-2.1 1.5a12.5 12.5 0 006.2 6.2l1.5-2.1L20 15.5V19a1.5 1.5 0 01-1.7 1.5A16 16 0 013.5 5.7 1.5 1.5 0 015 4z"/></svg>',
    zap: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.8 20.2l1.2-4a8.2 8.2 0 113.1 3l-4.3 1z"/><path d="M8.9 9.4c.3 2.4 2.6 4.6 5.1 5"/></svg>',
    insta: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.7"/><path d="M17.2 6.9h.01"/></svg>',
    voltar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    menos: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12h13"/></svg>',
    mais: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5.5v13M5.5 12h13"/></svg>',
    lupa: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/>' +
      '<path d="M19.5 19.5l-4.2-4.2M10.5 8v5M8 10.5h5"/></svg>'
  };

  /* `variante: 'nome'` devolve a marca reduzida. A altura vai no atributo para
   * a proporcao ficar reservada antes de o SVG chegar. */
  function marcaHtml(variante) {
    var reduzida = variante === 'nome';
    return (
      '<img class="marca' + (reduzida ? ' marca--nome' : '') + '" src="' +
      (reduzida ? D.casa.logoNome : D.casa.logo) +
      '" alt="Bistrô Nicolini" width="515" height="' +
      (reduzida ? '38' : '268') + '" />'
    );
  }

  /* === Estado ============================================================ */

  var servicoInicial = D.servicos[1] || D.servicos[0] || null;
  var estado = {
    /* `?mesa=12` liga o acesso pelo QR: entra direto no cardápio e a reserva
     * deixa de disputar a atenção. Não existe interruptor disso na interface. */
    mesa: null,
    servico: servicoInicial ? servicoInicial.id : null,
    /* Última carta que tem pastilha própria (almoço ou jantar). É para onde o
     * "Voltar ao cardápio" da carta de vinhos devolve a pessoa. */
    servicoBase: servicoInicial ? servicoInicial.id : null,
    vista: null, // assinatura da vista já desenhada, para não redesenhar à toa
    reserva: {
      /* Duas pessoas é a mesa mais comum e faz o calendário já dizer alguma
       * coisa na primeira tela. Não é uma resposta escondida: o controle de
       * pessoas fica à vista e editável o tempo todo. */
      pessoas: 2,
      data: null,
      hora: null,
      turno: null,
      mes: null, // 'AAAA-MM' visível no calendário
      nome: '',
      telefone: '',
      email: '',
      ocasiao: '',
      ambiente: 'sem-preferencia',
      observacao: ''
    },
    erros: {}
  };

  (function lerParametros() {
    var busca = window.location.search;
    var m = /[?&]mesa=([^&]+)/.exec(busca);
    if (m) estado.mesa = decodeURIComponent(m[1]).slice(0, 12);

    /* `?fonte=garamond` troca a serifada do app inteiro, para as duas poderem
     * ser comparadas no mesmo celular. A fonte alternativa só é baixada quando
     * o parâmetro existe — a versão padrão não paga por ela. */
    var f = /[?&]fonte=([a-z]+)/.exec(busca);
    if (f && f[1] === 'garamond') {
      document.documentElement.setAttribute('data-fonte', 'garamond');
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap';
      document.head.appendChild(link);
    }
  })();

  /* `/menu/` e' a entrada publica do cardapio publicado pelo engine. O
   * prototipo original, na raiz do app, preserva o estudo de reserva; no
   * caminho publico, porem, nao ha disponibilidade real para oferecer. */
  function ehMenuPublico() {
    return /\/menu\/?$/.test(window.location.pathname);
  }

  /* Numeral da seção. Dez é folgado: a maior carta tem quatro. */
  function romano(n) {
    var mapa = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return mapa[n - 1] || String(n);
  }

  function servicoAtual() {
    return acharServico(estado.servico) || D.servicos[0];
  }

  function acharServico(id) {
    for (var i = 0; i < D.servicos.length; i++) {
      if (D.servicos[i].id === id) return D.servicos[i];
    }
    return null;
  }

  function acharItem(idServico, idItem) {
    var s = acharServico(idServico);
    if (!s) return null;
    for (var i = 0; i < s.categorias.length; i++) {
      var c = s.categorias[i];
      for (var j = 0; j < c.itens.length; j++) {
        if (c.itens[j].id === idItem) {
          return { servico: s, categoria: c, item: c.itens[j] };
        }
      }
    }
    return null;
  }

  /* === Disponibilidade simulada ========================================== */
  /*
   * Nada aqui consulta nada: é uma simulação determinística para demonstrar os
   * estados da reserva — inclusive o de "sem horários". As datas partem sempre
   * de hoje, então a demonstração nunca envelhece.
   */

  var HOJE = new Date();
  HOJE.setHours(0, 0, 0, 0);

  function proximosDias(qtd) {
    var lista = [];
    for (var i = 0; i < qtd; i++) {
      var d = new Date(HOJE.getTime());
      d.setDate(d.getDate() + i);
      lista.push(chaveData(d));
    }
    return lista;
  }

  /* Uma data lotada de propósito: o primeiro sábado a pelo menos cinco dias.
   * É o que permite ver o estado de ausência de horários sem procurar. */
  var DATA_LOTADA = (function () {
    for (var i = 5; i < 20; i++) {
      var d = new Date(HOJE.getTime());
      d.setDate(d.getDate() + i);
      if (d.getDay() === 6) return chaveData(d);
    }
    return null;
  })();

  function fechadoNoDia(chave) {
    return dataDeChave(chave).getDay() === 1; // segunda
  }

  function passouNoDia(chave) {
    return chave < chaveData(HOJE);
  }

  /*
   * Quanto maior a mesa, menos horários cabem — é o que qualquer salão
   * responderia, e é o que dá sentido a revalidar o horário quando a
   * quantidade de pessoas muda. O corte só cresce, nunca troca de conjunto:
   * um horário livre para sete também está livre para dois.
   */
  function corteDeOcupacao(pessoas) {
    var n = pessoas || 2;
    if (n >= 7) return 0.6;
    if (n >= 5) return 0.47;
    return 0.34;
  }

  function grade(inicio, fim, passoMin) {
    var horas = [];
    for (var m = inicio; m <= fim; m += passoMin) {
      horas.push(
        String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
      );
    }
    return horas;
  }

  function turnosDoDia(chave, pessoas) {
    if (fechadoNoDia(chave)) return [];
    if (passouNoDia(chave)) return [];
    if (chave === DATA_LOTADA) return [];

    var d = dataDeChave(chave);
    var dia = d.getDay();
    var turnos = [];

    if (dia === 0) {
      turnos.push({ id: 'almoco', nome: 'Almoço', horas: grade(12 * 60, 15 * 60, 30) });
    } else {
      turnos.push({ id: 'almoco', nome: 'Almoço', horas: grade(12 * 60, 14 * 60 + 30, 30) });
      turnos.push({
        id: 'jantar',
        nome: 'Jantar',
        horas: grade(19 * 60, dia === 5 || dia === 6 ? 22 * 60 + 30 : 22 * 60, 30)
      });
    }

    var agora = new Date();
    var ehHoje = chave === chaveData(HOJE);

    return turnos
      .map(function (t) {
        var horas = t.horas.filter(function (hora) {
          // Ocupação simulada, estável por data + horário + tamanho da mesa.
          if (semente(chave + hora) < corteDeOcupacao(pessoas)) return false;
          if (ehHoje) {
            var p = hora.split(':');
            var quando = new Date();
            quando.setHours(Number(p[0]), Number(p[1]), 0, 0);
            // Reservas só a partir de uma hora à frente.
            if (quando.getTime() - agora.getTime() < 60 * 60 * 1000) return false;
          }
          return true;
        });
        return { id: t.id, nome: t.nome, horas: horas };
      })
      .filter(function (t) {
        return t.horas.length > 0;
      });
  }

  function temHorario(chave, pessoas) {
    return turnosDoDia(chave, pessoas).length > 0;
  }

  /*
   * Um estado por dia, e é dele que saem a marca visual do calendário e o
   * `aria-label`. "Lotado" e "fechado" são coisas diferentes: o dia lotado
   * continua clicável, porque a resposta ("não temos mesa, mas temos nestes
   * outros dias") só existe do outro lado do toque.
   */
  function estadoDoDia(chave, pessoas) {
    if (passouNoDia(chave)) return 'passado';
    if (fechadoNoDia(chave)) return 'fechado';
    if (!temHorario(chave, pessoas)) return 'lotado';
    return 'livre';
  }

  /* Alternativas em volta da data pedida — antes e depois —, não só depois:
   * quem procurou o sábado que lotou costuma aceitar a sexta. */
  function alternativasDeData(chaveRef, pessoas) {
    var achadas = [];
    var base = dataDeChave(chaveRef);
    for (var passo = 1; passo <= 30 && achadas.length < 3; passo++) {
      [-passo, passo].forEach(function (delta) {
        if (achadas.length >= 3) return;
        var d = new Date(base.getTime());
        d.setDate(d.getDate() + delta);
        var chave = chaveData(d);
        if (passouNoDia(chave)) return;
        if (achadas.indexOf(chave) !== -1) return;
        if (temHorario(chave, pessoas)) achadas.push(chave);
      });
    }
    return achadas.sort();
  }

  /* === Componentes ======================================================= */

  function barraHtml(opcoes) {
    var o = opcoes || {};
    var esquerda;

    /*
     * A barra do cardápio é outra coisa: fixa, transparente sobre a foto no
     * alto e chapa escura depois da dobra (ver `.barra--carta` no CSS). Ela
     * carrega a marca e o índice, e só. Quem diz que seção está sendo lida é o
     * próprio título da seção, que gruda logo abaixo dela — não uma cópia do
     * nome escrita aqui dentro. "Reservar" saiu: virou a pastilha discreta do
     * canto inferior.
     */
    if (o.carta) {
      /* A barra do cardápio carrega a marca, e nada mais. O índice desceu para
       * a faixa da seção (ver `pratoHtml`/`vistaCardapio`): é lá que ele fica
       * ao alcance enquanto se lê, e assim a barra para de acumular controles
       * que sobrevivem à rolagem inteira. */
      return (
        '<header class="barra barra--carta">' +
          '<a class="barra__marca" href="' + (estado.mesa ? '#/cardapio' : '#/') + '">' +
            marcaHtml('nome') +
          '</a>' +
        '</header>'
      );
    }

    if (o.voltar) {
      esquerda =
        '<a class="barra__marca" href="' + h(o.voltar) + '" aria-label="Voltar">' +
        '<span class="icone-btn" aria-hidden="true">' + ico.voltar + '</span>' +
        marcaHtml('nome') +
        '</a>';
    } else {
      var alvo = estado.mesa ? '#/cardapio' : '#/';
      esquerda =
        '<a class="barra__marca" href="' + alvo + '">' +
        marcaHtml('nome') +
        (estado.mesa ? '<span class="barra__mesa">Mesa ' + h(estado.mesa) + '</span>' : '') +
        '</a>';
    }

    var acoes = '';
    if (o.fechar) {
      acoes +=
        '<a class="icone-btn" href="' + h(o.fechar) + '" aria-label="Fechar">' + ico.fechar + '</a>';
    }

    return (
      '<header class="barra chapa">' + esquerda +
      '<div class="barra__acoes">' + acoes + '</div></header>'
    );
  }

  function fotoHtml(src, alt, foco, largura, altura) {
    return (
      '<img src="' + h(src) + '" alt="' + h(alt) + '" loading="lazy" decoding="async" ' +
      'width="' + (largura || 900) + '" height="' + (altura || 1200) + '" ' +
      'style="object-position:' + h(foco || '50% 50%') + '" />'
    );
  }

  function precoDoItem(item) {
    if (!item.precos || !item.precos.length) return '';
    return item.precos
      .map(function (p) {
        return (p.rotulo ? '<small>' + h(p.rotulo) + '</small> ' : '') + dinheiro(p.valor);
      })
      .join('<span aria-hidden="true"> · </span>');
  }

  /*
   * Preço único sobe para a linha do nome, à direita, como num cardápio
   * impresso. Preço com rótulo (taça, garrafa) desce para uma linha própria:
   * na largura do celular, dois valores ao lado do nome quebravam o nome em
   * três linhas e estouravam a coluna.
   *
   * Basta um preço rotulado na carta para toda ela usar o bloco: metade da
   * lista com preço na linha do nome e metade abaixo é pior que qualquer uma
   * das duas formas sozinha.
   *
   * Mora aqui, e não dentro de `pratoHtml`, porque a busca mostra os mesmos
   * itens e precisa da mesma regra.
   */
  function formasDePreco(servico, item) {
    var precos = servico.tipo === 'carta' && item.precos ? item.precos : [];
    var rotulado = precos.some(function (p) { return !!p.rotulo; });
    var emBloco = precos.length > 1 || rotulado;
    return {
      linha: precos.length && !emBloco ? precoDoItem(item) : '',
      bloco: emBloco
        ? '<p class="prato__precos">' +
          precos
            .map(function (p) {
              return (
                '<span><small>' + h(p.rotulo || '') + '</small> ' +
                dinheiro(p.valor) + '</span>'
              );
            })
            .join('') +
          '</p>'
        : ''
    };
  }

  /* Todo item tem a mesma forma: foto quadrada à esquerda, texto à direita.
   * Não há mais item "em destaque" com foto grande — a foto grande da vista é
   * uma só, a do serviço. Uniformidade aqui é o que deixa a lista comparável e
   * o nome do prato ser a coisa mais forte de cada linha. */
  function pratoHtml(servico, categoria, item) {
    var href = '#/cardapio/' + servico.id + '/' + item.id;
    var formas = formasDePreco(servico, item);
    var preco = formas.linha;
    var precoBloco = formas.bloco;

    var partes = [];
    partes.push('<article class="prato">');

    /* A miniatura é decorativa: o nome e a descrição, logo ao lado, já dizem o
     * que ela mostra. O alt descritivo fica no painel de detalhe, onde a foto
     * é o conteúdo. */
    partes.push(
      '<div class="prato__thumb">' +
        (item.foto ? fotoHtml(item.foto, '', item.foco, 300, 300) : '') +
      '</div>'
    );

    partes.push('<div class="prato__texto">');
    partes.push('<p class="prato__topo">');
    partes.push(
      '<a class="prato__link prato__nome" href="' + href + '">' + h(item.nome) + '</a>'
    );
    if (preco) {
      partes.push('<span class="prato__preco">' + preco + '</span>');
    }
    partes.push('</p>');

    partes.push('<p class="prato__desc">' + h(item.descricao) + '</p>');
    if (precoBloco) partes.push(precoBloco);

    /* Suplemento aparece só onde existe, e nomeado — nunca como se fosse o
     * preço do prato dentro do menu fechado. */
    if (servico.tipo === 'fixo' && item.suplemento) {
      partes.push(
        '<span class="prato__selo">Suplemento de ' + dinheiro(item.suplemento) + '</span>'
      );
    }
    partes.push('</div>');

    partes.push('</article>');
    return partes.join('');
  }

  /* === Vista: capa (acesso antes da visita) ============================== */

  /* A linha "hoje" da capa sai da MESMA tabela que a pessoa lê mais abaixo —
   * uma verdade só. Como toda a agenda do protótipo, é demonstrativa. */
  var NOMES_DIA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  function linhaDoDia(diaSemana) {
    var achadas = D.casa.horarios.filter(function (l) {
      return l.dias && l.dias.indexOf(diaSemana) !== -1;
    });
    return achadas[0] || null;
  }

  /* A primeira hora de uma linha da tabela: "12h–15h · 19h–23h" → "12h". Na
   * frase de casa fechada é só isso que interessa — quando a porta volta a
   * abrir. A tabela inteira está logo abaixo, para quem quiser o resto. */
  function primeiraHora(hora) {
    return String(hora).split('·')[0].split('–')[0].trim();
  }

  function textoDeHoje() {
    var hoje = new Date().getDay();
    var linha = linhaDoDia(hoje);
    if (linha && !linha.fechado) return 'Hoje, ' + linha.hora;

    /* "Fechado hoje · amanhã, 12h–15h · 19h–23h" dizia a verdade com cara de
     * placa na porta: uma recusa seguida de uma tabela. A casa fechada é o
     * momento em que a frase mais precisa soar como gente. */
    for (var i = 1; i <= 7; i++) {
      var d = (hoje + i) % 7;
      var prox = linhaDoDia(d);
      if (prox && !prox.fechado) {
        var quando = i === 1 ? 'amanhã' : NOMES_DIA[d].toLowerCase();
        return 'Fechado hoje. Retornamos ' + quando + ', às ' + primeiraHora(prox.hora);
      }
    }
    return null;
  }

  function vistaCapa() {
    var c = D.casa;
    var hoje = textoDeHoje();

    var horarios = c.horarios
      .map(function (linha) {
        return (
          '<li data-fechado="' + (linha.fechado ? 'true' : 'false') + '">' +
          '<span class="horarios__dia">' + h(linha.dia) + '</span>' +
          '<span class="horarios__hora">' + h(linha.hora) + '</span></li>'
        );
      })
      .join('');

    var tira = c.ambiente
      .map(function (f) {
        return '<figure>' + fotoHtml(f.src, f.alt, f.foco) + '</figure>';
      })
      .join('');

    return (
      '<main id="conteudo">' +
        '<section class="capa">' +
          '<div class="capa__foto">' +
            '<img src="' + h(c.capa.src) + '" alt="' + h(c.capa.alt) + '" ' +
            'width="1094" height="1500" fetchpriority="high" decoding="async" />' +
          '</div>' +
          '<div class="capa__veu" aria-hidden="true"></div>' +
          '<div class="capa__corpo">' +
            '<div class="capa__marca">' +
              '<h1 class="oculto-visual">Bistrô Nicolini</h1>' +
              /* A propria marca ja traz "alta gastronomia" em versalete; uma
               * segunda linha do mesmo tipo logo abaixo brigava com ela. A
               * cidade desceu para a linha de servico. */
              marcaHtml() +
              '<p class="capa__linha">O melhor da cozinha italiana</p>' +
            '</div>' +
            /* O que a pessoa quer saber antes de decidir: se está aberto agora.
             * Fica dentro da capa, em cima das ações, e não numa tabela lá
             * embaixo. */
            /* Só o horário. A cidade saía aqui e voltava na linha do endereço,
             * meia tela abaixo — dizer "Caxias do Sul" ao lado de "fechado
             * hoje" juntava duas conversas diferentes numa linha só. */
            (hoje ? '<p class="capa__hoje">' + ico.relogio + '<span>' + h(hoje) + '</span></p>' : '') +
            '<div class="capa__acoes">' +
              '<a class="btn btn--claro" href="#/cardapio">Ver cardápio</a>' +
              '<a class="btn btn--linha-clara" href="#/reserva">Reservar uma mesa</a>' +
            '</div>' +
            '<a class="capa__abaixo" href="#/visita">Horários, endereço e contato ' +
              ico.baixo + '</a>' +
          '</div>' +
        '</section>' +

        '<section class="pratico">' +
          '<div class="wrap pratico__grade">' +
            '<div>' +
              '<h2 class="pratico__titulo">A casa</h2>' +
              '<ul class="horarios">' + horarios + '</ul>' +
            '</div>' +
            '<div>' +
              '<div class="contatos">' +
                '<p>' + ico.pino + '<span>' + h(c.endereco) + '<br />' + h(c.cidade) + '</span></p>' +
                '<a href="' + h(c.telefone.link) + '">' + ico.fone + '<span>' + h(c.telefone.exibicao) + '</span></a>' +
                '<a href="' + h(c.whatsapp.link) + '" target="_blank" rel="noopener">' + ico.zap + '<span>WhatsApp ' + h(c.whatsapp.exibicao) + '</span></a>' +
                '<a href="' + h(c.instagram.link) + '" target="_blank" rel="noopener">' + ico.insta + '<span>' + h(c.instagram.exibicao) + '</span></a>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="tira">' + tira + '</div>' +
          '<div class="wrap">' +
            '<div class="rodape">' +
              '<p class="selo-demo">Protótipo</p>' +
              '<p>Mockup de estudo do aplicativo do Bistrô Nicolini. Preços, ' +
              'horários e disponibilidade são demonstrativos e nenhuma reserva ' +
              'é enviada.</p>' +
            '</div>' +
          '</div>' +
        '</section>' +
      '</main>'
    );
  }

  /* === Vista: cardápio =================================================== */

  function vistaCardapio() {
    var s = servicoAtual();
    if (!s) {
      return barraHtml({ carta: false }) +
        '<main id="conteudo" class="estado-engine"><div class="wrap">' +
          '<p class="selo-demo">Cardápio indisponível</p>' +
          '<h1>Não foi possível abrir o menu agora.</h1>' +
          '<p>' + h(window.BISTRO_ENGINE_ERROR || 'Tente novamente em instantes.') + '</p>' +
          '<p><a class="btn" href="' + h(D.casa.telefone.link) + '">Falar com o Bistrô</a></p>' +
        '</div></main>';
    }

    /*
     * O seletor de cima responde a uma pergunta só — qual refeição? —, e por
     * isso ficou com duas pastilhas: Almoço e Jantar. Vinhos saiu daqui: não é
     * uma terceira refeição, é outra carta, consultada no meio da refeição e
     * quase sempre depois de escolher a comida. Ela se alcança pelo índice do
     * cabeçalho pegajoso, que é navegação, e não por uma pastilha que fingia
     * ser uma escolha do mesmo tipo.
     */
    var seletor;

    if (s.foraDasAbas) {
      /* Dentro da carta de vinhos, a faixa deixa de ser seletor e vira
       * endereço: diz em que carta a pessoa está e por onde se volta. */
      var base = acharServico(estado.servicoBase) || D.servicos[0];
      seletor =
        '<div class="carta-atual">' +
          '<a class="carta-atual__voltar" href="#/cardapio/' + base.id + '" ' +
            'aria-label="Voltar para a carta ' + h(base.nome) + '">' +
            ico.voltar + '<span>' + h(base.curto) + '</span>' +
          '</a>' +
          '<p class="carta-atual__nome">' + h(s.nome) + '</p>' +
        '</div>';
    } else {
      var abas = D.servicos
        .filter(function (sv) { return !sv.foraDasAbas; })
        .map(function (sv) {
          var atual = sv.id === s.id;
          return (
            '<a class="aba" href="#/cardapio/' + sv.id + '"' +
            (atual ? ' aria-current="page"' : '') + '>' + h(sv.curto) + '</a>'
          );
        })
        .join('');
      seletor = '<nav class="cartas cartas--abas" aria-label="Refeição">' + abas + '</nav>';
    }

    /*
     * A PORTADA: uma palavra, e o horário.
     *
     * O título era o nome da carta ("Jantar", "Almoço executivo") com um chapéu
     * "CARDÁPIO" em cima. Duas coisas erradas nisso:
     *
     * - "CARDÁPIO" acima de um nome de carta e a pastilha acesa logo abaixo
     *   diziam a mesma coisa em três lugares. A pastilha JÁ diz qual carta é —
     *   e diz melhor, porque também deixa trocar.
     * - Um título que muda a cada carta não é título de página, é rótulo de
     *   estado. A página é uma só, e é isto: o menu da casa.
     *
     * Então a portada carrega a palavra e o horário do serviço, e mais nada. O
     * nome da carta vive na pastilha; na carta de vinhos, que não tem pastilha,
     * ele vive na faixa de endereço logo abaixo ("‹ Jantar | Carta de vinhos").
     *
     * O texto no DOM é "Menu" e a caixa alta é do CSS: em caixa alta no
     * próprio texto, parte dos leitores de tela soletra a palavra. O nome da
     * carta continua no `h1` para quem lê por ali, em trecho invisível.
     *
     * (Sobre a palavra: "menu", em restaurante brasileiro, também quer dizer o
     * menu fechado — e existe um "Almoço executivo" na pastilha logo abaixo.
     * É o risco conhecido desta versão; "Cardápio" está em `versoes/portada-v1`.)
     */
    var blocoTitulo =
      '<div class="servico-capa__titulo">' +
        /* O chapéu sobrou para uma coisa só: dizer de que mesa a pessoa
         * entrou. Sem QR, não há chapéu nenhum. */
        (estado.mesa
          ? '<p class="servico-capa__chapeu">Mesa ' + h(estado.mesa) + '</p>'
          : '') +
        '<h1 class="servico-capa__nome">Menu' +
          '<span class="oculto-visual"> do Bistrô Nicolini — ' + h(s.nome) + '</span>' +
        '</h1>' +
        /* Pelo QR o horário sai: quem está sentado chegou no horário, e o que
         * essa pessoa quer é o primeiro prato o quanto antes. */
        (estado.mesa
          ? ''
          : '<p class="servico-capa__quando">' + h(s.quando) + '</p>') +
      '</div>';

    var precoBloco =
      s.tipo === 'fixo'
        ? '<p class="nota-servico__preco">' + dinheiro(s.preco) +
          ' <span>' + h(s.precoNota) + '</span></p>'
        : '';

    /*
     * O nome da seção é um título no fluxo, com o numeral à frente — e não
     * mais uma faixa pegajosa com um botão do outro lado. Quem corre no alto
     * da tela é a barra, que mostra a mesma seção enquanto ela está sendo
     * lida; ter as duas coisas era ter dois tetos, um debaixo do outro.
     */
    var categorias = s.categorias
      .map(function (c, i) {
        var itens = c.itens
          .map(function (it) { return pratoHtml(s, c, it); })
          .join('');
        return (
          '<section class="categoria" id="cat-' + c.id + '" aria-labelledby="tit-' + c.id + '">' +
            '<div class="categoria__cabeca">' +
              '<span class="categoria__num" aria-hidden="true">' + romano(i + 1) + '</span>' +
              '<h2 class="categoria__titulo" id="tit-' + c.id + '">' + h(c.nome) + '</h2>' +
              /* O índice, sem a palavra: um chevron na ponta da faixa que
               * gruda. Enquanto a seção está no alto da tela, ele está no alto
               * da tela — e some junto com ela, em vez de ocupar a barra
               * durante a carta inteira. O rótulo continua existindo para
               * quem lê com leitor de tela. */
              '<button type="button" class="categoria__ir" data-ir ' +
                'aria-haspopup="dialog" aria-label="Abrir o índice do cardápio">' +
                ico.baixo + '</button>' +
            '</div>' +
            '<div class="pratos">' +
              itens +
            '</div>' +
          '</section>'
        );
      })
      .join('');

    var rodapeReserva = estado.mesa
      ? '<p>Quer voltar outro dia? <a href="#/reserva">Ver demonstração de reserva</a>.</p>'
      : '<p><a href="#/visita">Horários, endereço e contato</a></p>';

    return (
      barraHtml({ carta: true }) +

      '<main id="conteudo" class="cardapio' + (estado.mesa || ehMenuPublico() ? '' : ' cardapio--flutua') + '">' +
        /* A faixa agora carrega a barra: marca e foto viram um objeto só, como
         * na capa, em vez de dois registros empilhados. Pelo QR ela encolhe —
         * quem está sentado já viu o salão — mas nunca some: sem ela o
         * cardápio perde a casa e vira uma lista qualquer. */
        (s.foto
          ? '<div class="servico-capa' + (estado.mesa ? ' servico-capa--compacta' : '') + '">' +
            /* Vídeo quando a carta tem um: mudo, em laço, sem controles — é
             * atmosfera, não mídia para assistir. `playsinline` para o iPhone
             * não abrir em tela cheia, e a foto como `poster` para a portada
             * nunca aparecer vazia (primeiro quadro, dados economizados,
             * autoplay bloqueado). `aria-hidden`: o texto alternativo da cena
             * já está no `alt` da foto que serve de poster. */
            (s.foto.video
              ? '<video class="servico-capa__video" src="' + h(s.foto.video) + '" ' +
                'poster="' + h(s.foto.src) + '" style="object-position:' + h(s.foto.foco) + '" ' +
                'autoplay muted loop playsinline preload="metadata" ' +
                'aria-label="' + h(s.foto.alt) + '"></video>'
              : fotoHtml(s.foto.src, s.foto.alt, s.foto.foco)) +
            blocoTitulo +
            '</div>'
          : '') +
        '<div class="wrap">' +
          /* No papel fica o que se toca — e, agora que a portada não repete o
           * nome da carta, a pastilha acesa é quem responde "qual carta é
           * esta". */
          '<div class="carta-topo">' + seletor + '</div>' +
          '<div class="cardapio__corpo">' +
            '<div class="cardapio__lateral">' +
              '<div class="nota-servico">' +
                precoBloco +
                '<p class="nota-servico__texto">' + h(s.nota) + '</p>' +
                (s.observacao ? '<p class="nota-servico__observacao">' + h(s.observacao) + '</p>' : '') +
              '</div>' +
            '</div>' +
            '<div class="cardapio__lista">' +
              categorias +
              '<div class="rodape">' +
                '<p class="selo-demo">Protótipo</p>' +
                '<p>Preços e composição dos pratos são demonstrativos. ' +
                'Fale com o salão sobre restrições alimentares — não listamos ' +
                'alergênicos nesta versão.</p>' +
                rodapeReserva +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</main>' +
      /* Fora do `main`: é chrome, não conteúdo do cardápio. Aparece só depois
       * da dobra, e nunca pelo QR — quem está sentado já tem mesa, e ali o
       * rodapé é que oferece voltar outro dia. */
      (estado.mesa || ehMenuPublico()
        ? ''
        : '<a class="btn reservar-flutua" href="#/reserva">Ver reserva demonstrativa</a>')
    );
  }

  /* Altura da faixa fixa, lida do próprio elemento: os deslocamentos de
   * rolagem seguem o CSS em vez de repetir um número. */
  /* Rolagem suave, menos para quem pediu menos movimento: `scroll-behavior` do
   * CSS não alcança o `behavior` pedido aqui pelo script. */
  function rolarPara(y) {
    var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: Math.max(0, y), behavior: quieto ? 'auto' : 'smooth' });
  }

  function alturaBarra() {
    var barra = $('.barra');
    return barra ? barra.getBoundingClientRect().height : 54;
  }

  /* Qual categoria está encostada no alto agora. Usada só para marcar a folha
   * "Ir para" — a orientação visual quem dá é o cabeçalho pegajoso. */
  function categoriaVisivel() {
    var limite = alturaBarra() + 8;
    var atual = null;
    $$('.categoria').forEach(function (sec) {
      if (sec.getBoundingClientRect().top <= limite) atual = sec.id.replace('cat-', '');
    });
    if (atual) return atual;
    var primeira = servicoAtual().categorias[0];
    return primeira ? primeira.id : null;
  }

  function irParaCategoria(id) {
    var alvo = document.getElementById('cat-' + id);
    if (!alvo) return;
    rolarPara(window.scrollY + alvo.getBoundingClientRect().top - alturaBarra());

    /* Quem chegou aqui pelo teclado precisa continuar de onde a página pulou,
     * e não do começo do documento. O foco vai para o título da seção — o
     * mesmo que um salto por âncora faria. */
    var titulo = $('.categoria__titulo', alvo);
    if (titulo) {
      titulo.setAttribute('tabindex', '-1');
      titulo.focus({ preventScroll: true });
    }
  }

  /* === Vista: visita ===================================================== */

  function vistaVisita() {
    var c = D.casa;
    var horarios = c.horarios
      .map(function (l) {
        return (
          '<li data-fechado="' + (l.fechado ? 'true' : 'false') + '">' +
          '<span class="horarios__dia">' + h(l.dia) + '</span>' +
          '<span class="horarios__hora">' + h(l.hora) + '</span></li>'
        );
      })
      .join('');

    return (
      barraHtml({ voltar: '#/cardapio' }) +
      '<main id="conteudo" class="visita"><div class="wrap">' +
        '<h1 class="visita__titulo">A visita</h1>' +
        '<p class="visita__sub">Onde ficamos, quando abrimos e como falar com a casa.</p>' +
        '<div class="visita__foto">' +
          /* Recorte proprio: neste 3:2 o valor da galeria cortava a cupula da
           * luminaria, que e o assunto da foto. */
          fotoHtml(c.ambiente[0].src, c.ambiente[0].alt, '50% 28%') +
        '</div>' +
        '<div class="visita__grade">' +
          '<div>' +
            '<section class="bloco">' +
              '<h2 class="bloco__nome">Horários</h2>' +
              '<ul class="horarios">' + horarios + '</ul>' +
            '</section>' +
            '<section class="bloco">' +
              '<h2 class="bloco__nome">Endereço</h2>' +
              '<div class="contatos">' +
                '<p>' + ico.pino + '<span>' + h(c.endereco) + '<br />' + h(c.cidade) + '</span></p>' +
              '</div>' +
            '</section>' +
          '</div>' +
          '<div>' +
            '<section class="bloco">' +
              '<h2 class="bloco__nome">Contato</h2>' +
              '<div class="contatos">' +
                '<a href="' + h(c.telefone.link) + '">' + ico.fone + '<span>' + h(c.telefone.exibicao) + '</span></a>' +
                '<a href="' + h(c.whatsapp.link) + '" target="_blank" rel="noopener">' + ico.zap + '<span>WhatsApp ' + h(c.whatsapp.exibicao) + '</span></a>' +
                '<a href="' + h(c.instagram.link) + '" target="_blank" rel="noopener">' + ico.insta + '<span>' + h(c.instagram.exibicao) + '</span></a>' +
              '</div>' +
            '</section>' +
            (ehMenuPublico()
              ? ''
              : '<section class="bloco">' +
              '<h2 class="bloco__nome">Reservas</h2>' +
              '<p class="nota-servico__texto visita__texto">' +
              'Grupos acima de oito pessoas e datas especiais são combinados ' +
              'por telefone com o salão.</p>' +
              '<a class="btn" href="#/reserva">Reservar uma mesa</a>' +
            '</section>') +
          '</div>' +
        '</div>' +
        '<div class="rodape">' +
          '<p class="selo-demo">Protótipo</p>' +
          '<p>Horários e contatos vieram do material da casa e ainda não foram ' +
          'confirmados; nesta demonstração servem de exemplo.</p>' +
        '</div>' +
      '</div></main>'
    );
  }

  /* === Vista: reserva ==================================================== */
  /*
   * Duas telas antes da confirmação demonstrativa:
   *
   *   DISPONIBILIDADE  quantas pessoas · que dia · que horas
   *   DADOS            em nome de quem, com a mesa revista no alto
   *
   * A disponibilidade não esconde nada atrás de perguntas encadeadas. O
   * calendário do mês é o controle principal da data — uma grade comparável,
   * em que o dia 12 e o dia 19 estão à mesma distância do olho — e os horários
   * do dia escolhido aparecem logo abaixo dele (ao lado, no desktop).
   *
   * Antes havia uma lista vertical de dias ("Hoje", "Terça", "Quarta") com
   * tratamento de título editorial: cinco linhas altas para cinco dias, sem
   * o mês à vista e sem como comparar duas semanas. O calendário diz o mesmo
   * em um terço da altura, e diz também o que a lista não dizia — onde estão
   * as segundas fechadas e o sábado cheio.
   *
   * Pessoas e data continuam a um toque de distância o tempo todo: não viram
   * faixa de resposta, viram controle permanente no alto da tela.
   */

  var PESSOAS_MIN = 1;
  var PESSOAS_MAX = 8;

  function dataLonga(chave) {
    var d = dataDeChave(chave);
    return NOMES_DIA[d.getDay()].toLowerCase() + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()];
  }

  function maiusculaInicial(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  function pluralPessoas(n) {
    return n + (n === 1 ? ' pessoa' : ' pessoas');
  }

  function rotuloReserva() {
    var r = estado.reserva;
    var partes = [pluralPessoas(r.pessoas)];
    if (r.data) partes.push(dataPorExtenso(r.data));
    if (r.hora) partes.push(r.hora);
    return partes.join(' · ');
  }

  /* Um dia sem mesa diz por quê, e o leitor de tela recebe a frase inteira
   * mesmo quando a marca visível é só um risco no número. */
  function servicosDoDia(chave, pessoas) {
    if (fechadoNoDia(chave)) return 'fechado';
    var turnos = turnosDoDia(chave, pessoas);
    if (!turnos.length) return 'sem mesas para ' + pluralPessoas(pessoas);
    return turnos
      .map(function (t) { return t.nome.toLowerCase(); })
      .join(' e ');
  }

  function vistaReserva(passo) {
    var corpo = passo === 'dados' ? etapaDados() : etapaDisponibilidade();

    return (
      barraHtml({ voltar: estado.mesa ? '#/cardapio' : '#/' }) +
      '<main id="conteudo" class="reserva' + (temPeFixo(passo) ? ' reserva--pe' : '') + '">' +
      '<div class="wrap">' +
        '<form id="form-reserva" novalidate>' + corpo + '</form>' +
      '</div></main>'
    );
  }

  /* A barra de avanço só existe quando há o que avançar: sem horário escolhido
   * ela seria um botão morto ocupando o pé da tela. */
  function temPeFixo(passo) {
    return passo === 'dados' || !!estado.reserva.hora;
  }

  /* O aviso de demonstração encolheu para uma pastilha e uma linha, coladas ao
   * título. Antes era uma coluna inteira ao lado do fluxo, no desktop, e um
   * parágrafo solto embaixo da pergunta, no celular. */
  function cabecaReserva(titulo, nota) {
    return (
      '<header class="reserva__cabeca">' +
        /* `h1`: é o título da tela, como o nome da carta virou na portada do
         * cardápio. Era `h2`, e a reserva ficava sem cabeçalho de nível 1. */
        '<h1 class="reserva__titulo">' + h(titulo) + '</h1>' +
        (nota
          ? '<p class="reserva__demo">' +
              '<span class="selo-demo selo-demo--fino">Demonstração</span>' +
              '<span>' + h(nota) + '</span>' +
            '</p>'
          : '') +
      '</header>'
    );
  }

  /* --- Tela 1: disponibilidade --- */

  function etapaDisponibilidade() {
    var r = estado.reserva;
    if (!r.mes) r.mes = (r.data || chaveData(HOJE)).slice(0, 7);

    var erroData = estado.erros.data
      ? '<p class="erro" id="erro-data">' + h(estado.erros.data) + '</p>'
      : '';

    return (
      cabecaReserva(
        'Simule uma reserva',
        'Nada é enviado. Os dias e horários abaixo são simulados.'
      ) +
      /* Pessoas fica FORA da grade de duas colunas: ela vale para as duas —
       * muda o calendário e muda os horários —, e dentro da coluna da
       * esquerda empurrava o calendário para baixo do bloco de horários. */
      blocoPessoas() +
      '<div class="disp">' +
        '<div class="disp__lado">' +
          calendarioHtml(r.mes) +
        '</div>' +
        '<section class="disp__horas" id="bloco-horas" aria-labelledby="horas-titulo">' +
          blocoHorarios() +
        '</section>' +
      '</div>' +
      erroData +
      (temPeFixo('disponibilidade') ? pefixo('Continuar') : '')
    );
  }

  function blocoPessoas() {
    var r = estado.reserva;

    function seta(passo, rotulo, desligada) {
      return (
        '<button type="button" class="passo__btn" data-pessoas="' + passo + '" ' +
        'aria-label="' + h(rotulo) + '"' + (desligada ? ' disabled' : '') + '>' +
        (passo < 0 ? ico.menos : ico.mais) + '</button>'
      );
    }

    /* TEMPORÁRIO (pedido do Pedro): a nota "Mesas maiores que 8..." está
     * desligada. Para trazer de volta, apagar o `false &&` abaixo. */
    var nota = false &&
      '<p class="pessoas__nota">Mesas maiores que ' + PESSOAS_MAX + ' o salão combina por ' +
      'telefone: <a href="' + h(D.casa.telefone.link) + '">' + h(D.casa.telefone.exibicao) +
      '</a>.</p>';

    return (
      '<div class="pessoas">' +
        '<span class="pessoas__rot" id="rot-pessoas">Pessoas</span>' +
        '<div class="passo" role="group" aria-labelledby="rot-pessoas">' +
          seta(-1, 'Uma pessoa a menos', r.pessoas <= PESSOAS_MIN) +
          '<span class="passo__valor">' +
            '<span class="passo__num">' + r.pessoas + '</span>' +
            '<span class="passo__uni">' + (r.pessoas === 1 ? 'pessoa' : 'pessoas') + '</span>' +
          '</span>' +
          seta(1, 'Uma pessoa a mais', r.pessoas >= PESSOAS_MAX) +
        '</div>' +
      '</div>' +
      (nota || '')
    );
  }

  /* --- Calendário do mês --- */

  function chaveMes(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  function deslocarMes(mes, passo) {
    var d = new Date(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)) - 1 + passo, 1);
    return chaveMes(d);
  }

  /* A agenda do protótipo vai até o fim do terceiro mês. Mais do que isso seria
   * fingir uma disponibilidade que nem existe. */
  var MES_MIN = chaveMes(HOJE);
  var MES_MAX = chaveMes(new Date(HOJE.getFullYear(), HOJE.getMonth() + 2, 1));

  function nomeDoMes(mes) {
    return MESES[Number(mes.slice(5, 7)) - 1] + ' de ' + mes.slice(0, 4);
  }

  function calendarioHtml(mes) {
    var r = estado.reserva;
    var ano = Number(mes.slice(0, 4));
    var m = Number(mes.slice(5, 7)) - 1;
    var primeiro = new Date(ano, m, 1);
    var total = new Date(ano, m + 1, 0).getDate();
    var hojeChave = chaveData(HOJE);

    /*
     * Uma parada de tabulação para a grade inteira, não trinta e uma. A grade
     * se percorre com as setas, como qualquer calendário: é o padrão que o
     * teclado espera, e sem ele chegar aos horários custava trinta toques em
     * Tab. A célula "ativa" é a escolhida, ou hoje, ou o primeiro dia livre.
     */
    var ativa = null;
    var candidatos = [];

    var celulas = '';
    for (var v = 0; v < primeiro.getDay(); v++) {
      celulas += '<span class="cal__vazio" aria-hidden="true"></span>';
    }

    for (var dia = 1; dia <= total; dia++) {
      var chave = chaveData(new Date(ano, m, dia));
      var st = estadoDoDia(chave, r.pessoas);
      var travado = st === 'passado' || st === 'fechado';
      if (!travado) {
        candidatos.push(chave);
        if (r.data === chave) ativa = chave;
        else if (ativa === null && chave === hojeChave) ativa = chave;
      }
    }
    if (ativa === null) ativa = candidatos[0] || null;

    for (var d2 = 1; d2 <= total; d2++) {
      var ch = chaveData(new Date(ano, m, d2));
      var est = estadoDoDia(ch, r.pessoas);
      var trav = est === 'passado' || est === 'fechado';
      var hoje2 = ch === hojeChave;

      var rotulo = maiusculaInicial(dataLonga(ch)) + (hoje2 ? ', hoje' : '') + ', ' +
        (est === 'passado' ? 'já passou' : servicosDoDia(ch, r.pessoas));

      celulas +=
        '<button type="button" class="cal__dia" data-estado="' + est + '"' +
        (hoje2 ? ' data-hoje="true"' : '') +
        (trav ? ' disabled' : ' data-data="' + ch + '" tabindex="' +
          (ch === ativa ? '0' : '-1') + '"') +
        ' aria-pressed="' + (r.data === ch ? 'true' : 'false') + '"' +
        ' aria-label="' + h(rotulo) + '">' +
        '<span class="cal__num">' + d2 + '</span></button>';
    }

    var semana = DIAS_CURTOS.map(function (d) {
      /* O leitor de tela já recebe o dia da semana no `aria-label` de cada
       * data; a tira de cabeçalho é orientação visual e nada mais. */
      return '<span>' + d.charAt(0).toUpperCase() + d.slice(1) + '</span>';
    }).join('');

    return (
      '<div class="cal">' +
        '<div class="cal__topo">' +
          '<button type="button" class="cal__nav" data-mes="-1" aria-label="Mês anterior"' +
            (mes <= MES_MIN ? ' disabled' : '') + '>' + ico.voltar + '</button>' +
          '<p class="cal__nome">' + h(nomeDoMes(mes)) + '</p>' +
          '<button type="button" class="cal__nav cal__nav--frente" data-mes="1" ' +
            'aria-label="Próximo mês"' + (mes >= MES_MAX ? ' disabled' : '') + '>' +
            ico.voltar + '</button>' +
        '</div>' +
        '<div class="cal__semana" aria-hidden="true">' + semana + '</div>' +
        '<div class="cal__grade" data-grade role="group" ' +
          'aria-label="Escolha o dia. Use as setas para andar pelo mês.">' +
          celulas + '</div>' +
        /* Divisor entre calendário e horários */
'<div class="cal__divisor" aria-hidden="true"></div>' +
      '</div>'
    );
  }

  /* --- Horários do dia escolhido --- */

  function blocoHorarios() {
    var r = estado.reserva;

    if (!r.data) {
      return (
        '<h3 class="horas__titulo" id="horas-titulo">Horários</h3>' +
        '<p class="horas__espera">Escolha um dia no calendário para ver os horários ' +
        'livres para ' + h(pluralPessoas(r.pessoas)) + '.</p>'
      );
    }

    var titulo =
      '<h3 class="horas__titulo" id="horas-titulo">' +
        h(maiusculaInicial(dataLonga(r.data))) +
      '</h3>';

    var turnos = turnosDoDia(r.data, r.pessoas);

    if (!turnos.length) {
      var fechado = fechadoNoDia(r.data);
      var alts = alternativasDeData(r.data, r.pessoas)
        .map(function (chave) {
          return (
            '<button type="button" class="pilula pilula--alt" data-data="' + chave + '" ' +
            'aria-label="' + h(maiusculaInicial(dataLonga(chave))) + '">' +
            h(dataCurta(chave)) + '</button>'
          );
        })
        .join('');

      return (
        titulo +
        '<div class="sem-horario">' +
          '<p>' + (fechado
            ? 'A casa fecha às segundas.'
            : 'As mesas deste dia já estão comprometidas para ' +
              h(pluralPessoas(r.pessoas)) + '.') +
          '</p>' +
          (alts
            ? '<p class="sem-horario__rot">Dias por perto com mesa livre</p>' +
              '<div class="pilulas">' + alts + '</div>'
            : '<p class="sem-horario__rot">Vale falar com o salão: ' +
              '<a href="' + h(D.casa.telefone.link) + '">' +
              h(D.casa.telefone.exibicao) + '</a>.</p>') +
        '</div>'
      );
    }

    var grupos = turnos
      .map(function (t) {
        var horas = t.horas
          .map(function (hora) {
            var escolhida = r.hora === hora;
            return (
              '<button type="button" class="pilula hora" data-hora="' + hora + '" ' +
              'data-turno="' + t.id + '" ' +
              'aria-pressed="' + (escolhida ? 'true' : 'false') + '">' +
              (escolhida ? '<span class="hora__ok" aria-hidden="true">' + ico.check + '</span>' : '') +
              hora + '</button>'
            );
          })
          .join('');
        return (
          '<div class="turno">' +
            '<p class="turno__nome">' + h(t.nome) + '</p>' +
            '<div class="pilulas">' + horas + '</div>' +
          '</div>'
        );
      })
      .join('');

    return titulo + grupos;
  }

  /* --- Tela 2: dados (com a mesa revista no alto) --- */

  function etapaDados() {
    var r = estado.reserva;
    var e = estado.erros;

    var ocasioes = D.ocasioes
      .map(function (o) {
        return '<option value="' + h(o) + '"' + (r.ocasiao === o ? ' selected' : '') + '>' + h(o) + '</option>';
      })
      .join('');

    function campo(id, rotulo, tipo, valor, ajuda, obrigatorio) {
      var erro = e[id];
      return (
        '<div class="campo">' +
          '<label for="' + id + '">' + h(rotulo) + (obrigatorio ? '' : ' <span class="rotulo__opcional">(opcional)</span>') + '</label>' +
          (ajuda ? '<p class="campo__ajuda" id="ajuda-' + id + '">' + h(ajuda) + '</p>' : '') +
          '<input class="entrada" id="' + id + '" name="' + id + '" type="' + tipo + '" ' +
            'value="' + h(valor) + '" ' +
            (tipo === 'tel' ? 'inputmode="tel" autocomplete="tel" ' : '') +
            (tipo === 'email' ? 'autocomplete="email" ' : '') +
            (id === 'nome' ? 'autocomplete="name" ' : '') +
            (obrigatorio ? 'required ' : '') +
            'aria-invalid="' + (erro ? 'true' : 'false') + '" ' +
            'aria-describedby="' + (ajuda ? 'ajuda-' + id + ' ' : '') + (erro ? 'erro-' + id : '') + '" />' +
          (erro ? '<p class="erro" id="erro-' + id + '">' + h(erro) + '</p>' : '') +
        '</div>'
      );
    }

    return (
      cabecaReserva(
        'Em nome de quem?',
        'Reserva demonstrativa: nada será enviado ao restaurante.'
      ) +

      /* A mesa escolhida vira uma linha só, com "Alterar" ao lado — não um
       * cartão repetindo em três linhas o que já foi decidido. */
      '<div class="mesa-linha">' +
        '<span class="mesa-linha__val">' + h(rotuloReserva()) + '</span>' +
        '<a class="mesa-linha__acao" href="#/reserva">Alterar</a>' +
      '</div>' +

      campo('nome', 'Nome', 'text', r.nome, '', true) +
      campo('telefone', 'Telefone', 'tel', r.telefone, 'Para o salão avisar se algo mudar.', true) +
      campo('email', 'E-mail', 'email', r.email, '', false) +

      '<div class="campo">' +
        '<label for="ocasiao">Ocasião <span class="rotulo__opcional">(opcional)</span></label>' +
        '<select class="entrada" id="ocasiao" name="ocasiao">' +
          '<option value="">Sem ocasião especial</option>' + ocasioes +
        '</select>' +
      '</div>' +

      pefixo('Concluir demonstração', '#/reserva', true)
    );
  }

  /* Resumo curto e ação, no pé. `semMini` para quando a mesa já está resumida
   * logo acima do botão: repetir ali "5 pessoas · sáb, 19 de setembro · 12:00"
   * seria dizer duas vezes a mesma coisa na mesma tela. */
  function pefixo(rotulo, voltar, semMini) {
    return (
      '<div class="pe-fixo">' +
        (semMini ? '' : '<p class="pe-fixo__mini">' + h(rotuloReserva()) + '</p>') +
        '<div class="pe-fixo__acoes">' +
          (voltar
            ? '<a class="btn btn--vazado" href="' + h(voltar) + '">Voltar</a>'
            : '') +
          '<button type="submit" class="btn">' + h(rotulo) + '</button>' +
        '</div>' +
      '</div>'
    );
  }

  function vistaConfirmada() {
    var r = estado.reserva;

    return (
      barraHtml({ voltar: estado.mesa ? '#/cardapio' : '#/' }) +
      '<main id="conteudo" class="confirmado"><div class="wrap">' +
        '<div class="confirmado__marca">' + ico.check + '</div>' +
        '<h1 class="confirmado__titulo">Simulação concluída</h1>' +
        '<p class="confirmado__sub">Reserva demonstrativa: nada foi enviado ao ' +
        'restaurante e nenhum contato foi registrado.</p>' +
        '<div class="cartao">' +
          '<div class="cartao__destaque">' +
            '<p class="cartao__data">' + h(maiusculaInicial(dataLonga(r.data))) + '</p>' +
            '<p class="cartao__hora">' + h(r.hora) + '</p>' +
            '<p class="cartao__pessoas">' + r.pessoas + (r.pessoas === 1 ? ' pessoa' : ' pessoas') +
            ' · em nome de ' + h(r.nome) + '</p>' +
          '</div>' +
          '<div class="resumo resumo--nu">' +
            (r.ocasiao ? '<div class="resumo__linha"><span class="resumo__rot">Ocasião</span><span class="resumo__val">' + h(r.ocasiao) + '</span></div>' : '') +
            (r.observacao ? '<div class="resumo__linha"><span class="resumo__rot">Observação</span><span class="resumo__val">' + h(r.observacao) + '</span></div>' : '') +
            '<div class="resumo__linha"><span class="resumo__rot">Contato</span><span class="resumo__val">' + h(r.telefone) + '</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="confirmado__acoes">' +
          '<a class="btn" href="#/cardapio">Ver o cardápio</a>' +
          '<a class="btn btn--vazado" href="' + (estado.mesa ? '#/cardapio' : '#/') + '">Voltar ao início</a>' +
        '</div>' +
      '</div></main>'
    );
  }

  /* === Sobreposições ===================================================== */

  var sobreposicao = null; // { el, veu, focoAnterior }
  var scrollGuardado = 0;

  /* Quantas vezes a rota mudou desde que a página abriu. Quem chega direto num
   * link de prato (ou de busca) não tem para onde "voltar": nesse caso o fechar
   * troca a rota em vez de sair do site. */
  var passosNaHistoria = 0;

  function voltarOuIrPara(rotaDeSaida) {
    if (passosNaHistoria > 0) history.back();
    else window.location.replace(rotaDeSaida);
  }

  function travarPagina() {
    scrollGuardado = window.scrollY;
    document.body.style.top = -scrollGuardado + 'px';
    document.body.classList.add('travado');
  }

  function destravarPagina() {
    document.body.classList.remove('travado');
    document.body.style.top = '';
    window.scrollTo(0, scrollGuardado);
  }

  function focaveis(el) {
    return $$(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      el
    ).filter(function (n) {
      return n.offsetParent !== null || n === document.activeElement;
    });
  }

  function abrirSobreposicao(html, aoFechar) {
    fecharSobreposicao(true);

    var focoAnterior = document.activeElement;
    var veu = document.createElement('div');
    veu.className = 'veu';

    var caixa = document.createElement('div');
    caixa.className = 'sheet';
    caixa.setAttribute('role', 'dialog');
    caixa.setAttribute('aria-modal', 'true');
    caixa.innerHTML = html;

    document.body.appendChild(veu);
    document.body.appendChild(caixa);
    travarPagina();

    sobreposicao = { el: caixa, veu: veu, focoAnterior: focoAnterior, aoFechar: aoFechar };

    // Foco no primeiro elemento útil de dentro do painel.
    var alvo = caixa.querySelector('[data-foco-inicial]') || focaveis(caixa)[0] || caixa;
    if (alvo === caixa) caixa.setAttribute('tabindex', '-1');
    alvo.focus();

    veu.addEventListener('click', function () {
      if (aoFechar) aoFechar();
      else fecharSobreposicao();
    });

    caixa.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        if (aoFechar) aoFechar();
        else fecharSobreposicao();
        return;
      }
      if (ev.key !== 'Tab') return;
      var lista = focaveis(caixa);
      if (!lista.length) return;
      var primeiro = lista[0];
      var ultimo = lista[lista.length - 1];
      if (ev.shiftKey && document.activeElement === primeiro) {
        ev.preventDefault();
        ultimo.focus();
      } else if (!ev.shiftKey && document.activeElement === ultimo) {
        ev.preventDefault();
        primeiro.focus();
      }
    });

    return caixa;
  }

  function fecharSobreposicao(silencioso) {
    if (!sobreposicao) return;
    var s = sobreposicao;
    sobreposicao = null;
    s.veu.remove();
    s.el.remove();
    destravarPagina();
    if (silencioso) return;

    var alvo = null;
    if (s.focoAnterior && s.focoAnterior !== document.body && document.contains(s.focoAnterior)) {
      alvo = s.focoAnterior;
    } else if (s.voltarFoco) {
      alvo = document.querySelector(s.voltarFoco);
    }
    if (alvo) alvo.focus({ preventScroll: true });
  }

  /* Todas as fotos de um prato, na ordem em que a galeria as mostra. A
   * primeira é a mesma que aparece na lista; as outras são outros quadros DO
   * MESMO PRATO, e só existem onde o ensaio tinha mais de um aproveitável.
   * Quando há uma só, não há galeria: uma seta que não leva a lugar nenhum é
   * pior que nenhuma seta. */
  function fotosDoItem(item) {
    if (!item.foto) return [];
    var lista = [{ src: item.foto, alt: item.fotoAlt || item.nome, foco: item.foco }];
    (item.outrasFotos || []).forEach(function (f) {
      lista.push({ src: f.src, alt: f.alt || item.nome, foco: f.foco });
    });
    return lista;
  }

  function galeriaHtml(fotos) {
    if (!fotos.length) return '';
    var varias = fotos.length > 1;

    var quadros = fotos
      .map(function (f, i) {
        return (
          '<figure class="galeria__quadro">' +
            fotoHtml(f.src, f.alt, f.foco, 1000, 750) +
            '<figcaption class="oculto-visual">Foto ' + (i + 1) + ' de ' + fotos.length +
            '</figcaption>' +
          '</figure>'
        );
      })
      .join('');

    return (
      '<div class="galeria" data-galeria data-varias="' + (varias ? 'true' : 'false') + '">' +
        '<div class="galeria__trilho" data-trilho' +
          (varias ? ' tabindex="0" role="group" aria-label="Fotos do prato"' : '') + '>' +
          quadros +
        '</div>' +
        (varias
          ? '<button type="button" class="galeria__seta galeria__seta--tras" ' +
              'data-passo="-1" aria-label="Foto anterior">' + ico.voltar + '</button>' +
            '<button type="button" class="galeria__seta galeria__seta--frente" ' +
              'data-passo="1" aria-label="Próxima foto">' + ico.voltar + '</button>' +
            '<p class="galeria__conta" data-conta aria-hidden="true">1/' + fotos.length + '</p>'
          : '') +
        '<button type="button" class="galeria__lupa" data-ampliar ' +
          'aria-label="Ampliar a foto">' + ico.lupa + '</button>' +
      '</div>'
    );
  }

  /* Detalhe do prato: painel com rota própria, para o botão Voltar do
   * navegador fechar o painel e devolver a lista no mesmo ponto. */
  function abrirPrato(idServico, idItem) {
    var achado = acharItem(idServico, idItem);
    if (!achado) {
      window.location.hash = '#/cardapio/' + idServico;
      return;
    }
    var s = achado.servico;
    var item = achado.item;
    var fotos = fotosDoItem(item);

    var preco;
    if (s.tipo === 'fixo') {
      preco =
        '<span class="detalhe__incluso">Incluso no almoço executivo</span>' +
        (item.suplemento
          ? '<span class="prato__selo">Suplemento de ' + dinheiro(item.suplemento) + '</span>'
          : '');
    } else {
      preco = precoDoItem(item);
    }

    var html =
      '<div class="sheet__pega" aria-hidden="true"></div>' +
      '<button type="button" class="sheet__fechar" data-fechar aria-label="Fechar" data-foco-inicial>' +
        ico.fechar + '</button>' +
      '<div class="sheet__rolagem">' +
        galeriaHtml(fotos) +
        /* Nome, preço e descrição encostados na primeira foto: o painel é
         * sobre o prato, e a foto é a abertura dele, não a tela inteira. */
        '<div class="detalhe__corpo">' +
          '<p class="detalhe__eyebrow">' + h(s.curto) + ' · ' + h(achado.categoria.nome) + '</p>' +
          '<h2 class="detalhe__nome" id="titulo-prato">' + h(item.nome) + '</h2>' +
          '<p class="detalhe__preco">' + preco + '</p>' +
          '<p class="detalhe__desc">' + h(item.descricao) + '</p>' +
          (item.nota ? '<p class="detalhe__nota">' + h(item.nota) + '</p>' : '') +
          '<p class="detalhe__rodape">Não listamos alergênicos nesta versão. ' +
          'Avise o salão sobre qualquer restrição alimentar.</p>' +
        '</div>' +
      '</div>' +
      '<div class="sheet__pe">' +
        '<button type="button" class="btn btn--vazado btn--bloco" data-fechar>Voltar ao cardápio</button>' +
      '</div>';

    var caixa = abrirSobreposicao(html, function () {
      // Fechar = voltar na história, para o botão do navegador ficar coerente.
      voltarOuIrPara('#/cardapio/' + s.id);
    });
    caixa.setAttribute('aria-labelledby', 'titulo-prato');
    // Ao fechar, o foco volta para o próprio item da lista — mesmo quando o
    // painel foi aberto por teclado, link direto ou botão Voltar.
    sobreposicao.voltarFoco = 'a[href="#/cardapio/' + s.id + '/' + item.id + '"]';

    ligarGaleria(caixa, fotos);

    $$('[data-fechar]', caixa).forEach(function (btn) {
      btn.addEventListener('click', function () {
        voltarOuIrPara('#/cardapio/' + s.id);
      });
    });
  }

  /* Galeria: trilho com encaixe horizontal (o dedo arrasta, as setas andam de
   * um em um) e um contador discreto no canto. A posição vem da rolagem do
   * próprio trilho — não há índice guardado em lugar nenhum para dessincronizar
   * com o que está na tela. */
  function ligarGaleria(caixa, fotos) {
    var galeria = $('[data-galeria]', caixa);
    if (!galeria) return;
    var trilho = $('[data-trilho]', galeria);
    var conta = $('[data-conta]', galeria);

    function indice() {
      if (!trilho.clientWidth) return 0;
      return Math.min(
        fotos.length - 1,
        Math.max(0, Math.round(trilho.scrollLeft / trilho.clientWidth))
      );
    }

    function irPara(i, suave) {
      var alvo = Math.min(fotos.length - 1, Math.max(0, i));
      var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      trilho.scrollTo({
        left: alvo * trilho.clientWidth,
        behavior: suave && !quieto ? 'smooth' : 'auto'
      });
    }

    function atualizar() {
      var i = indice();
      if (conta) conta.textContent = i + 1 + '/' + fotos.length;
      $$('[data-passo]', galeria).forEach(function (b) {
        var destino = i + Number(b.dataset.passo);
        b.disabled = destino < 0 || destino > fotos.length - 1;
      });
    }

    $$('[data-passo]', galeria).forEach(function (b) {
      b.addEventListener('click', function () {
        irPara(indice() + Number(b.dataset.passo), true);
      });
    });

    if (trilho) {
      trilho.addEventListener('scroll', atualizar, { passive: true });
      /* Setas do teclado só quando o trilho tem o foco: dentro do painel elas
       * não disputam com nada, e fora dele não são capturadas. */
      trilho.addEventListener('keydown', function (ev) {
        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
        ev.preventDefault();
        irPara(indice() + (ev.key === 'ArrowRight' ? 1 : -1), true);
      });
    }

    var lupa = $('[data-ampliar]', galeria);
    if (lupa) {
      lupa.addEventListener('click', function () {
        abrirZoom(fotos, indice(), function (i) {
          irPara(i, false);
          lupa.focus({ preventScroll: true });
        });
      });
    }

    atualizar();
  }

  /* Ampliação: uma camada por cima de tudo, com a foto inteira à vista
   * (`contain`, não `cover` — ampliar para cortar não seria ampliar). Fecha no
   * Esc, no véu e no botão, e devolve à galeria a foto em que parou. */
  function abrirZoom(fotos, inicial, aoFechar) {
    var i = inicial;
    var focoAnterior = document.activeElement;

    var camada = document.createElement('div');
    camada.className = 'zoom';
    camada.setAttribute('role', 'dialog');
    camada.setAttribute('aria-modal', 'true');
    camada.setAttribute('aria-label', 'Foto ampliada');

    var varias = fotos.length > 1;
    camada.innerHTML =
      '<button type="button" class="zoom__fechar" data-zoom-fechar aria-label="Fechar a foto ampliada">' +
        ico.fechar + '</button>' +
      '<figure class="zoom__quadro"><img data-zoom-img src="" alt="" /></figure>' +
      (varias
        ? '<div class="zoom__pe">' +
            '<button type="button" class="zoom__seta" data-zoom-passo="-1" aria-label="Foto anterior">' +
              ico.voltar + '</button>' +
            '<p class="zoom__conta" data-zoom-conta></p>' +
            '<button type="button" class="zoom__seta zoom__seta--frente" data-zoom-passo="1" ' +
              'aria-label="Próxima foto">' + ico.voltar + '</button>' +
          '</div>'
        : '');

    document.body.appendChild(camada);

    var img = $('[data-zoom-img]', camada);
    var conta = $('[data-zoom-conta]', camada);

    function pintar() {
      img.src = fotos[i].src;
      img.alt = fotos[i].alt;
      if (conta) conta.textContent = i + 1 + ' de ' + fotos.length;
      $$('[data-zoom-passo]', camada).forEach(function (b) {
        var destino = i + Number(b.dataset.zoomPasso);
        b.disabled = destino < 0 || destino > fotos.length - 1;
      });
    }

    function fechar() {
      camada.remove();
      document.removeEventListener('keydown', naTecla, true);
      if (aoFechar) aoFechar(i);
      else if (focoAnterior && document.contains(focoAnterior)) focoAnterior.focus();
    }

    function naTecla(ev) {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        ev.stopPropagation();
        fechar();
        return;
      }
      if (!varias) return;
      if (ev.key === 'ArrowRight' && i < fotos.length - 1) { i++; pintar(); }
      if (ev.key === 'ArrowLeft' && i > 0) { i--; pintar(); }
    }

    $$('[data-zoom-passo]', camada).forEach(function (b) {
      b.addEventListener('click', function () {
        i = Math.min(fotos.length - 1, Math.max(0, i + Number(b.dataset.zoomPasso)));
        pintar();
      });
    });

    camada.addEventListener('click', function (ev) {
      if (ev.target === camada || ev.target.closest('[data-zoom-fechar]')) fechar();
    });

    /* Captura antes do painel de baixo: o Esc fecha a ampliação, não o prato. */
    document.addEventListener('keydown', naTecla, true);

    pintar();
    $('[data-zoom-fechar]', camada).focus();
  }

  /* Folha "Ir para": NAVEGAÇÃO, não seleção. As seções desta carta e, abaixo,
   * as outras cartas — que aqui são apenas atalhos para o topo de outra
   * página. O seletor de carta continua sendo um só: as abas. */
  function abrirIrPara() {
    var atual = servicoAtual();
    var catAtual = categoriaVisivel();

    var secoes = atual.categorias
      .map(function (c) {
        var marcado = c.id === catAtual;
        return (
          '<li><button type="button" class="op" data-cat="' + c.id + '" ' +
          'aria-current="' + (marcado ? 'true' : 'false') + '"' +
          (marcado ? ' data-foco-inicial' : '') + '>' +
            '<span class="op__nome">' + h(c.nome) + '</span>' +
            '<span class="op__extra">' + c.itens.length +
              (c.itens.length === 1 ? ' item' : ' itens') + '</span>' +
            (marcado ? '<span class="op__marca">' + ico.check + '</span>' : '') +
          '</button></li>'
        );
      })
      .join('');

    /* Duas coisas diferentes, e a folha diz qual é qual: em cima, pular para
     * uma seção DESTA carta (a página não muda); embaixo, TROCAR de carta (a
     * página muda inteira). Cada linha de baixo leva o número de itens e a
     * palavra "carta", para o salto não pegar ninguém de surpresa. */
    var outras = D.servicos
      .filter(function (s) { return s.id !== atual.id; })
      .map(function (s) {
        var itens = s.categorias.reduce(function (n, c) { return n + c.itens.length; }, 0);
        return (
          '<li><button type="button" class="op op--carta" data-servico="' + s.id + '">' +
            '<span class="op__nome">' + h(s.nome) + '</span>' +
            '<span class="op__extra">' + itens + (itens === 1 ? ' item' : ' itens') +
              ' · ' + h(s.quando) + '</span>' +
            '<span class="op__ida" aria-hidden="true">' + ico.voltar + '</span>' +
          '</button></li>'
        );
      })
      .join('');

    var caixa = abrirSobreposicao(
      '<div class="sheet__pega" aria-hidden="true"></div>' +
      '<h2 class="sheet__titulo" id="titulo-ir">Índice</h2>' +
      '<div class="sheet__rolagem">' +
        /* A busca desceu da barra para cá. Ao lado do "Índice" ela era uma
         * segunda porta para a mesma coisa — buscar é uma forma de percorrer o
         * sumário —, e o alto do cardápio ficou com um controle só. */
        '<ul class="lista-op">' +
          '<li><button type="button" class="op op--carta" data-busca>' +
            '<span class="op__nome">Buscar no cardápio</span>' +
            '<span class="op__extra">Por prato ou ingrediente, em todas as cartas</span>' +
            '<span class="op__lupa" aria-hidden="true">' + ico.busca + '</span>' +
          '</button></li>' +
        '</ul>' +
        '<p class="sheet__grupo">Categorias desta carta · ' + h(atual.nome) + '</p>' +
        '<ul class="lista-op">' + secoes + '</ul>' +
        '<p class="sheet__grupo">Outras cartas</p>' +
        '<ul class="lista-op">' + outras + '</ul>' +
      '</div>'
    );
    caixa.setAttribute('aria-labelledby', 'titulo-ir');

    $$('[data-busca]', caixa).forEach(function (btn) {
      btn.addEventListener('click', function () {
        fecharSobreposicao(true);
        window.location.hash = '#/busca';
      });
    });

    $$('[data-cat]', caixa).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.cat;
        fecharSobreposicao(true);
        irParaCategoria(id);
      });
    });

    $$('[data-servico]', caixa).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.servico;
        fecharSobreposicao(true);
        window.location.hash = '#/cardapio/' + id;
      });
    });
  }

  /* === Busca ============================================================= */

  function normalizar(t) {
    return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function buscar(termo) {
    var alvo = normalizar(termo.trim());
    if (alvo.length < 2) return null;
    var achados = [];
    D.servicos.forEach(function (s) {
      s.categorias.forEach(function (c) {
        c.itens.forEach(function (it) {
          var texto = normalizar(it.nome + ' ' + it.descricao + ' ' + c.nome);
          if (texto.indexOf(alvo) !== -1) {
            achados.push({ servico: s, categoria: c, item: it });
          }
        });
      });
    });
    return achados;
  }

  function realcar(texto, termo) {
    var alvo = normalizar(termo.trim());
    var base = normalizar(texto);
    var i = base.indexOf(alvo);
    if (i === -1 || alvo.length < 2) return h(texto);
    return (
      h(texto.slice(0, i)) + '<mark>' + h(texto.slice(i, i + alvo.length)) + '</mark>' +
      h(texto.slice(i + alvo.length))
    );
  }

  function montarBusca() {
    var caixa = document.createElement('div');
    caixa.className = 'busca';
    caixa.setAttribute('role', 'dialog');
    caixa.setAttribute('aria-modal', 'true');
    caixa.setAttribute('aria-label', 'Buscar no cardápio');
    caixa.innerHTML =
      '<div class="busca__topo">' +
        '<label class="oculto-visual" for="campo-busca">Buscar prato ou ingrediente</label>' +
        '<input class="busca__campo" id="campo-busca" type="search" ' +
          'placeholder="Buscar prato ou ingrediente" autocomplete="off" />' +
        '<button type="button" class="icone-btn" data-fechar aria-label="Fechar busca">' + ico.fechar + '</button>' +
      '</div>' +
      '<div class="busca__resultados"><div class="wrap" id="saida-busca">' +
        '<p class="busca__dica">Digite ao menos duas letras. A busca procura em ' +
        'todas as cartas: executivo, jantar e vinhos.</p>' +
      '</div></div>';

    document.body.appendChild(caixa);
    travarPagina();
    sobreposicao = { el: caixa, veu: { remove: function () {} }, focoAnterior: document.activeElement };

    var campo = $('#campo-busca', caixa);
    var saida = $('#saida-busca', caixa);

    function render() {
      var termo = campo.value;
      var achados = buscar(termo);

      if (achados === null) {
        saida.innerHTML =
          '<p class="busca__dica">Digite ao menos duas letras. A busca procura em ' +
          'todas as cartas: executivo, jantar e vinhos.</p>';
        return;
      }

      if (!achados.length) {
        saida.innerHTML =
          '<div class="busca__vazio">' +
            '<h2>Nada com “' + h(termo.trim()) + '”</h2>' +
            '<p>Nenhum prato ou vinho do cardápio tem esse nome. Tente outra ' +
            'palavra, ou percorra as cartas.</p>' +
          '</div>';
        anuncia('Nenhum resultado para ' + termo.trim());
        return;
      }

      var porServico = {};
      achados.forEach(function (a) {
        (porServico[a.servico.id] = porServico[a.servico.id] || []).push(a);
      });

      var html = '';
      D.servicos.forEach(function (s) {
        var lista = porServico[s.id];
        if (!lista) return;
        html += '<p class="busca__grupo">' + h(s.nome) + '</p><div class="pratos">';
        lista.forEach(function (a) {
          // Mesma regra de preço da lista: um resultado de busca não pode
          // apresentar o mesmo item de outro jeito.
          var formas = formasDePreco(s, a.item);
          html +=
            '<article class="prato">' +
              '<div class="prato__thumb">' +
                (a.item.foto ? fotoHtml(a.item.foto, '', a.item.foco, 300, 300) : '') +
              '</div>' +
              '<div class="prato__texto">' +
                '<p class="prato__topo">' +
                  '<a class="prato__link prato__nome" href="#/cardapio/' + s.id + '/' + a.item.id + '">' +
                    realcar(a.item.nome, termo) + '</a>' +
                  (formas.linha ? '<span class="prato__preco">' + formas.linha + '</span>' : '') +
                '</p>' +
                '<p class="prato__desc">' + h(a.categoria.nome) + ' · ' + h(a.item.descricao) + '</p>' +
                formas.bloco +
              '</div>' +
            '</article>';
        });
        html += '</div>';
      });
      saida.innerHTML = html;
      anuncia(achados.length + (achados.length === 1 ? ' resultado' : ' resultados'));
    }

    campo.addEventListener('input', render);
    campo.focus();

    function fecharBusca() {
      voltarOuIrPara('#/cardapio/' + estado.servico);
    }

    $$('[data-fechar]', caixa).forEach(function (b) {
      b.addEventListener('click', fecharBusca);
    });

    caixa.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        fecharBusca();
      }
    });
  }

  /* === Rotas ============================================================= */

  function lerRota() {
    var bruto = window.location.hash.replace(/^#\/?/, '');
    // Âncora de categoria: não é rota, é rolagem dentro da mesma vista.
    if (bruto.indexOf('cat-') === 0) return null;
    return bruto.split('/').filter(Boolean);
  }

  function desenhar() {
    var partes = lerRota();
    if (partes === null) return; // âncora

    // Rota vazia: `/menu/` e o acesso pelo QR entram direto no cardápio.
    if (!partes.length) {
      if (estado.mesa || /\/menu\/?$/.test(window.location.pathname)) {
        history.replaceState(null, '', window.location.pathname + window.location.search + '#/cardapio');
        partes = ['cardapio'];
      } else {
        partes = [''];
      }
    }

    var raizRota = partes[0];

    // --- Busca: sobrepõe o cardápio sem redesenhá-lo.
    if (raizRota === 'busca') {
      if (estado.vista !== 'cardapio:' + estado.servico) {
        raiz.innerHTML = vistaCardapio();
        estado.vista = 'cardapio:' + estado.servico;
        ligarCardapio();
      }
      if (!sobreposicao || !sobreposicao.el.classList.contains('busca')) {
        fecharSobreposicao(true);
        montarBusca();
      }
      return;
    }

    if (raizRota === 'cardapio') {
      var idServico = partes[1];
      if (idServico && acharServico(idServico)) {
        estado.servico = idServico;
        /* Guarda a refeição para a carta de vinhos saber por onde devolver. */
        if (!acharServico(idServico).foraDasAbas) estado.servicoBase = idServico;
      }

      var assinatura = 'cardapio:' + estado.servico;
      var trocou = estado.vista !== assinatura;

      if (trocou) {
        fecharSobreposicao(true);
        raiz.innerHTML = vistaCardapio();
        estado.vista = assinatura;
        ligarCardapio();
        window.scrollTo(0, 0);
        anuncia('Carta: ' + servicoAtual().nome);
      }

      var idItem = partes[2];
      if (idItem) {
        // Se já há um painel aberto do mesmo prato, não reabre.
        if (!sobreposicao || sobreposicao.prato !== idItem) {
          fecharSobreposicao(true);
          abrirPrato(estado.servico, idItem);
          if (sobreposicao) sobreposicao.prato = idItem;
        }
      } else {
        fecharSobreposicao();
      }
      return;
    }

    fecharSobreposicao(true);

    /* Saindo da carta: o ouvinte de rolagem da portada não tem mais o que
     * medir, e a classe de movimento não pode ficar pendurada na raiz. */
    if (soltarPortada) soltarPortada();

    if (raizRota === 'reserva') {
      /* A entrada integrada publica somente o cardapio. O mockup de reserva
       * continua intacto na raiz do app para estudo, mas nao pode ser aberto
       * por hash salvo, refresh ou digitacao direta em `/menu/`. */
      if (ehMenuPublico()) {
        window.location.replace('#/cardapio');
        return;
      }

      var passo = partes[1] || 'disponibilidade';

      if (passo === 'confirmada') {
        if (!estado.reserva.data || !estado.reserva.hora || !estado.reserva.nome) {
          window.location.replace('#/reserva');
          return;
        }
        raiz.innerHTML = vistaConfirmada();
        estado.vista = 'confirmada';
        window.scrollTo(0, 0);
        return;
      }

      /* `revisao` era uma tela própria e virou o topo da tela de dados. O
       * endereço antigo continua respondendo, para um link guardado não cair
       * no vazio. */
      if (passo === 'revisao') {
        passo = 'dados';
        history.replaceState(null, '', '#/reserva/dados');
      }

      // Não deixa cair no meio do fluxo sem a mesa escolhida.
      if (passo === 'dados' && !estado.reserva.hora) {
        passo = 'disponibilidade';
        history.replaceState(null, '', '#/reserva');
      }

      raiz.innerHTML = vistaReserva(passo);
      estado.vista = 'reserva:' + passo;
      ligarReserva(passo);
      window.scrollTo(0, 0);
      return;
    }

    if (raizRota === 'visita') {
      raiz.innerHTML = vistaVisita();
      estado.vista = 'visita';
      window.scrollTo(0, 0);
      return;
    }

    // Capa
    raiz.innerHTML = vistaCapa();
    estado.vista = 'capa';
    window.scrollTo(0, 0);
  }

  /* --- Ligações de cada vista --- */

  function ligarCardapio() {
    // As abas são links: o roteador cuida delas, e o Voltar do navegador anda
    // entre as cartas sozinho.
    $$('[data-ir]').forEach(function (btn) {
      btn.addEventListener('click', abrirIrPara);
    });
    ligarPortada();
    ligarFaixasPresas();
  }

  /*
   * QUAL FAIXA DE SEÇÃO ESTÁ PRESA NO ALTO.
   *
   * Serve a uma coisa só: o chevron do índice aparece na faixa que está grudada
   * embaixo da barra, e em nenhuma outra. Solta, no meio da rolagem, a faixa é
   * um título de seção e mais nada — um ícone repetido quatro vezes ao longo da
   * carta seria enfeite. Presa no alto, ela é a barra de navegação da carta, e
   * aí o índice pertence a ela.
   *
   * Não há ouvinte de rolagem: `position: sticky` continua fazendo o trabalho
   * visual sozinho, e isto aqui só descobre QUANDO a faixa encostou. O truque é
   * encolher o topo do root em (teto + 1) px — assim a faixa presa fica com 1px
   * para fora e deixa de intersectar por inteiro, o que dispara o observador.
   *
   * O observador avisa a travessia; quem responde "está presa?" é a posição,
   * porque uma faixa parada lá embaixo também não intersecta.
   */
  var soltarFaixas = null;

  function ligarFaixasPresas() {
    if (soltarFaixas) soltarFaixas();

    var faixas = $$('.categoria__cabeca');
    if (!faixas.length || typeof IntersectionObserver !== 'function') return;

    var teto = Math.round(alturaBarra());

    var obs = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          var presa = e.boundingClientRect.top <= teto + 1;
          e.target.classList.toggle('is-presa', presa);
        });
      },
      { threshold: [0, 1], rootMargin: '-' + (teto + 1) + 'px 0px 0px 0px' }
    );

    faixas.forEach(function (f) {
      obs.observe(f);
    });

    function soltar() {
      obs.disconnect();
      if (soltarFaixas === soltar) soltarFaixas = null;
    }

    soltarFaixas = soltar;
  }

  /*
   * A portada saindo de cena.
   *
   * Duas coisas dependem de a foto ter passado, e são degraus: a barra deixa de
   * ser transparente (senão a marca ficaria branca sobre o creme) e o convite
   * "Reservar" aparece. Quem avisa a travessia é o observador, sem ouvinte de
   * rolagem — nenhuma das duas precisa saber QUAL seção está sendo lida, e isso
   * quem resolve é o `position: sticky` do próprio título.
   *
   * O que a travessia sozinha não dá é a PASSAGEM: com só o degrau, a marca
   * fica parada como barra fixa enquanto a foto e o título vão embora por baixo
   * dela, e a chapa escura chega depois, como um susto. Daí `ligarParalaxe`,
   * abaixo: um número contínuo de 0 a 1 para o CSS animar a saída. O degrau
   * continua sendo o degrau; o número é só o caminho até ele.
   *
   * A versão anterior media a rolagem a cada quadro para escrever o NOME DA
   * SEÇÃO dentro da barra — isso não voltou, e não deve voltar: era texto
   * mudando durante a leitura. O ouvinte de agora escreve uma variável e nada
   * mais; quem desenha é o CSS.
   */
  var soltarPortada = null;

  function ligarPortada() {
    if (soltarPortada) soltarPortada();

    var barra = $('.barra--carta');
    var capa = $('.servico-capa');
    if (!barra || !capa || typeof IntersectionObserver !== 'function') return;

    var flutua = $('.reservar-flutua');

    var obs = new IntersectionObserver(
      function (entradas) {
        var passou = !entradas[0].isIntersecting;
        barra.classList.toggle('is-rolada', passou);
        if (flutua) flutua.classList.toggle('is-visivel', passou);
      },
      /* A foto conta como "na tela" enquanto sobrar dela mais do que a altura
       * da barra: é o ponto em que a marca deixaria de ter foto por baixo. */
      { rootMargin: '-' + Math.round(alturaBarra()) + 'px 0px 0px 0px' }
    );

    obs.observe(capa);

    /* Quem pediu menos movimento fica com o degrau e mais nada: a chapa entra
     * pela transição curta do CSS, sem paralaxe e sem ouvinte de rolagem. */
    var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var soltarMovimento = quieto ? null : ligarParalaxe(capa);

    /* Nomeada, e não `arguments.callee`: o arquivo está em modo estrito. Se uma
     * vista nova já tiver assumido o lugar, este desliga a si mesmo em vez de
     * desligar o observador do sucessor. */
    function soltar() {
      obs.disconnect();
      if (soltarMovimento) soltarMovimento();
      if (soltarPortada === soltar) soltarPortada = null;
    }

    soltarPortada = soltar;
  }

  /*
   * O quanto a portada já saiu, de 0 a 1, escrito em `--portada-p` na raiz.
   *
   * Só isso. O deslocamento da foto, o do título, o da marca e a entrada da
   * chapa são todos `calc()` em cima desse número, no CSS — assim o ajuste fino
   * do movimento se faz onde o resto do desenho está, e este arquivo não
   * guarda nenhum pixel de estética.
   *
   * `scrollY` serve de medida direta porque a carta começa colada no alto: a
   * barra é fixa e transparente POR CIMA da foto, então o tanto que a página
   * rolou é o tanto que a portada subiu. O fim do percurso é a portada menos a
   * barra — o ponto em que a foto acaba de passar por baixo dela, o mesmo em
   * que o observador acende `is-rolada`. Os dois chegam juntos de propósito.
   *
   * A escrita é uma variável por quadro, no máximo, e só quando o número mudou
   * na terceira casa: rolagem passiva, `requestAnimationFrame` para não
   * escrever no meio do quadro e nenhuma leitura de layout durante a rolagem
   * (a altura é medida antes e no redimensionamento).
   */
  function ligarParalaxe(capa) {
    var raiz = document.documentElement;
    var saida = 1;
    var ultimo = -1;
    var pedido = 0;

    function medir() {
      saida = Math.max(1, capa.offsetHeight - alturaBarra());
    }

    function pintar() {
      pedido = 0;
      var p = Math.min(1, Math.max(0, window.scrollY / saida));
      p = Math.round(p * 1000) / 1000;
      if (p === ultimo) return;
      ultimo = p;
      raiz.style.setProperty('--portada-p', String(p));
    }

    function aoRolar() {
      if (pedido) return;
      pedido = requestAnimationFrame(pintar);
    }

    function aoRedimensionar() {
      medir();
      ultimo = -1;
      aoRolar();
    }

    medir();
    pintar();
    raiz.classList.add('portada-viva');
    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', aoRedimensionar);

    return function () {
      if (pedido) cancelAnimationFrame(pedido);
      window.removeEventListener('scroll', aoRolar);
      window.removeEventListener('resize', aoRedimensionar);
      raiz.classList.remove('portada-viva');
      raiz.style.removeProperty('--portada-p');
    };
  }

  function ligarReserva(passo) {
    var form = $('#form-reserva');
    if (!form) return;
    var r = estado.reserva;

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      if (passo === 'disponibilidade') {
        /* A barra só aparece com horário escolhido, mas a validação continua:
         * o horário pode ter caído entre o desenho da tela e o envio. */
        if (!r.data || !r.hora) {
          estado.erros.data = 'Escolha um dia e um horário para continuar.';
          redesenharReserva('disponibilidade');
          var alvo = $('#erro-data');
          if (alvo) alvo.scrollIntoView({ block: 'center', behavior: 'smooth' });
          anuncia(estado.erros.data);
          return;
        }
        estado.erros = {};
        window.location.hash = '#/reserva/dados';
        return;
      }

      colherDados();
      var erros = {};
      if (r.nome.trim().length < 2) erros.nome = 'Diga o nome da reserva.';
      var digitos = r.telefone.replace(/\D/g, '');
      if (!digitos) erros.telefone = 'Informe um telefone de contato.';
      else if (digitos.length < 10) erros.telefone = 'Telefone incompleto — inclua o DDD.';
      if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) {
        erros.email = 'Verifique o e-mail: parece faltar algo.';
      }
      estado.erros = erros;

      if (Object.keys(erros).length) {
        redesenharReserva('dados');
        var primeiro = $('[aria-invalid="true"]');
        if (primeiro) {
          primeiro.focus();
          primeiro.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
        anuncia('A reserva tem campos por preencher.');
        return;
      }

      // Revisão e confirmação na mesma tela: nada sai daqui.
      window.location.hash = '#/reserva/confirmada';
    });

    if (passo === 'disponibilidade') {
      /* Setas andam pela grade; Enter e espaço escolhem, porque as células já
       * são botões. Dias travados são pulados: parar num dia que não se pode
       * escolher só gasta o gesto de quem navega por teclado. */
      form.addEventListener('keydown', function (ev) {
        var cel = ev.target.closest && ev.target.closest('.cal__dia[data-data]');
        if (!cel) return;
        var passos = {
          ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7,
          PageDown: 'mes+', PageUp: 'mes-'
        };
        var passo = passos[ev.key];
        if (passo === undefined) return;
        ev.preventDefault();

        if (passo === 'mes+' || passo === 'mes-') {
          var alvoMes = deslocarMes(r.mes, passo === 'mes+' ? 1 : -1);
          if (alvoMes < MES_MIN || alvoMes > MES_MAX) return;
          r.mes = alvoMes;
          redesenharReserva('disponibilidade');
          anuncia(nomeDoMes(r.mes));
          focarDeVolta('.cal__dia[tabindex="0"]', '.cal__dia[data-data]');
          return;
        }

        var base = dataDeChave(cel.dataset.data);
        for (var n = 1; n <= 40; n++) {
          var alvo = new Date(base.getTime());
          alvo.setDate(alvo.getDate() + passo * n);
          var chave = chaveData(alvo);
          if (passouNoDia(chave)) return;
          if (chave.slice(0, 7) !== r.mes) {
            /* Andou para fora do mês visível: vira o mês e continua de lá. */
            var novo = chave.slice(0, 7);
            if (novo < MES_MIN || novo > MES_MAX) return;
            if (fechadoNoDia(chave)) continue;
            r.mes = novo;
            redesenharReserva('disponibilidade');
            anuncia(nomeDoMes(r.mes));
            focarDeVolta('[data-data="' + chave + '"]', '.cal__dia[data-data]');
            return;
          }
          var proxima = $('[data-data="' + chave + '"]');
          if (proxima) {
            $$('.cal__dia[data-data]').forEach(function (b) {
              b.setAttribute('tabindex', b === proxima ? '0' : '-1');
            });
            proxima.focus();
            return;
          }
        }
      });

      form.addEventListener('click', function (ev) {
        var bp = ev.target.closest('[data-pessoas]');
        if (bp) {
          var novo = Math.min(
            PESSOAS_MAX,
            Math.max(PESSOAS_MIN, r.pessoas + Number(bp.dataset.pessoas))
          );
          if (novo === r.pessoas) return;
          r.pessoas = novo;
          estado.erros = {};
          var recado = pluralPessoas(r.pessoas);
          /* Mudou o tamanho da mesa: a simulação é refeita e o horário
           * escolhido pode não valer mais para o grupo novo. */
          if (revalidarHorario()) {
            recado += '. O horário escolhido não atende esta mesa; escolha outro.';
          }
          redesenharReserva('disponibilidade');
          anuncia(recado);
          focarDeVolta('[data-pessoas="' + bp.dataset.pessoas + '"]', '[data-pessoas]');
          return;
        }

        var nav = ev.target.closest('[data-mes]');
        if (nav) {
          var direcao = Number(nav.dataset.mes);
          r.mes = deslocarMes(r.mes, direcao);
          redesenharReserva('disponibilidade');
          anuncia(nomeDoMes(r.mes));
          /* O foco fica na seta usada; se ela chegou ao limite e desabilitou,
           * passa para a outra, para o teclado nunca ficar sem apoio. */
          focarDeVolta('[data-mes="' + direcao + '"]', '[data-mes]');
          return;
        }

        var bd = ev.target.closest('[data-data]');
        if (bd) {
          var chave = bd.dataset.data;
          if (r.data !== chave) {
            r.hora = null;
            r.turno = null;
          }
          r.data = chave;
          r.mes = chave.slice(0, 7);
          estado.erros = {};
          redesenharReserva('disponibilidade');
          anuncia(
            maiusculaInicial(dataLonga(chave)) + ': ' +
            servicosDoDia(chave, r.pessoas) + '.'
          );
          focarDeVolta('[data-data="' + chave + '"]', '.cal__dia:not([disabled])');
          /* Sem avanço automático e sem pulo: os horários entram embaixo do
           * calendário, e a página só se move se eles estiverem fora da vista. */
          trazerHorarios();
          return;
        }

        var bh = ev.target.closest('[data-hora]');
        if (bh) {
          r.hora = bh.dataset.hora;
          r.turno = bh.dataset.turno;
          estado.erros = {};
          redesenharReserva('disponibilidade');
          anuncia(rotuloReserva() + '. Toque em Continuar.');
          focarDeVolta('[data-hora="' + r.hora + '"]', '.hora');
        }
      });
    }

    if (passo === 'dados') {
      // Guarda o que foi digitado ao sair de cada campo, para o Voltar do
      // navegador nunca devolver um formulário vazio.
      form.addEventListener('change', colherDados);
      form.addEventListener('input', colherDados);
    }
  }

  /* Devolve o foco ao controle equivalente depois de redesenhar. Sem isto, a
   * cada toque o foco voltaria para o começo do documento — e navegar o
   * calendário pelo teclado seria impossível. */
  function focarDeVolta(seletor, reserva) {
    var alvo = $(seletor + ':not([disabled])') || (reserva ? $(reserva) : null);
    if (alvo) alvo.focus({ preventScroll: true });
  }

  /* O horário escolhido continua de pé? Devolve `true` quando teve de cair. */
  function revalidarHorario() {
    var r = estado.reserva;
    if (!r.data || !r.hora) return false;
    var vago = turnosDoDia(r.data, r.pessoas).some(function (t) {
      return t.horas.indexOf(r.hora) !== -1;
    });
    if (vago) return false;
    r.hora = null;
    r.turno = null;
    return true;
  }

  /* Rola só quando precisa: se o bloco de horários já está à vista — sempre, no
   * desktop, onde ele fica ao lado do calendário —, a página fica parada. */
  function trazerHorarios() {
    var bloco = $('#bloco-horas');
    if (!bloco) return;
    var caixa = bloco.getBoundingClientRect();
    var teto = alturaBarra() + 12;
    if (caixa.top >= teto && caixa.top <= window.innerHeight * 0.62) return;
    rolarPara(window.scrollY + caixa.top - teto);
  }

  function colherDados() {
    var r = estado.reserva;
    ['nome', 'telefone', 'email', 'ocasiao', 'ambiente', 'observacao'].forEach(function (campo) {
      var el = document.getElementById(campo);
      if (el) r[campo] = el.value;
    });
  }

  /* Redesenha só o formulário, sem mexer na rota nem na rolagem da página. */
  function redesenharReserva(passo) {
    var scroll = window.scrollY;
    raiz.innerHTML = vistaReserva(passo);
    ligarReserva(passo);
    window.scrollTo(0, scroll);
  }

  /* === Início ============================================================ */

  window.addEventListener('hashchange', function () {
    passosNaHistoria++;
    desenhar();
  });
  desenhar();
})();
