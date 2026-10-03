# 📦 Fora do escopo do CFSd (preservado, não apagado)

📄 **O que é:** questões que **não pertencem à grade curricular oficial do CFSd PMESP**. Elas ficam guardadas aqui para uso futuro (por exemplo, numa área "Concurso de ingresso"), mas **não são carregadas** pelo `npm run db:seed`.

| Arquivo | Motivo | Evidência |
|---|---|---|
| `matematica-basica.json`, `matematica-vunesp-estilo.json` | Matemática **não consta** na matriz curricular do curso. Ela é cobrada no **concurso de ingresso** (prova VUNESP), não no CFSd. | Manual do Aluno ESSd, 6ª ed. (dez/2019), "Grade Curricular", pág. 7: nenhuma matéria de Matemática no 1º nem no 2º CENS. Ver `docs/AUDITORIA_CFSD.md`. |

✏️ **Para tirar do ar no banco** (questões já carregadas antes): `npm run content:arquivar`. Isso muda o status para **ARQUIVADA** (some para os alunos, mantém o histórico de respostas) e registra na Auditoria.

↩️ **Para desfazer:** mova o arquivo de volta para `content/questoes/` e, no painel, mude o status das questões para "Publicada".
