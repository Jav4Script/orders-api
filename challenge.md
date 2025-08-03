# Desafio Técnico

Você está na etapa do desafio técnico, parabéns por ter chegado até aqui!

Neste desafio, queremos conhecer suas **habilidades técnicas em foco prático e aplicado** na resolução de um problema com nuances aproximadas do seu dia a dia em nosso time. Aqui conheceremos seu estilo de código, aptidões técnicas, seus hard skills e, sobretudo, sua **capacidade de resolução de problemas**. 😄

---

## O Desafio

Temos uma demanda para **integrar dois sistemas**. O sistema legado possui um arquivo de pedidos desnormalizado, e precisamos transformá-lo em um arquivo JSON normalizado.

Para isso, precisamos satisfazer alguns requisitos.

---

## Objetivo do Desafio

Criar um **sistema que receba um arquivo via API REST** e **retorne os dados processados** também via API REST.

---

## Entrada de Dados

O arquivo do sistema legado possui uma estrutura fixa, onde cada **linha representa uma parte de um pedido**. Os dados são padronizados por **tamanho fixo** dos seus valores, respeitando a seguinte tabela:

| Campo           | Tamanho | Tipo                               |
|------------------|----------|------------------------------------|
| id usuário       | 10       | numérico                           |
| nome             | 45       | texto                              |
| id pedido        | 10       | numérico                           |
| id produto       | 10       | numérico                           |
| valor do produto | 12       | decimal                            |
| data compra      | 8        | numérico (formato: `yyyymmdd`)     |

- Todos os **campos numéricos** são completados com `0` à esquerda.
- Os demais (texto) são completados com **espaço à esquerda**.
- A **formatação das colunas será sempre fixa.**

### Exemplo de Dados (sem cabeçalho):

| userId     | userName  | orderId   | productId | value   | date       |
|------------|-----------|-----------|-----------|---------|------------|
| 0000000002 | Medeiros  | 00012345  | 0000000111| 256.24  | 2020-12-01 |
| 0000000001 | Zarelli   | 00000123  | 0000000111| 512.24  | 2021-12-01 |
| 0000000001 | Zarelli   | 00000123  | 0000000122| 512.24  | 2021-12-01 |
| 0000000002 | Medeiros  | 00012345  | 0000000122| 256.24  | 2020-12-01 |

---

## Saída de Dados

A resposta da API deve conter os dados **agrupados e normalizados** no seguinte formato:

```json
[
  {
    "user_id": 1,
    "name": "Zarelli",
    "orders": [
      {
        "order_id": 123,
        "total": "1024.48",
        "date": "2021-12-01",
        "products": [
          {
            "product_id": 111,
            "value": "512.24"
          },
          {
            "product_id": 122,
            "value": "512.24"
          }
        ]
      }
    ]
  },
  {
    "user_id": 2,
    "name": "Medeiros",
    "orders": [
      {
        "order_id": 12345,
        "total": "512.48",
        "date": "2020-12-01",
        "products": [
          {
            "product_id": 111,
            "value": "256.24"
          },
          {
            "product_id": 122,
            "value": "256.24"
          }
        ]
      }
    ]
  }
]
```

### Filtros na Consulta

A API deve permitir consulta geral dos pedidos e também com os seguintes filtros:

- id do pedido
- intervalo de data de compra (data início e data fim)

## Arquivos

Os arquivos estão anexos ao e-mail enviado com este desafio técnico.

## Palavras-chave

- **Testes**
- Lógica
- **Simplicidade**
- SOLID
- Linguagem (**não estamos falando de framework**)
- Automação (ex: build, coverage)
- Desenho da API
- Git

## TL;DR

- A modelagem e arquitetura do sistema fica a seu critério, bem como a seleção e o uso de Frameworks e linguagem fica de livre escolha, é importante focar na **simplicidade**.
- Deixe claro na documentação, pode ser no readme, as escolhas utilizadas, ao que tange tecnologia e padrões arquiteturais aplicados na resolução.
- Independente da solução, é sempre legal colocar no **README** sua maneira de execução.
- Sobre o output (Retorno da API REST), segue o mesmo princípio, pode usar a maneira mais benéfica de persistência, exemplo: arquivo, banco de dados, stream, etc…

## Dica Final

O mais legal desse desafio é a sua versatilidade. Estamos interessados em ver a **lógica implementada na leitura e tratamento dos dados**, mais do que qualquer stack ou ferramenta específica.

Boa sorte e divirta-se!