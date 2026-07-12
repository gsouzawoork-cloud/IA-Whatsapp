# Notas didáticas de segurança

Material de apoio para quem está aprendendo segurança de aplicações, usando as
decisões desta base como exemplos concretos. Não é uma certificação nem uma
garantia de invulnerabilidade — é um mapa dos controles implementados e do
porquê.

## Autenticação × Autorização

- **Autenticação** responde "quem é você?". Aqui: Supabase Auth (e-mail/senha),
  sessão em cookies, validada no servidor com `getUser()`.
- **Autorização** responde "o que você pode fazer?". Aqui: papéis + permissões
  (servidor) e **RLS** (banco). São coisas diferentes: estar logado não dá
  acesso aos dados de qualquer empresa.

## IDOR (Insecure Direct Object Reference)

Conhecer um UUID não pode dar acesso ao objeto. Se você tentar ler o pedido
`abc-123` de outra empresa, a RLS retorna zero linhas — o UUID é inútil sem
membership. Nunca autorizamos "porque o ID foi enviado".

## Mass assignment

Enviar um objeto de formulário inteiro direto ao banco permitiria alterar campos
que não deveriam. Por isso as atualizações usam **allowlists explícitas** de
campos (ex.: `AgentRepository.updateSettings` monta o `update` campo a campo).

## JWT e cookies

O token de sessão é um JWT gerenciado pela biblioteca oficial e guardado em
cookie. **Não** decodificamos o JWT manualmente para autorizar, e **não** usamos
`user_metadata` para decisões de permissão (o usuário poderia influenciá-lo). A
fonte de papel é a tabela `organization_memberships`, validada pela RLS.

## RLS (Row Level Security)

É a autorização dentro do próprio PostgreSQL: cada linha só é visível/alterável
para quem a policy permite. Funciona mesmo que alguém use a API do banco
diretamente ou altere o JavaScript. É a barreira final.

## Service role × publishable key

- **publishable key** (anon): pública, sempre sob RLS. É a que a aplicação usa.
- **service role**: ignora a RLS. É um **segredo** de servidor e **nunca** entra
  no navegador, no bundle, em `localStorage`, em logs ou no código versionado.
  Nesta fase a aplicação **não** usa service role — opera sempre sob RLS.

## Princípio do menor privilégio

Cada papel recebe só o que precisa (owner ⊃ admin ⊃ manager ⊃ agent ⊃ viewer).
Funções `SECURITY DEFINER` têm `search_path` fixo e execução concedida apenas a
`authenticated`.

## Logs e segredos

A trilha de auditoria **nunca** registra senha, token, cartão, documento
completo ou conteúdo sensível. `sanitizeAuditMetadata` redige chaves sensíveis
por nome e trunca strings — teste em `src/core/audit/sanitize.test.ts`.

## Validação de entrada

Toda entrada é validada com Zod (schemas em `src/core/validation`): e-mails
normalizados, moeda em centavos, quantidades inteiras não-negativas, enums em
allowlist, campos desconhecidos descartados.

## Rate limiting (pendente e honesto)

Rate limiting **em memória não funciona** de forma confiável em ambiente
serverless. Como ainda não há webhooks públicos nem IA nesta fase, apenas
documentamos os pontos que precisarão dele (login, recuperação de senha,
webhook, envio de mensagem, criação de pedido, execução de ferramenta) para a
fase apropriada — sem fingir que já está protegido.

## Tratamento de erros

O usuário recebe mensagens seguras; o servidor pode registrar o técnico
(sanitizado). Nunca expomos SQL, stack trace, nome de policy, token ou caminho
interno.
