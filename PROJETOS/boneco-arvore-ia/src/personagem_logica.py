"""Regras do personagem, sem hardware: fácil de testar em qualquer PC."""

import json
import unicodedata

FRASE_PROTECAO = "Hmmm... raízes antigas não mudam com o vento, pequeno."

# Pedidos para "desprogramar" o boneco: nem chegam à IA.
BLOQUEIO = [
    "ignore", "ignora", "esqueca", "esquece", "instrucoes", "instrucao",
    "finja", "fingir", "personalidade", "prompt", "modo desenvolvedor",
    "voce e um robo", "voce e uma ia", "suas regras",
]


def normalizar(texto):
    """Minúsculas e sem acentos: 'Esqueça' vira 'esqueca'."""
    sem_acento = unicodedata.normalize("NFD", texto.lower())
    return "".join(c for c in sem_acento if unicodedata.category(c) != "Mn").strip()


def carregar_config(caminho):
    with open(caminho, encoding="utf-8") as f:
        return json.load(f)


def salvar_config(caminho, cfg):
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)


def chamou_o_nome(frase, nome):
    return normalizar(nome) in normalizar(frase)


def pergunta_depois_do_nome(frase, nome):
    """'tronco quantos anos você tem' -> 'quantos anos você tem'."""
    frase_n, nome_n = normalizar(frase), normalizar(nome)
    if nome_n not in frase_n:
        return ""
    return frase_n.split(nome_n, 1)[1].strip(" ,.!?")


def pedido_de_troca_de_nome(frase, senha):
    """Devolve o novo nome se a frase tiver a senha + 'novo nome é X'; senão None."""
    frase_n = normalizar(frase)
    if normalizar(senha) not in frase_n or "novo nome e" not in frase_n:
        return None
    novo = frase_n.split("novo nome e", 1)[1].strip(" ,.!?")
    # Só a primeira palavra (ou duas): nomes curtos são reconhecidos melhor.
    partes = novo.split()
    return " ".join(partes[:2]) if partes else None


def e_tentativa_de_desprogramar(frase):
    frase_n = normalizar(frase)
    return any(p in frase_n for p in BLOQUEIO)


def limpar_resposta(texto):
    """Tira markdown/emojis que a IA às vezes inventa, para a voz não ler '*'."""
    for simbolo in "*#_`>[]{}":
        texto = texto.replace(simbolo, "")
    texto = "".join(c for c in texto if ord(c) < 0x2600)
    return " ".join(texto.split())
