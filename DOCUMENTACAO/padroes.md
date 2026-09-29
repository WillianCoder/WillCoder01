# Padrões

## Nomes
- Pastas: `minusculas-com-hifens`, sem acentos (o `novo.py` já faz isso). Seções de topo em MAIÚSCULAS.
- Arquivos: descritivos — `diagrama-arquitetura.png`, não `img1.png`.
- Datas em nomes: `AAAA-MM-DD` (ordena corretamente).

## Versões — SemVer (`MAJOR.MINOR.PATCH`)
| Mudança | Exemplo |
|---|---|
| **PATCH** — correção sem mudar comportamento | 1.1.0 → 1.1.1 |
| **MINOR** — funcionalidade nova compatível | 1.1.1 → 1.2.0 |
| **MAJOR** — mudança incompatível / reescrita | 1.2.0 → 2.0.0 |

Antes da 1.0.0 o projeto está em construção. Toda mudança relevante entra no `CHANGELOG.md` (formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)), e a versão do `meta.json` acompanha. Para marcar no Git: `git tag v1.2.0 && git push --tags`.

## Commits — Conventional Commits
`tipo(escopo): descrição` — tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
Ex.: `feat(academico): adiciona seminário de redes`, `docs(estudos): atualiza anotações de SQL`.
