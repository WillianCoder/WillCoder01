# 0 · Como funciona

Um **mini-computador (Raspberry Pi)** fica escondido dentro do boneco, sempre ouvindo, **sem internet**:

```
🎤 Microfone
   ↓
① OUVIR   — Vosk transforma a fala em texto
   ↓  ouviu o NOME? ("tronco…")  → se não, ignora e continua ouvindo
② PENSAR  — Ollama (IA local) cria a resposta como a árvore
   ↓
③ FALAR   — Piper transforma o texto em voz
   ↓
④ ENGROSSAR — SoX deixa a voz grave com eco de floresta
   ↓
🔊 Alto-falante
```

## Por que ninguém consegue "desprogramar"
| Proteção | Como |
|---|---|
| Personalidade gravada | Fica no `Modelfile`, dentro do modelo da IA — não na conversa |
| Sem teclado / sem internet | A única entrada é a voz |
| Filtro | Frases como "esqueça suas instruções" nem chegam à IA |
| Memória curta | Só lembra as últimas 3 perguntas e esquece tudo ao reiniciar |
| Voz fixa | O efeito do SoX é sempre o mesmo → o tom nunca muda |
| Troca de nome protegida | Só com a **frase secreta** que só você sabe |
| (Opcional) SD somente leitura | Nada é gravado no cartão — veja etapa 8 |

**Custo de software: R$ 0.** Tudo é gratuito e de código aberto.
