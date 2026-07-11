# PRODUCT.md — Visão de produto

## Problema

Empresas que atendem clientes pelo WhatsApp enfrentam volume alto de mensagens,
respostas repetitivas, atendimento fora do horário, perda de pedidos e falta de
organização. Operar diretamente pelo aplicativo do WhatsApp não escala: não há
visão consolidada das conversas, do histórico do cliente nem das solicitações
geradas, e não há como uma IA atender com segurança usando as informações
oficiais do negócio.

## Visão

Uma **plataforma SaaS multiempresa** que transforma o WhatsApp da empresa em um
canal atendido por inteligência artificial, com uma central de operação onde a
equipe acompanha tudo, assume conversas quando necessário e habilita apenas os
módulos de que o negócio precisa.

O WhatsApp é o **canal** pelo qual o cliente final conversa. A plataforma é a
**central** onde a empresa opera — sem precisar usar o WhatsApp diretamente.

## Proposta de valor

> A empresa conecta seu WhatsApp, ensina como seu negócio funciona e passa a
> usar uma plataforma centralizada onde a inteligência artificial atende
> clientes, organiza solicitações e auxilia a operação de acordo com os módulos
> necessários para aquele negócio.

Não é um chatbot. É uma **central inteligente de atendimento e operação**: a IA
conversa com o cliente, interpreta necessidades, consulta informações oficiais e
usa ferramentas controladas pela aplicação para concluir atendimentos, sempre
com validação determinística no backend e possibilidade de controle humano.

## Público-alvo

Empresas que atendem clientes pelo WhatsApp. A arquitetura é genérica e modular,
mas o MVP não tenta atender todos os segmentos funcionalmente.

- **Segmento inicial de demonstração:** pizzarias, restaurantes e delivery de
  alimentos — escolhido por exercitar atendimento automático, cardápio,
  disponibilidade, montagem de pedido, endereço, taxa de entrega, pagamento,
  fila de preparo, status e transferência para humano.
- **Segmentos futuros previstos:** lojas e comércios, clínicas e consultórios,
  escritórios, prestadores de serviços, oficinas, empresas de orçamento e de
  agendamento. Não implementados nesta fase — apenas suportados pela arquitetura
  via módulos e capacidades.

## Posicionamento

Entre o "chatbot de FAQ" (raso, sem operação) e o "ERP completo" (pesado,
caro, genérico), o IA WhatsApp se posiciona como uma **central de atendimento
inteligente com módulos operacionais sob medida**: simples de adotar, segura por
padrão e capaz de concluir atendimentos reais sem virar um sistema
superdimensionado.

## Princípios do produto

1. **Atendimento é o núcleo.** Conversas, clientes, mensagens, base de
   conhecimento, comportamento da IA, transferência para humano e histórico são
   a base universal.
2. **Os demais recursos são módulos opcionais.** Pedidos, catálogo,
   disponibilidade, pagamentos, fila, agenda, entrega e orçamentos existem para
   concluir tipos específicos de atendimento.
3. **A plataforma se adapta ao negócio.** Módulos desativados são bloqueados na
   autorização, nos serviços, nas rotas e nas regras — não apenas ocultados no
   menu.
4. **A IA não é a fonte da verdade.** Preços, disponibilidade, pagamentos,
   permissões, status e regras comerciais são determinísticos e controlados pela
   aplicação. A IA interpreta e solicita; o backend valida e executa.
5. **A empresa mantém controle humano.** Funcionários autorizados assumem
   conversas, revisam decisões, corrigem informações e bloqueiam ações.
6. **Simplicidade operacional.** Reduzir complexidade, não criar um ERP pesado
   para quem só precisa de atendimento.
7. **Evolução supervisionada.** A IA não altera sozinha regras, base de
   conhecimento ou permissões.
8. **Segurança desde a fundação.** Isolamento multiempresa, auditoria, controle
   de acesso, proteção de credenciais e validação das ações da IA desde o início.

## Tipos de usuário

- **Cliente final** — conversa pelo WhatsApp; não acessa o painel.
- **Proprietário** — configura a empresa, conecta o WhatsApp, ativa módulos,
  define permissões, configura a IA e gerencia usuários.
- **Gerente** — acompanha e revisa atendimentos, gerencia equipe e aprova
  exceções conforme permissão.
- **Atendente** — assume e responde conversas, transfere e consulta dados
  necessários do cliente.
- **Operador** — atua em módulos operacionais específicos (cozinha, separação,
  entrega), sem acesso a dados desnecessários.
- **Administrador interno da plataforma** — gerencia contas, planos e suporte,
  com acesso controlado, auditado e mínimo.

Detalhamento de papéis e permissões em [`MODULES.md`](MODULES.md) e
[`SECURITY.md`](SECURITY.md).

## Jornada da empresa (conceitual)

1. Cadastra-se e cria a empresa.
2. Passa por um onboarding guiado que pergunta o tipo de negócio e o que deseja
   que a IA faça.
3. A plataforma sugere módulos; um responsável confirma a ativação.
4. Conecta o WhatsApp e ensina o negócio (base de conhecimento).
5. Configura o comportamento da IA e as ações permitidas.
6. Passa a operar pela central: acompanha conversas, assume quando necessário e
   acompanha solicitações e operações dos módulos ativos.

## Jornada do cliente final (conceitual)

1. Envia uma mensagem pelo WhatsApp da empresa.
2. A IA interpreta, consulta informações oficiais e responde.
3. Conforme o negócio, faz um pedido, agenda, solicita algo ou tira dúvidas.
4. Quando necessário, é transferido para um atendente humano.
5. Recebe atualizações de status geradas pela aplicação.

Fluxos detalhados em [`USER_FLOWS.md`](USER_FLOWS.md).

## Atendimento como núcleo

O núcleo universal é independente do segmento: empresas, unidades, usuários,
papéis, permissões, atendimento, conversas, mensagens, clientes, histórico, base
de conhecimento, configuração da IA, transferência para humano, setores/filas,
auditoria e controle de módulos ativos. Ver [`MODULES.md`](MODULES.md).

## Módulos opcionais

Pedidos, catálogo, produtos, serviços, disponibilidade, pagamentos, fila de
preparo, entrega, agenda, profissionais, orçamentos, solicitações, documentos,
fidelidade e relatórios por segmento. Cada empresa habilita um subconjunto.

## Especialização inicial

A primeira especialização funcional (fase futura) é **pizzaria e delivery**,
descrita em [`USER_FLOWS.md`](USER_FLOWS.md). Não implementada nesta fase.

## Escopo do MVP (visão macro)

O MVP evolui por fases (ver [`ROADMAP.md`](ROADMAP.md)): fundação → protótipo
simulado da central → banco/autenticação/multiempresa → atendimento e pedidos
persistentes → IA com ferramentas controladas → WhatsApp → pagamentos →
onboarding SaaS → segurança e produção.

## Fora do escopo (produto)

- Ser um ERP de estoque, fiscal ou contábil.
- Controle industrial de produção, previsão de demanda, compras, fornecedores.
- Aprender automaticamente com qualquer conversa sem revisão humana.
- Permitir que a IA altere preços, permissões, módulos ou a própria configuração.
- Confirmar pagamento apenas por comprovante em imagem.

## Critérios de sucesso

- A empresa consegue conectar o WhatsApp e ensinar o negócio sem complexidade.
- A IA resolve uma parcela relevante dos atendimentos usando dados oficiais.
- Atendentes assumem e devolvem conversas com facilidade.
- Pedidos/solicitações são criados com dados corretos e validados pelo backend.
- Isolamento entre empresas comprovadamente respeitado.
- Nenhuma ação crítica executada pela IA sem validação determinística.

## Riscos de produto

- **Superdimensionamento:** transformar módulos operacionais em um ERP pesado.
  Mitigação: manter atendimento como núcleo e módulos enxutos.
- **Confiar demais na IA:** deixar a IA decidir preço/disponibilidade/pagamento.
  Mitigação: backend é a fonte da verdade.
- **Complexidade de onboarding:** exigir configuração demais antes do valor.
  Mitigação: onboarding guiado e adaptável, com sugestão de módulos.
- **Segurança multiempresa:** vazamento entre empresas. Mitigação: isolamento em
  todas as camadas + testes ([`THREAT_MODEL.md`](THREAT_MODEL.md)).
