# Desafio Técnico

Esta é uma solução para o desafio técnico proposto.

O projeto consiste em uma API REST que recebe um arquivo de texto com dados de pedidos, normaliza esses dados e os expõe em formato JSON, com funcionalidades de filtro.

Para uma análise mais aprofundada sobre as decisões e considerações técnicas, consulte o arquivo [ANALYSIS.md](ANALYSIS.md).

## Sumário
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Justificativa das Escolhas Técnicas](#justificativa-das-escolhas-técnicas)
- [Escolhas Técnicas: Alternativas e Justificativas](#escolhas-técnicas-alternativas-e-justificativas)
- [Arquitetura](#arquitetura)
  - [Diagrama de Fluxo de Dados](#diagrama-de-fluxo-de-dados)
  - [Diagrama de Componentes](#diagrama-de-componentes)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Como Executar](#como-executar)
- [Como Testar](#como-testar)
- [Comandos Disponíveis](#comandos-disponíveis)
- [Endpoints da API](#endpoints-da-api)
  - [1. Importar Arquivo](#1-importar-arquivo)
  - [2. Consultar Pedidos](#2-consultar-pedidos)

## Tecnologias Utilizadas

- **Node.js:** Ambiente de execução para o servidor.
- **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
- **Express:** Framework para a construção da API REST.
- **Multer:** Middleware para o upload de arquivos.
- **SQLite:** Banco de dados leve e embutido para persistência de dados.
- **Zod:** Biblioteca para validação de schema de dados.
- **Winston:** Biblioteca para logging estruturado.
- **Jest & Supertest:** Para os testes unitários e de integração.

## Justificativa das Escolhas Técnicas

Ao longo do desenvolvimento, a **simplicidade** e a **lógica** foram priorizadas como pilares, conforme destacado no desafio. As escolhas de ferramentas foram feitas para agregar valor sem introduzir complexidade desnecessária ou desviar o foco da lógica de negócio.

- **Express.js:** Escolhido por ser um framework web minimalista e flexível. Ele permite construir a API de forma eficiente, sem impor uma arquitetura rígida, mantendo o controle sobre o código da aplicação.

- **SQLite:** Para a persistência de dados, o SQLite foi a escolha ideal. Ele oferece um banco de dados relacional completo em um único arquivo, eliminando a necessidade de configurar e gerenciar um servidor de banco de dados externo (como PostgreSQL ou MySQL) ou Docker. Isso simplifica drasticamente o setup do ambiente de desenvolvimento e a execução da aplicação, alinhando-se perfeitamente com o requisito de simplicidade.

- **Zod:** Embora não seja um framework, o Zod é uma biblioteca poderosa para validação de schema. Sua inclusão justifica-se por:
    - **Clareza e Simplicidade:** Permite definir schemas de validação de forma declarativa e legível, tornando a validação de entradas da API muito mais simples e menos propensa a erros do que a validação manual.
    - **Segurança:** Garante que os dados recebidos pela API estejam no formato esperado, prevenindo bugs e vulnerabilidades.
    - **Manutenibilidade:** Separa a lógica de validação da lógica de negócio, aderindo ao princípio da Responsabilidade Única (SOLID), o que facilita a manutenção e a evolução do código.

- **Winston:** Para o logging, o Winston foi escolhido por ser uma biblioteca de logging robusta e flexível. Ele permite a criação de logs estruturados, o que é fundamental para a observabilidade da aplicação em ambientes de produção. Substituir `console.log` por um logger profissional melhora a capacidade de depuração e monitoramento, sem adicionar complexidade excessiva ao desenvolvimento.

## Escolhas Técnicas: Alternativas e Justificativas

| Componente/Funcionalidade | Tecnologia Escolhida | Justificativa da Escolha | Opções Alternativas | Por que a Alternativa Não Foi Escolhida (para este projeto) |
| :------------------------ | :------------------- | :----------------------- | :------------------ | :---------------------------------------------------------- |
| **Framework Web**         | Express.js           | Minimalista, flexível, amplamente adotado, permite focar na lógica central. | NestJS, módulo `http` nativo do Node.js | NestJS: Excesso para a simplicidade, mais opinativo. `http` nativo: Muito verboso, adiciona complexidade desnecessária para funcionalidades básicas de API. |
| **Persistência de Dados** | SQLite               | Simples, baseado em arquivo, não requer servidor externo, alinha-se com a simplicidade. | PostgreSQL, MySQL, MongoDB, Em memória (original) | DBs Externos: Adicionam complexidade de setup/gerenciamento (Docker/instalação). Em memória: Perda de dados ao reiniciar, não persistente. |
| **Validação de Entrada**  | Zod                  | Declarativo, com tipagem forte, separa a lógica de validação, melhora a robustez. | Validação manual, Joi, Yup | Manual: Verboso, propenso a erros, mistura responsabilidades. Outras libs: Similares ao Zod, mas Zod oferece excelente integração com TypeScript. |
| **Logging**               | Winston              | Logging estruturado, flexível, melhora a observabilidade. | `console.log` | `console.log`: Falta estrutura, difícil de filtrar/analisar em produção. |

## Arquitetura

A aplicação segue uma arquitetura em camadas, separando as responsabilidades de rota, controle e serviço, o que facilita a manutenção e o teste.

### Diagrama de Fluxo de Dados

```mermaid
sequenceDiagram
    participant Cliente
    participant API_Gateway as API (Express)
    participant ValidationMiddleware as Middleware de Validação
    participant Controller
    participant ParserService as Serviço de Parsing
    participant OrderService as Serviço de Pedidos
    participant DatabaseService as Serviço de Banco de Dados (SQLite)

    Cliente->>+API_Gateway: POST /api/import com arquivo .txt
    API_Gateway->>+Controller: uploadFile(req, res)
    Controller->>+ParserService: parseAndNormalize(fileContent)
    ParserService-->>-Controller: Retorna dados normalizados
    Controller->>+DatabaseService: saveParsedData(normalizedData)
    DatabaseService-->>-Controller: Confirmação
    Controller-->>-API_Gateway: Resposta 201 Created
    API_Gateway-->>-Cliente: Sucesso

    Cliente->>+API_Gateway: GET /api/orders?orderId=123
    API_Gateway->>+ValidationMiddleware: Valida query params
    ValidationMiddleware->>+Controller: getOrders(req, res)
    Controller->>+OrderService: getFormattedOrders(filters)
    OrderService->>+DatabaseService: findOrdersByFilter(filters)
    DatabaseService-->>+OrderService: Retorna dados planos
    OrderService-->>-Controller: Retorna dados formatados
    Controller-->>-API_Gateway: Retorna dados JSON
    API_Gateway-->>-Cliente: Resposta 200 OK com JSON
```

### Diagrama de Componentes

```mermaid
graph TD
    subgraph "Cliente"
        C[Cliente via cURL/Frontend]
    end

    subgraph "Aplicação"
        A[Servidor Express]
        B[Rotas da API]
        VM[Middleware de Validação]
        C1[Controller de Pedidos]
        D[Serviço de Parsing]
        DB[Serviço de Banco de Dados - SQLite]

        A --> B
        B --> VM
        VM --> C1
        C1 --> D
        C1 --> DB
    end

    C --> A
```

## Estrutura de Diretórios

Abaixo está a estrutura de diretórios do projeto, com uma breve descrição de cada um:

```
.
├───src/
│   ├───server.ts             # Ponto de entrada da aplicação, configura o servidor Express.
│   ├───api/                  # Contém a lógica da API REST.
│   │   ├───controller.ts     # Lógica de negócio para manipular requisições e respostas.
│   │   ├───routes.ts         # Define as rotas da API e associa aos controladores.
│   │   ├───middlewares/      # Middlewares para processamento de requisições (ex: validação, tratamento de erros).
│   │   │   ├───error.middleware.ts   # Middleware para tratamento centralizado de erros.
│   │   │   └───validate.middleware.ts # Middleware para validação de schemas de requisição.
│   │   └───schemas/          # Definições de schemas de validação (usando Zod).
│   │       └───order.schema.ts       # Schema para validação de dados de pedidos.
│   ├───application/          # Contém a lógica de negócio principal e serviços de aplicação.
│   │   └───orderService.ts   # Serviço responsável pela manipulação e formatação de dados de pedidos.
│   ├───config/               # Arquivos de configuração da aplicação.
│   │   └───logger.ts         # Configuração do logger (Winston).
│   └───services/             # Serviços de infraestrutura e utilitários.
│       ├───database.ts       # Serviço para interação com o banco de dados (SQLite).
│       └───parser.ts         # Serviço para parsing e normalização de arquivos de entrada.
├───tests/                    # Contém os testes unitários e de integração.
│   ├───api.spec.ts           # Testes para os endpoints da API.
│   ├───parser.spec.ts        # Testes para o serviço de parsing.
│   └───orderService.spec.ts  # Testes para o serviço de pedidos (orderService).
├───data/                     # Exemplos de arquivos de entrada para importação.
├───docs/                     # Documentação adicional e ativos (imagens).
│   └───assets/               # Imagens usadas na documentação.
├───.gitignore                # Arquivo para ignorar arquivos e diretórios no Git.
├───ANALYSIS.md               # Análise e considerações sobre o desafio técnico.
├───jest.config.js            # Configuração do Jest para testes.
├───package.json              # Metadados do projeto e dependências.
├───package-lock.json         # Bloqueio de versões das dependências.
├───README.md                 # Este arquivo de documentação do projeto.
└───tsconfig.json             # Configuração do TypeScript.
```

## Como Executar

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Inicie o servidor:**
    ```bash
    npm start
    ```
    O servidor estará rodando em `http://localhost:3000`.

## Como Testar

Para rodar os testes unitários e de integração, execute:

```bash
npm test
```

Para gerar um relatório de cobertura de testes, execute:

```bash
npm run test:coverage
```

## Comandos Disponíveis

Para facilitar o desenvolvimento e a execução do projeto, os seguintes comandos estão disponíveis via `npm`:

-   **`npm start`**: Inicia o servidor da aplicação em modo de produção.
-   **`npm dev`**: Inicia o servidor em modo de desenvolvimento com `nodemon`, que monitora alterações nos arquivos `src` e reinicia o servidor automaticamente.
-   **`npm build`**: Compila o código TypeScript para JavaScript, gerando os arquivos de saída na pasta `dist`.
-   **`npm test`**: Executa todos os testes unitários e de integração definidos no projeto.
-   **`npm test:coverage`**: Executa os testes e gera um relatório de cobertura de código, mostrando a porcentagem de código coberto pelos testes.

## Endpoints da API

### 1. Importar Arquivo

- **URL:** `/api/import`
- **Método:** `POST`
- **Formato:** `multipart/form-data`
- **Campo do arquivo:** `file`

**Exemplo de uso com cURL:**

```bash
# Substitua pelo caminho do seu arquivo
curl -X POST -F "file=@data/data_1.txt" http://localhost:3000/api/import
```

**Resultado da Execução:**

![Resultado do POST /api/import](docs/assets/post-import-result.png)

### 2. Consultar Pedidos

- **URL:** `/api/orders`
- **Método:** `GET`
- **Query Params (Opcionais):**
    - `orderId` (number): Filtra por um ID de pedido específico.
    - `startDate` (string - `YYYY-MM-DD`): Data de início do intervalo de filtro.
    - `endDate` (string - `YYYY-MM-DD`): Data de fim do intervalo de filtro.
    - `productId` (number): Filtra por um ID de produto específico.
    - `sortBy` (string - `order_id`, `total`, `date`): Ordena os resultados pelo campo especificado.
    - `sortOrder` (string - `asc`, `desc`): Ordena os resultados em ordem ascendente ou descendente.

**Exemplos de uso com cURL:**

- **Buscar todos os pedidos:**
  ```bash
  curl http://localhost:3000/api/orders
  ```

**Resultado da Execução:**

![Resultado do GET /api/orders](docs/assets/get-orders-result.png)

- **Buscar pelo ID do pedido:**
  ```bash
  curl http://localhost:3000/api/orders?orderId=753
  ```

- **Buscar por intervalo de datas:**
  ```bash
  curl http://localhost:3000/api/orders?startDate=2021-01-01&endDate=2021-03-31
  ```

- **Buscar por ID do produto:**
  ```bash
  curl http://localhost:3000/api/orders?productId=3
  ```

- **Buscar e ordenar por data ascendente:**
  ```bash
  curl http://localhost:3000/api/orders?sortBy=date&sortOrder=asc
  ```

- **Buscar e ordenar por total descendente:**
  ```bash
  curl http://localhost:3000/api/orders?sortBy=total&sortOrder=desc
  ```