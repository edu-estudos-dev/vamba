# Vamba - Contexto do projeto

Vamba é um aplicativo mobile de viagem voltado inicialmente para brasileiros viajando para outros países. O produto não tenta substituir Google Maps, Google Translate, TripAdvisor, Booking, Viator, GetYourGuide, Apple Maps ou outros serviços especializados. Ele deve usar serviços externos como infraestrutura e criar uma camada inteligente para ajudar o turista a tomar decisões durante a viagem.

Frase central:

> O Vamba não apenas encontra lugares. O Vamba ajuda o turista a decidir o que vale a pena fazer agora.

Exemplo de comportamento esperado: o usuário está em Roma e pergunta "Tenho duas horas livres. O que posso fazer agora?". O Vamba considera GPS, horário, distância, lugares próximos, interesses, orçamento, horários de funcionamento, tempo disponível e meio de deslocamento para recomendar algo contextual e explicar o motivo.

## Problema

Durante viagens, turistas alternam entre mapas, tradutores, sites de turismo, avaliações, aplicativos de reservas, ferramentas de roteiro e busca. A missão de longo prazo é reduzir a quantidade de decisões e aplicativos necessários durante uma viagem.

## Público inicial

- Brasileiros viajando para o exterior.
- Idioma inicial: português do Brasil.
- A arquitetura deve permitir internacionalização futura.

## Estratégia geográfica

A aplicação deve aceitar qualquer cidade. A validação pode começar com poucas cidades, como Lisboa, Roma, Paris, Barcelona ou Londres. É aceitável começar por uma cidade, desde que regras específicas não fiquem hardcoded no core.

## Hipótese principal

O MVP precisa responder:

> Turistas realmente abrem o Vamba repetidamente enquanto estão viajando?

A métrica principal é sessões por usuário por dia ativo de viagem. Métricas secundárias incluem DAU, WAU, recomendações solicitadas, lugares visualizados, lugares salvos, rotas solicitadas, traduções, cliques em parceiros, conversões de afiliados e retenção durante viagens.

## Princípios

- Simples primeiro.
- Não construir hoje o que só será necessário depois do product-market fit.
- Dados factuais e críticos vêm de fontes reais, não da imaginação da IA.
- Mobile chama backend sempre que uma chave privada puder ser protegida.
- Integrações externas ficam isoladas por providers.
- Sem Redis, microservices, Kubernetes, checkout próprio ou sistemas complexos no MVP.

## Milestone atual

Milestone 0 - Bootstrap. Criar documentação, estrutura mobile, estrutura backend, TypeScript, ES Modules, `.env.example`, scripts de desenvolvimento e verificação local. Não integrar Google Places, OpenAI, Stripe, afiliados reais ou LLC.
