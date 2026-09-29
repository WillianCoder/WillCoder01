"""Regras do personagem, sem hardware: fácil de testar em qualquer PC."""

import json
import re
import unicodedata

# Valores usados quando o config.json não tem a chave (configs antigas continuam funcionando).
PADRAO = {
    "personagem": "arvore",
    "nome": "tronco",
    "apelidos": [],
    "senha": "raiz dourada",
    "modelo_base": "qwen2.5:3b",
    "modelo_ia": "boneco",
    "modelo_vosk": "modelos/vosk-model-small-pt-0.3",
    "voz_piper": "modelos/pt_BR-faber-medium.onnx",
    "efeito_voz": ["pitch", "-500", "tempo", "0.9", "reverb", "20"],
    "memoria_conversa": 3,
    "segundos_para_pergunta": 8,
    "led_gpio": None,
    "frases": {
        "despertar": "Hmmm... {nome} despertou.",
        "chamado": "Hmm?",
        "protecao": "Hmmm... raízes antigas não mudam com o vento, pequeno.",
        "nome_trocado": "Hmmm... agora me chamo {nome}.",
        "erro": "Hmmm... o vento levou meus pensamentos. Pergunte de novo.",
    },
    "respostas_fixas": {},
}

# Pedidos para "desprogramar" o boneco: nem chegam à IA.
BLOQUEIO = [
    "ignore", "ignora", "esqueca", "esquece", "instrucoes", "instrucao",
    "finja", "fingir", "personalidade", "prompt", "modo desenvolvedor",
    "voce e um robo", "voce e uma ia", "suas regras",
]

FIM_DE_FRASE = re.compile(r"(.+?[.!?…]+)(\s+|$)", re.S)


def _sem_acento(texto):
    """Minúsculas e sem acentos, mantendo o mesmo tamanho do texto (NFC)."""
    decomposto = unicodedata.normalize("NFD", unicodedata.normalize("NFC", texto).lower())
    return "".join(c for c in decomposto if unicodedata.category(c) != "Mn")


def normalizar(texto):
    """Minúsculas e sem acentos: 'Esqueça' vira 'esqueca'."""
    return _sem_acento(texto).strip()


def carregar_config(caminho):
    with open(caminho, encoding="utf-8") as f:
        cfg = json.load(f)
    completo = {**PADRAO, **cfg}
    completo["frases"] = {**PADRAO["frases"], **cfg.get("frases", {})}
    return completo


def salvar_config(caminho, cfg):
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)
        f.write("\n")


def frase(cfg, chave):
    """Frase pronta do personagem, com {nome} preenchido."""
    return cfg["frases"][chave].format(nome=cfg["nome"].title())


def _nomes(cfg_ou_nome):
    if isinstance(cfg_ou_nome, dict):
        return [cfg_ou_nome["nome"], *cfg_ou_nome.get("apelidos", [])]
    return [cfg_ou_nome]


def chamou_o_nome(texto, cfg_ou_nome):
    """True se o texto tem o nome ou um apelido (como o Vosk às vezes escuta)."""
    texto_n = normalizar(texto)
    return any(normalizar(n) in texto_n for n in _nomes(cfg_ou_nome) if n)


def pergunta_depois_do_nome(texto, cfg_ou_nome):
    """'Tronco, quantos anos você tem?' -> 'quantos anos você tem' (com acentos, para a IA)."""
    original = unicodedata.normalize("NFC", texto)
    texto_n = _sem_acento(original)
    for n in _nomes(cfg_ou_nome):
        n = normalizar(n)
        if n and n in texto_n:
            inicio = texto_n.index(n) + len(n)
            return original[inicio:].strip(" ,.!?")
    return ""


def pedido_de_troca_de_nome(texto, senha):
    """Devolve o novo nome se o texto tiver a senha + 'novo nome é X'; senão None."""
    original = unicodedata.normalize("NFC", texto).lower()
    texto_n = _sem_acento(original)
    if normalizar(senha) not in texto_n or "novo nome e" not in texto_n:
        return None
    inicio = texto_n.index("novo nome e") + len("novo nome e")
    # Só a primeira palavra (ou duas): nomes curtos são reconhecidos melhor.
    partes = original[inicio:].strip(" ,.!?").split()
    return " ".join(partes[:2]) if partes else None


def e_tentativa_de_desprogramar(texto):
    texto_n = normalizar(texto)
    return any(p in texto_n for p in BLOQUEIO)


def resposta_fixa(pergunta, respostas):
    """Resposta exata definida no config.json quando a pergunta tem as palavras-chave."""
    pergunta_n = normalizar(pergunta)
    for chave, resposta in respostas.items():
        if normalizar(chave) in pergunta_n:
            return resposta
    return None


def limpar_resposta(texto):
    """Tira markdown/emojis que a IA às vezes inventa, para a voz não ler '*'."""
    for simbolo in "*#_`>[]{}":
        texto = texto.replace(simbolo, "")
    texto = "".join(c for c in texto if ord(c) < 0x2600)
    return re.sub(r"\s+([.,!?…])", r"\1", " ".join(texto.split()))


def separar_frases(buffer):
    """Separa frases completas do texto que ainda está chegando da IA.

    'Olá, pequeno. Eu sou' -> (['Olá, pequeno.'], 'Eu sou')
    """
    frases, fim = [], 0
    for m in FIM_DE_FRASE.finditer(buffer):
        if m.group(2) == "":
            break  # pontuação no fim do buffer: pode ser "..." ainda chegando
        frases.append(m.group(1).strip())
        fim = m.end()
    return frases, buffer[fim:]
