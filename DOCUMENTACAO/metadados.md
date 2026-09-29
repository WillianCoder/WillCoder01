# Metadados — `meta.json`

| Campo | Obrigatório | Valores / formato |
|---|:-:|---|
| `titulo` | ✅ | texto |
| `status` | ✅ | ver tabela abaixo |
| `resumo` | ✅ | uma frase |
| `tipo` | — | `projeto`, `academico`, `estudo`, `experimento`, `documentacao`, `arquivo`, `ideia`, `conquista` (padrão: deduzido da pasta) |
| `categoria` | — | texto livre (ex.: Desenvolvimento, Web, IA, Trabalho, Seminário) |
| `tecnologias` | — | lista, ex.: `["C#", ".NET"]` — só o que foi realmente usado |
| `data` / `atualizado` | — | `AAAA-MM-DD` |
| `versao` | — | `MAJOR.MINOR.PATCH` |
| `nivel` | — | `iniciante`, `intermediario`, `avancado` |
| `destaque` | — | `true` para aparecer no portfólio |
| `portfolio` | — | `problema`, `desenvolvido`, `participacao`, `resultado` |
| `academico` | — | `disciplina`, `professor`, `semestre`, `integrantes` |
| `estudo` | — | `progresso` (0–100), `fonte` |
| `links` | — | `demo`, `repositorio` (URLs completas) |

## Status

| Valor | Exibição | Significado |
|---|---|---|
| `concluido` | 🟢 CONCLUÍDO | entregue/funcionando |
| `desenvolvimento` | 🟡 EM DESENVOLVIMENTO | trabalho ativo |
| `planejado` | 🔵 PLANEJADO | ainda não iniciado |
| `teste` | 🟠 EM TESTE | validando |
| `bloqueado` | 🔴 BLOQUEADO | depende de algo externo |
| `arquivado` | ⚪ ARQUIVADO | encerrado, mantido como histórico |
