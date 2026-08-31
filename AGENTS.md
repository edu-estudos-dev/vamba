# Vamba - Regras permanentes para agentes

Antes de qualquer tarefa relevante:

- leia docs/PROJECT_CONTEXT.md;
- consulte docs/ARCHITECTURE.md para decisoes tecnicas;
- consulte docs/MVP.md antes de sugerir novas funcionalidades;
- mantenha o MVP pequeno;
- nao implemente funcionalidades futuras sem necessidade;
- priorize a milestone atual;
- backend em Node.js com ES Modules;
- mobile em React Native + Expo;
- banco PostgreSQL;
- nao adicionar Redis sem necessidade demonstrada;
- nao expor secrets;
- nao versionar arquivos .env;
- manter integracoes externas desacopladas;
- evitar dependencia direta de fornecedores espalhada pelo codigo;
- fazer alteracoes pequenas e faceis de revisar;
- explicar mudancas arquiteturais importantes;
- registrar decisoes relevantes na documentacao;
- controlar custos de APIs externas;
- nao permitir que IA invente locais ou informacoes criticas atuais;
- usar fontes/APIs reais para dados factuais dependentes de localizacao;
- priorizar simplicidade, seguranca e capacidade de evolucao.

Regras adicionais do projeto:

- executar somente a milestone autorizada pelo fundador;
- nao avancar da Milestone 0 para a Milestone 1 sem autorizacao explicita;
- preferir interfaces de provider em `server/src/integrations/*` antes de integrar fornecedores reais;
- manter dados de exemplo claramente marcados como mock;
- atualizar a documentacao quando uma decisao tecnica ou de produto mudar.
