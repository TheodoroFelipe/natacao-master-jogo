# Natação Master — apresentação jogável

Cada fase do jogo é um slide da apresentação. O nadador pega as bolhas (cada uma revela um tópico)
e, ao tocar a parede, faz a virada e passa para o próximo slide.

## Começar a programar com o Claude Code

Precisa do [Node.js](https://nodejs.org) 20.19 ou mais novo (ou 22.12+).

```bash
cd natacao-master-jogo
npm install
npx playwright install chromium   # só para o teste automático
npm run dev                       # abre em http://localhost:5173
claude                            # em outro terminal, na mesma pasta
```

O Claude Code lê o `CLAUDE.md` sozinho (regras do projeto, estrutura, comandos). O `ROADMAP.md` tem a
lista de melhorias. Sugestões de primeiro pedido:

- *"Leia o CLAUDE.md e o ROADMAP.md. Comece pelo item 'PDF de backup automático' e rode `npm run check` no fim."*
- *"Troque o nadador por um sprite animado. Posso te enviar a imagem; enquanto isso crie um placeholder."*
- *"Implemente 'escolha a raia' na fase de Foz seguindo as regras de segurança do apresentador."*

O comando `/verificar` (em `.claude/commands/`) roda build + teste e confere as capturas.

Versionamento (opcional): `git init && git add . && git commit -m "Versão inicial"`.

## Editar o conteúdo dos slides

Tudo está em `src/data/slides.js`: título, tópicos, nota do apresentador e minutos previstos de cada
fase. Textos entre `[colchetes]` são para você preencher. Nome, curso e título geral ficam em
`src/config.js` (`CONFIG`). Depois de editar, `npm run check` confirma que nada estourou a placa.

## Gerar o arquivo da apresentação

```bash
npm run build
```

Sai **um único arquivo**: `dist/index.html`. Ele funciona sem internet, com duplo clique, no Chrome ou Edge.
Copie para um pendrive junto com um PDF de backup.

## Controles durante a apresentação

| Tecla | Função |
|---|---|
| Setas / `W A S D` | nadar (ou clique na água) |
| `N` / `B` (ou `PageDown` / `PageUp`) | próxima fase / fase anterior |
| `M` | mapa de fases (clique ou número + `Enter`) |
| `R` | revelar todos os tópicos da fase |
| `0–9` + `Enter` | pular direto para a fase N |
| `E` (ou clique na pergunta) | quiz: mostrar a resposta |
| `H` | notas do apresentador (aparecem para a plateia também) |
| `F` | tela cheia |

## Checklist antes de apresentar

- [ ] Abrir `dist/index.html` no computador e no projetor reais; apertar `F`.
- [ ] Passar as 14 fases com `N` e conferir a legibilidade do texto.
- [ ] Preencher todos os `[colchetes]` e conferir datas e fontes.
- [ ] Levar o PDF de backup e o arquivo em pendrive.
- [ ] Ensaiar com o cronômetro: meta de ~22 min, deixando ~8 min para perguntas.

## Estrutura

Veja `CLAUDE.md`.
