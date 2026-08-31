# Produto

## Visão

Vamba é um companheiro de viagem mobile que ajuda turistas a decidir o que fazer agora. Ele combina contexto do usuário, lugares reais e explicações úteis para reduzir a fragmentação entre vários aplicativos.

## Diferenciação

O Vamba não é um mapa, tradutor, marketplace de reserva ou guia turístico tradicional. Ele orquestra esses recursos por trás de uma experiência de decisão:

- Onde estou?
- Quanto tempo tenho?
- O que combina comigo?
- O que ainda está aberto?
- Quanto vou andar ou gastar?
- O que vale mais a pena agora?

## Home inicial

A Home deve responder "O que você quer fazer agora?" com categorias:

- Comer
- Conhecer
- Passear
- Praia
- Compras
- Vida noturna
- Surpreenda-me

Também deve existir uma entrada conversacional: "Pergunte ao Vamba..."

## Recomendação

Fluxo obrigatório:

```text
GPS / contexto
  -> API de lugares
  -> lugares reais
  -> normalização
  -> filtros
  -> IA
  -> ranking + explicação
  -> usuário
```

Fluxo proibido:

```text
usuário -> IA inventa lugares
```

## Explicação

Toda recomendação deve preferir explicações contextuais, por exemplo: "Recomendo ir agora porque está próximo, combina com seu interesse por história e ainda há tempo para visitar antes do fechamento."
