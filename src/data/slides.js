/* =====================================================================
   CONTEÚDO DA APRESENTAÇÃO  —  EDITE AQUI
   Cada item = 1 fase (slide). Campos:
     fase     : rótulo curto mostrado no mapa e no topo
     titulo   : título do slide (cabe ~38 caracteres em uma linha)
     topicos  : lista de tópicos; cada um vira uma bolha a coletar (3 a 5 por slide)
     nota     : lembrete só para o apresentador (aparece ao apertar H)
     alvo     : minutos previstos para este slide (a soma deve dar ~22 min)
     respostas: (opcional) uma resposta por tópico; aparece à direita ao clicar
                no tópico ou apertar E (usado no quiz)
     foto     : (opcional) nome de um arquivo de src/assets/fotos/ (sem extensão);
                aparece à direita da placa; clique nela ou aperte I para ampliar
   Textos entre [colchetes] = PREENCHER com dados reais.
   ===================================================================== */

/**
 * @typedef {Object} Slide
 * @property {string}   fase
 * @property {string}   titulo
 * @property {string[]} topicos
 * @property {string}   nota
 * @property {number}   alvo
 * @property {string[]} [respostas]
 * @property {string}   [foto]
 */

/** @type {Slide[]} */
export const SLIDES = [
  { fase: 'Largada', titulo: 'NATAÇÃO MASTER',
    topicos: ['Da história ao Master de Foz do Iguaçu', 'Felipe Theodoro Guimaraes · Associação Acquamaster de Foz do Iguaçu', 'Nade até a parede para avançar!'],
    foto: 'fase01-felipe-borboleta',
    nota: 'Apresente-se. Explique rapidamente a mecânica: nadar, pegar as bolhas, tocar a parede.', alvo: 1 },

  { fase: 'Roteiro', titulo: 'O QUE VAMOS PERCORRER',
    topicos: ['Origens da natação', 'Natação como esporte moderno', 'Nasce o Masters (EUA, 1970)', 'Masters no Brasil', 'Masters em Foz do Iguaçu', 'Saúde e Educação Física'],
    nota: 'Visão geral do trajeto. Cite que no fim há quiz e perguntas.', alvo: 1 },

  { fase: 'Origens', titulo: 'ORIGENS: NADAR PARA SOBREVIVER',
    topicos: ['Pinturas rupestres no Egito mostram pessoas nadando', 'Nadar era sobrevivência, travessia e guerra', 'Grécia: ignorante era quem "não sabe ler nem nadar"', 'Curiosidade: aprendi técnica há só 5 anos; compito no Master há 3'],
    nota: 'Caverna dos Nadadores (Gilf Kebir, Egito): pintura do Neolítico; a datação varia entre as fontes, não cite número de anos. Ditado grego citado por Platão (Leis, 689d). Roma: Vegécio (séc. IV) manda todo recruta aprender a nadar no verão, porque nem todo rio tem ponte.', alvo: 1.5 },

  { fase: 'Esporte moderno', titulo: 'NASCE O ESPORTE MODERNO',
    topicos: ['Século XIX: sociedades de natação na Inglaterra e as primeiras competições', 'Atenas 1896: natação nos primeiros Jogos Olímpicos modernos', 'Estilos: crawl, costas, peito e, mais tarde, borboleta', 'Maria Lenk: 1ª sul-americana nos Jogos Olímpicos (1932)'],
    nota: 'Maria Lenk: recorde mundial nos 200 m peito (1939), em 1936 foi a 1ª mulher a usar a braçada borboleta em prova oficial e nadou Master até os 90+ anos, com recordes mundiais na faixa 90-94. Atenas 1896: provas em mar aberto na Baía de Zea (11/04), água a ~13 °C. Borboleta: separada do peito em 1952-53 (fontes divergem) e estreia olímpica em Melbourne 1956.', alvo: 1.5 },

  { fase: 'Quatro estilos', titulo: 'OS QUATRO ESTILOS',
    topicos: ['Crawl (livre): o mais rápido', 'Costas: único estilo largado dentro d\'água', 'Peito: o mais antigo dos estilos competitivos', 'Borboleta: a mais exigente fisicamente'],
    nota: 'Pergunte à plateia qual estilo eles acham mais difícil. Se quiser, comente seu estilo principal.', alvo: 1.5 },

  { fase: 'Nasce o Masters', titulo: 'NASCE O MASTERS',
    topicos: ['1968: o médico Ransom Arthur propõe a ideia', 'Maio de 1970: 1º campeonato, em Amarillo (Texas, EUA)', 'Cerca de 50 nadadores, a partir de 25 anos', '1972: o Nacional já reúne mais de 300 nadadores'],
    nota: 'Fonte: USMS (usms.org). As páginas da USMS dão 46 ou 52 nadadores em 1970. Em 1972, 325 no Nacional de San Mateo. Ideia central: competir não é só para jovens.', alvo: 2 },

  { fase: 'Masters no mundo', titulo: 'MASTERS ENTRA NO MUNDO TODO',
    topicos: ['1986: 1º Mundial Masters da FINA, em Tóquio', '1988: Brisbane (Austrália)', '1990: 3º Mundial, no Rio de Janeiro', 'Categorias a cada 5 anos: 25-29, 30-34, 35-39... sem limite de idade'],
    nota: 'Fonte: World Aquatics (antiga FINA, renomeada em 2023). Destaque: o Brasil sediou o Mundial em 1990.', alvo: 1.5 },

  { fase: 'Masters no Brasil', titulo: 'MASTERS NO BRASIL',
    topicos: ['21/06/1980: 1º Torneio de Masters, no Flamengo (RJ), pela FARJ', '08/12/1984: nasce a ABMN, no Vasco da Gama', '1985: assembleia de fundação e 1º torneio da ABMN', '1990: Rio sedia o 3º Mundial Masters', '1992: 1º Sul-Americano Master, em Belo Horizonte'],
    nota: 'Fonte: história da ABMN (Fabiano Pries Devide) em abmn.org.br.', alvo: 2 },

  { fase: 'Como funciona', titulo: 'COMO FUNCIONA O MASTERS HOJE',
    topicos: ['Categorias por faixa etária (ex.: 25-29, 30-34)', 'Provas curtas e longas, revezamentos e águas abertas', 'Competição por idade: todos disputam com iguais', 'Etapas regionais, Brasileiro e Mundial', 'Para entrar: nadar os 4 estilos e falar com a diretoria da equipe'],
    nota: 'Explique como funciona a categoria para quem nunca viu competição master.', alvo: 1.5 },

  { fase: 'Foz do Iguaçu', titulo: 'MASTER EM FOZ DO IGUAÇU',
    topicos: ['2004: nasce a Associação Acquamaster de Foz', 'Surgiu da união de alunos de natação da cidade', 'Treinos no Complexo Esportivo Costa Cavalcanti', 'Hoje: 28 atletas associados', '2026: Estadual do PR (Curitiba) e Brasileiro (RJ)'],
    foto: 'fase10-equipe-trofeus',
    nota: 'FASE CENTRAL. Conte sua experiência na equipe; mostre fotos se houver.', alvo: 2 },

  { fase: 'Resultados', titulo: 'RESULTADOS E CONQUISTAS',
    topicos: ['22 anos de história em competições regionais e nacionais', '2024: 1º lugar entre as equipes médias (Meeting PR/SC)', 'Circuito Master PR/SC 2025: troféu de 4º lugar (equipe grande)', '76º Brasileiro Master (RJ, 2026): estreia com 4 medalhas', 'Na equipe: Anilda tem 70 anos; o atleta mais novo, 25'],
    foto: 'fase11-anilda-trofeus',
    nota: 'Circuito: Meeting Morel Bueno PR/SC 2025, ranking somado ao longo do ano. Brasileiro: 29/10 a 01/11/2026 no Rio, 528 atletas de 72 equipes; fui sozinho por Foz, categoria 30+, com apoio da Prefeitura (SMEL). Medalhas: premiação até o 8º lugar (4º nos 50/100 peito e 100 livre, 6º nos 200 peito). 2024 (IV Meeting PR/SC): 1º lugar em Equipes Médias e Anilda Kunsler Schmitz 3º lugar na categoria 65+ (troféus da foto). Feche com as idades (25 a 70).', alvo: 1.5 },

  { fase: 'Saúde', titulo: 'SAÚDE E BENEFÍCIOS',
    topicos: ['Baixo impacto: a água alivia o peso sobre as articulações', 'Melhora capacidade cardiorrespiratória e força', 'Campeões Master: o tempo piora só ~0,6% ao ano até os 70', 'Treino constante freia o declínio: há recordes aos 90+ anos', 'Nadadores: risco de morte 53% menor que sedentários'],
    nota: 'Fontes: Rubin et al., 2013 (45 campeões Master, ~23 anos de dados; queda ~0,6%/ano até 70-75, depois acelera). Chase, Sui e Blair, 2008 (40.547 homens, EUA; observacional, não prova causa).', alvo: 2 },

  { fase: 'Quiz', titulo: 'QUIZ RELÂMPAGO',
    topicos: ['Em que ano foi o 1º campeonato Masters?', 'Idade mínima no 1º campeonato, em 1970?', 'Que cidade brasileira sediou o Mundial Master em 1990?', 'Qual estilo é largado dentro d\'água?'],
    respostas: ['1970', '25 anos', 'Rio de Janeiro', 'Costas'],
    nota: 'Pergunte em voz alta a cada bolha; depois clique na pergunta (ou E) para mostrar a resposta.', alvo: 2 },

  { fase: 'Chegada', titulo: 'CHEGADA: VENHA NADAR COM A GENTE',
    topicos: ['Natação não tem idade para começar', 'Instagram: @acquamasterfoz · @fetheodoroguimaraes', 'Iniciante? Aulas da Prefeitura: Complexo Esportivo (45) 99997-4554', 'Obrigado! Perguntas?'],
    nota: 'Encerramento e convite. Abra para perguntas (use o mapa M para voltar a qualquer slide).', alvo: 1 },
];
