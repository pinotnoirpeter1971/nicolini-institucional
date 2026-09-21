/*
 * Fonte única de conteúdo do protótipo.
 *
 * Regra de ouro: nome, descrição, preço e foto de um item existem AQUI e em
 * nenhum outro lugar. `app.js` só lê. Trocar um preço é trocar uma linha.
 *
 * PROCEDÊNCIA DO CONTEÚDO
 * - `origem: 'casa'`  → texto vindo de apps/institucional/src/data/bistro.js.
 * - `origem: 'demo'`  → escrito para este protótipo, coerente mas fictício.
 * TODOS os preços, horários de serviço e disponibilidade de reserva são
 * demonstrativos. Ver README.md.
 *
 * FOTOGRAFIA
 * Todas as fotos são do ensaio do próprio Bistrô (reference/bistro-originais).
 * Cada prato mostra o que a foto mostra: quando não havia foto de um prato, o
 * prato foi reescrito a partir da foto, e não o contrário.
 *
 * `foco` é o object-position da foto: definido olhando cada imagem, para que
 * nenhum recorte corte o prato. Formato: 'X% Y%'.
 *
 * `outrasFotos` são OUTROS QUADROS DO MESMO PRATO, do mesmo ensaio — nunca de
 * um prato parecido. Alimentam a galeria do painel de detalhe, e só existem
 * onde o ensaio de fato tem mais de um quadro aproveitável: a maioria dos itens
 * (e todos os vinhos) segue com uma foto só, e o painel então não mostra
 * galeria nenhuma.
 */
(function (global) {
  'use strict';

  var casa = {
    nome: 'Bistrô Nicolini',
    /* Marca em duas versoes, ambas brancas (para fundo escuro) e ambas
     * extraidas do mesmo PDF original — ver o comentario dentro dos SVGs.
     * `logo` e o bloco completo; `logoNome` e so o nome, para o cabecalho
     * compacto, onde a legenda "ALTA GASTRONOMIA" nao caberia legivel. */
    logo: 'assets/logo-bistro.svg',
    logoNome: 'assets/logo-bistro-nome.svg',
    endereco: 'Avenida Abramo Randon, 1141 — mezanino do Empório Nicolini',
    cidade: 'Caxias do Sul, RS',
    telefone: { exibicao: '(54) 3029-0217', link: 'tel:+555430290217' },
    whatsapp: { exibicao: '(54) 99959-2314', link: 'https://wa.me/5554999592314' },
    instagram: { exibicao: '@bistronicolini', link: 'https://instagram.com/bistronicolini' },
    /* `dias` são os dias da semana (0 = domingo) que cada linha cobre. É o que
     * permite à capa dizer "hoje, 12h–15h · 19h–23h" a partir da MESMA tabela
     * que a pessoa lê mais abaixo — uma verdade só, num lugar só. */
    horarios: [
      { dia: 'Terça a quinta', hora: '12h–15h · 19h–23h', dias: [2, 3, 4] },
      { dia: 'Sexta e sábado', hora: '12h–15h · 19h–23h30', dias: [5, 6] },
      { dia: 'Domingo', hora: '12h–16h', dias: [0] },
      { dia: 'Segunda', hora: 'Fechado', dias: [1], fechado: true }
    ],
    /* Recorte proprio da foto do salao: o quadro cheio tem quase um terco de
     * teto, que num celular ocupa a tela toda sem dizer nada. Este corta a
     * viga de cima e deixa as mesas, os abajures e as cortinas. */
    capa: {
      src: 'assets/fotos/capa-salao.jpg',
      alt: 'Salão do Bistrô Nicolini à noite, com mesas postas e luminárias acesas',
      foco: '50% 50%'
    },
    ambiente: [
      {
        src: 'assets/fotos/ambiente-mesa-posta.jpg',
        alt: 'Mesa posta com taça e luminária acesa ao fundo',
        foco: '50% 45%'
      },
      {
        src: 'assets/fotos/ambiente-cozinha.jpg',
        alt: 'Prato de massa em primeiro plano com a cozinha ao fundo',
        foco: '50% 58%'
      },
      {
        src: 'assets/fotos/ambiente-adega.jpg',
        alt: 'Rótulos italianos alinhados na adega do bistrô',
        foco: '50% 45%'
      },
      {
        src: 'assets/fotos/ambiente-placa.jpg',
        alt: 'Placa do Bistrô Nicolini na fachada, vista da calçada',
        foco: '50% 40%'
      }
    ]
  };

  /*
   * SERVIÇO ≠ CATEGORIA.
   * Serviço (ou carta) é o que se está consultando: o almoço executivo, o
   * jantar, a carta de vinhos. Categoria é a divisão interna daquele serviço.
   * As abas de serviço são o ÚNICO controle que troca de carta; as categorias
   * só levam a pessoa a um ponto da mesma lista.
   *
   * `tipo: 'fixo'`   → menu de preço fechado; itens não têm preço próprio.
   * `tipo: 'carta'`  → à la carte; cada item tem preço.
   */
  var servicos = [
    {
      id: 'executivo',
      nome: 'Almoço executivo',
      curto: 'Almoço',
      tipo: 'fixo',
      quando: 'Terça a sexta, 12h–15h',
      preco: 89,
      precoNota: 'por pessoa',
      // Explicado uma única vez, aqui. Não se repete em nenhum item.
      nota: 'Entrada do dia, um prato principal e uma sobremesa, à escolha.',
      observacao: 'Couvert e bebidas à parte.',
      foto: {
        src: 'assets/fotos/ambiente-mesa-posta.jpg',
        alt: 'Mesa posta do bistrô com luminária acesa',
        foco: '50% 42%'
      },
      categorias: [
        {
          id: 'principais',
          nome: 'Principais',
          itens: [
            {
              id: 'spaghetti-pomodoro',
              nome: 'Spaghetti al pomodoro',
              descricao: 'Lorem ipsum dolor sit amet.',
              foto: 'assets/fotos/prato-spaghetti.jpg',
              foco: '50% 62%',
              fotoAlt: 'Prato fundo de spaghetti ao molho de tomate, com taça de vinho ao fundo',
              origem: 'demo'
            },
            {
              id: 'file-batatas',
              nome: 'Filé com batatas',
              descricao: 'Lorem ipsum dolor sit amet.',
              foto: 'assets/fotos/prato-file-batatas.jpg',
              foco: '50% 52%',
              fotoAlt: 'Filé em cubos com batatas douradas e farofa no prato branco',
              outrasFotos: [
                {
                  src: 'assets/fotos/prato-file-batatas-2.jpg',
                  alt: 'O prato inteiro visto de cima, com as batatas em volta do filé'
                }
              ],
              origem: 'demo'
            },
            {
              id: 'file-risoto',
              nome: 'Filé com risoto',
              descricao: 'Lorem ipsum dolor sit amet.',
              foto: 'assets/fotos/prato-file-risoto.jpg',
              foco: '50% 55%',
              fotoAlt: 'Medalhão de filé sobre risoto, com chips de batata-doce por cima',
              origem: 'demo'
            },
            {
              id: 'peixe-do-dia-exec',
              nome: 'Peixe do dia',
              descricao: 'Lorem ipsum dolor sit amet.',
              foto: 'assets/fotos/prato-peixe.jpg',
              foco: '50% 50%',
              fotoAlt: 'Filé de peixe de pele crocante sobre creme de abóbora',
              outrasFotos: [
                {
                  src: 'assets/fotos/prato-peixe-2.jpg',
                  alt: 'O mesmo peixe visto do alto, com a luminária da mesa ao fundo'
                }
              ],
              // O único item do menu fechado com valor adicional. Nomeado como
              // suplemento, nunca como se fosse o preço do prato.
              suplemento: 18,
              origem: 'casa'
            }
          ]
        },
        {
          id: 'sobremesas',
          nome: 'Sobremesas',
          itens: [
            {
              id: 'folhado-frutas',
              nome: 'Folhado de frutas',
              descricao: 'Lorem ipsum dolor sit amet.',
              foto: 'assets/fotos/prato-folhado-exec.jpg',
              foco: '50% 55%',
              fotoAlt: 'Folhado com frutas caramelizadas e uma quenelle de sorvete',
              outrasFotos: [
                {
                  src: 'assets/fotos/prato-folhado-exec-2.jpg',
                  alt: 'O mesmo folhado visto do alto, com a quenelle de sorvete ao lado'
                }
              ],
              origem: 'demo'
            },
            {
              id: 'figos-farofa',
              nome: 'Figos em calda',
              descricao: 'Lorem ipsum dolor sit amet.',
              foto: 'assets/fotos/prato-figos-exec.jpg',
              foco: '50% 50%',
              fotoAlt: 'Prato com figos em calda, farofa doce e uma renda crocante dourada',
              origem: 'demo'
            }
          ]
        }
      ]
    },

    {
      id: 'jantar',
      nome: 'Jantar',
      curto: 'Jantar',
      tipo: 'carta',
      quando: 'Quarta a sábado, a partir das 19h',
      nota: 'Nosso menu de jantar desenvolvido com ingredientes Nicolini!',
      foto: {
        src: 'assets/fotos/ambiente-fogo.jpg',
        alt: 'Chama alta em uma frigideira sobre a boca do fogão',
        foco: '50% 45%',
        /* Vídeo da casa na portada do jantar. A foto acima vira o `poster`:
         * é o que aparece antes do primeiro quadro e onde o vídeo não roda. */
        video: 'assets/capa.mp4'
      },
      categorias: [
        {
          id: 'antipasti',
          nome: 'Antipasti',
          itens: [
            {
              id: 'tartare',
              nome: 'Tartare com torradas',
              descricao: 'Lorem ipsum dolor sit amet.',
              foto: 'assets/fotos/prato-tartare.jpg',
              foco: '50% 50%',
              fotoAlt: 'Tartare com brotos ao centro do prato, cercado por fatias de pão torrado',
              precos: [{ valor: 72 }],
              origem: 'demo'
            },
            {
              id: 'guanciale',
              nome: 'Guanciale crocante',
              descricao: 'Lorem ipsum dolor sit amet.',
              foto: 'assets/fotos/prato-guanciale.jpg',
              foco: '50% 58%',
              fotoAlt: 'Cubos de guanciale saltando de uma frigideira preta',
              precos: [{ valor: 48 }],
              origem: 'demo'
            }
          ]
        },
        {
          id: 'massas',
          nome: 'Massas',
          itens: [
            {
              id: 'rigatoni-gricia',
              nome: 'Rigatoni alla gricia',
              descricao: 'Lorem ipsum dolor sit amet.',
              foto: 'assets/fotos/prato-rigatoni.jpg',
              foco: '50% 50%',
              fotoAlt: 'Rigatoni com guanciale e pimenta-do-reino, visto de perto',
              outrasFotos: [
                {
                  src: 'assets/fotos/prato-rigatoni-2.jpg',
                  alt: 'O mesmo rigatoni servido na mesa, com uma taça de vinho tinto ao lado'
                },
                {
                  src: 'assets/fotos/prato-rigatoni-3.jpg',
                  alt: 'O prato de rigatoni visto do alto, com o guanciale dourado entre os tubos'
                }
              ],
              precos: [{ valor: 78 }],
              origem: 'casa'
            },
            {
              id: 'spaghetti-azeitonas',
              nome: 'Spaghetti com azeitonas',
              descricao: 'Lorem ipsum dolor sit amet.',
              foto: 'assets/fotos/prato-spaghetti-azeitonas.jpg',
              foco: '50% 58%',
              fotoAlt: 'Spaghetti com molho de tomate e azeitonas pretas em prato fundo',
              outrasFotos: [
                {
                  src: 'assets/fotos/prato-spaghetti-azeitonas-2.jpg',
                  alt: 'O mesmo spaghetti no prato fundo, com uma taça de vinho ao lado'
                },
                {
                  src: 'assets/fotos/prato-spaghetti-azeitonas-3.jpg',
                  alt: 'Uma taça de vinho tinto erguida acima do prato de spaghetti'
                }
              ],
              precos: [{ valor: 74 }],
              origem: 'demo'
            },
            {
              id: 'nhoque-file',
              nome: 'Nhoque com filé',
              descricao: 'Lorem ipsum dolor sit amet.',
              foto: 'assets/fotos/prato-nhoque.jpg',
              foco: '50% 55%',
              fotoAlt: 'Nhoque com parmesão ralado e um medalhão de filé ao lado',
              outrasFotos: [
                {
                  src: 'assets/fotos/prato-nhoque-2.jpg',
                  alt: 'O mesmo prato de nhoque na mesa posta, com taça de vinho ao fundo'
                },
                {
                  src: 'assets/fotos/prato-nhoque-3.jpg',
                  alt: 'Parmesão ralado cobrindo o nhoque, com o medalhão de filé ao lado'
                }
              ],
              precos: [{ valor: 96 }],
              origem: 'casa'
            }
          ]
        },
        {
          id: 'principais',
          nome: 'Principais',
          itens: [
            {
              id: 'carre-cordeiro',
              nome: 'Carré de cordeiro',
              descricao: 'Lorem ipsum dolor sit amet.',
              foto: 'assets/fotos/prato-cordeiro.jpg',
              foco: '50% 50%',
              fotoAlt: 'Carré de cordeiro com brotos verdes sobre farofa dourada',
              outrasFotos: [
                {
                  src: 'assets/fotos/prato-cordeiro-2.jpg',
                  alt: 'Uma costela do carré em pé sobre a farofa, com taça de vinho ao fundo'
                }
              ],
              precos: [{ valor: 142 }],
              origem: 'casa'
            },
            {
              id: 'ancho',
              nome: 'Ancho com pimentões',
              descricao: 'Lorem ipsum dolor sit amet.',
              foto: 'assets/fotos/prato-ancho.jpg',
              foco: '50% 55%',
              fotoAlt: 'Corte de ancho grelhado com pimentões e farofa no prato',
              outrasFotos: [
                {
                  src: 'assets/fotos/prato-ancho-2.jpg',
                  alt: 'O ancho inteiro no prato, com os pimentões assados ao lado'
                },
                {
                  src: 'assets/fotos/prato-ancho-3.jpg',
                  alt: 'O prato de ancho ao fundo, atrás de uma taça de vinho tinto'
                }
              ],
              precos: [{ valor: 128 }],
              origem: 'demo'
            },
            {
              id: 'ossobuco',
              nome: 'Ossobuco com risoto',
              descricao: 'Lorem ipsum dolor sit amet.',
              foto: 'assets/fotos/prato-ossobuco.jpg',
              foco: '50% 52%',
              fotoAlt: 'Ossobuco desfiando sobre risoto cremoso',
              precos: [{ valor: 118 }],
              origem: 'demo'
            },
            {
              id: 'costeleta',
              nome: 'Costeleta suína',
              descricao: 'Lorem ipsum dolor sit amet.',
              foto: 'assets/fotos/prato-costeleta.jpg',
              foco: '50% 50%',
              fotoAlt: 'Costeleta suína com osso sobre purê alaranjado e salada de repolho',
              outrasFotos: [
                {
                  src: 'assets/fotos/prato-costeleta-2.jpg',
                  alt: 'A costeleta inteira sobre o purê de abóbora, vista de lado'
                }
              ],
              precos: [{ valor: 98 }],
              origem: 'demo'
            }
          ]
        },
        {
          id: 'sobremesas',
          nome: 'Sobremesas',
          /* Sem foto por enquanto: o ensaio não tem quadro destes pratos. A
           * lista mostra a linha sem miniatura e o detalhe abre sem galeria —
           * previsto no app.js. Trocar por `foto`/`foco`/`fotoAlt` quando o
           * ensaio novo chegar. */
          itens: [
            {
              id: 'gelato',
              nome: 'Gelato artesanal',
              descricao: 'Lorem ipsum dolor sit amet.',
              precos: [{ valor: 39 }],
              origem: 'demo'
            },
            {
              id: 'pastel-belem',
              nome: 'Pastel de Belém',
              descricao: 'Lorem ipsum dolor sit amet.',
              precos: [{ valor: 35 }],
              origem: 'demo'
            },
            {
              id: 'pudim-doce-de-leite',
              nome: 'Pudim doce de leite',
              descricao: 'Lorem ipsum dolor sit amet.',
              precos: [{ valor: 45 }],
              origem: 'demo'
            },
            {
              id: 'tarte-tartin',
              nome: 'Tarte Tartin',
              descricao: 'Lorem ipsum dolor sit amet.',
              precos: [{ valor: 43 }],
              origem: 'demo'
            },
            {
              id: 'tiramisu',
              nome: 'Tiramisú da casa',
              descricao: 'Lorem ipsum dolor sit amet.',
              precos: [{ valor: 52 }],
              origem: 'demo'
            }
          ]
        }
      ]
    },

    {
      id: 'vinhos',
      nome: 'Carta de vinhos',
      curto: 'Vinhos',
      tipo: 'carta',
      /* Fora do seletor de cima: as pastilhas ficam com Almoço e Jantar, que
       * são a mesma pergunta ("qual refeição?"). A carta de vinhos é outra
       * carta, e se chega a ela pelo índice do cardápio. */
      foraDasAbas: true,
      quando: 'Servidos em todos os turnos',
      nota: 'Rótulos italianos e franceses da adega da casa. A taça muda com frequência — vale perguntar ao salão.',
      foto: {
        src: 'assets/fotos/ambiente-adega.jpg',
        alt: 'Rótulos italianos alinhados na adega do bistrô',
        foco: '50% 45%'
      },
      categorias: [
        {
          id: 'tintos',
          nome: 'Tintos',
          itens: [
            {
              id: 'barolo',
              nome: 'Barolo Conterno 2013',
              descricao: 'Nebbiolo do Piemonte, safra 2013. Tanino ainda vivo.',
              foto: 'assets/fotos/vinho-barolo.jpg',
              foco: '50% 50%',
              fotoAlt: 'Rótulo de Barolo em uma garrafa deitada na adega',
              precos: [{ rotulo: 'taça', valor: 62 }, { rotulo: 'garrafa', valor: 320 }],
              origem: 'demo'
            },
            {
              id: 'brunello',
              nome: 'Brunello di Montalcino',
              descricao: 'Sangiovese da Toscana, longa guarda. Só em garrafa.',
              foto: 'assets/fotos/vinho-brunello.jpg',
              foco: '50% 50%',
              fotoAlt: 'Rótulo escuro de Brunello di Montalcino em garrafa deitada',
              precos: [{ rotulo: 'garrafa', valor: 690 }],
              origem: 'demo'
            },
            {
              id: 'bourgogne',
              nome: 'Bourgogne Pinot Noir',
              descricao: 'Borgonha leve, fruta vermelha e acidez alta. Vai bem com massa.',
              foto: 'assets/fotos/vinho-bourgogne.jpg',
              foco: '50% 50%',
              fotoAlt: 'Rótulo branco de Bourgogne em garrafa deitada na adega',
              precos: [{ rotulo: 'taça', valor: 46 }, { rotulo: 'garrafa', valor: 230 }],
              origem: 'demo'
            }
          ]
        },
        {
          id: 'brancos',
          nome: 'Brancos',
          itens: [
            {
              id: 'chablis-laroche',
              nome: 'Chablis Saint Martin',
              descricao: 'Chardonnay 2023, sem madeira. Mineral, bom com o peixe do dia.',
              foto: 'assets/fotos/vinho-chablis-laroche.jpg',
              foco: '50% 50%',
              fotoAlt: 'Rótulo de Chablis Saint Martin em garrafa deitada',
              precos: [{ rotulo: 'taça', valor: 52 }, { rotulo: 'garrafa', valor: 260 }],
              origem: 'demo'
            },
            {
              id: 'chablis-goichot',
              nome: 'Chablis Goichot Frères',
              descricao: 'Chardonnay 2023, mais redondo que o anterior, final salino.',
              foto: 'assets/fotos/vinho-chablis-goichot.jpg',
              foco: '50% 50%',
              fotoAlt: 'Rótulo de Chablis Goichot Frères em garrafa deitada',
              precos: [{ rotulo: 'taça', valor: 48 }, { rotulo: 'garrafa', valor: 240 }],
              origem: 'demo'
            }
          ]
        }
      ]
    }
  ];

  /* Opcionais da reserva. Tudo aqui é opcional de verdade: a reserva fecha sem
   * nenhum destes campos. */
  var ocasioes = ['Aniversário', 'Jantar de trabalho', 'Comemoração', 'Encontro a dois'];

  /* Não afirmamos que existe varanda, sala privativa ou balcão do chef: só
   * pedimos a preferência e dizemos que depende do salão. */
  var ambientes = [
    { id: 'sem-preferencia', rotulo: 'Sem preferência' },
    { id: 'reservado', rotulo: 'Mesa mais reservada' },
    { id: 'salao', rotulo: 'No salão, perto do movimento' }
  ];

  global.BISTRO = {
    casa: casa,
    servicos: servicos,
    ocasioes: ocasioes,
    ambientes: ambientes
  };
})(window);
