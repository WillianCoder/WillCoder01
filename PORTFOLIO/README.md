# 💼 Portfólio

O portfólio **não duplica arquivos**. Qualquer item com `"destaque": true` no `meta.json` aparece automaticamente na seção Portfólio do painel ([index.html](../index.html)).

Para um projeto entrar no portfólio, preencha no `meta.json`:

```json
"destaque": true,
"portfolio": {
  "problema": "Qual problema resolve?",
  "desenvolvido": "O que foi desenvolvido?",
  "participacao": "Qual foi minha participação?",
  "resultado": "Qual resultado foi obtido?"
}
```

Critério sugerido: só entra o que você conseguiria apresentar numa entrevista em 2 minutos, com README completo e imagens.
