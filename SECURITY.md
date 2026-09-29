# Segurança

## O que nunca entra no repositório
Senhas, tokens, chaves de API, credenciais, arquivos `.env`, certificados/chaves privadas, dados pessoais sensíveis (CPF, RG, endereço, notas de terceiros) e informações internas de empresas ou da faculdade.

## Variáveis de ambiente
Use um `.env.example` com os **nomes** das variáveis e valores fictícios; o `.env` real já está no `.gitignore`.

## Se algo vazar
1. Revogue/troque a credencial **imediatamente** (apagar o commit não basta — o histórico é público).
2. Remova do código e faça commit.
3. Se necessário, limpe o histórico com `git filter-repo`.

## Reportar um problema
Abra uma issue sem detalhes sensíveis ou entre em contato pelo perfil do GitHub [@WillianCoder](https://github.com/WillianCoder).
