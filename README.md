# Ticket Health API + Fake Front (Portfolio)

Uma aplicação full-stack composta por uma API de chamados desenvolvida em aula, integrada a um frontend autoral com simulador de API persistente para demonstração prática e interativa.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ESModules-F7DF1E?logo=javascript&logoColor=111)
![Three.js](https://img.shields.io/badge/Three.js-black?logo=threedotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)

**Repositório:** https://github.com/juninalmeida/ticket-health-api

## Visão Geral

Este repositório foi organizado em duas frentes independentes para demonstrar habilidades de backend e frontend:

- **`/src`**: API real de gestão de tickets, desenvolvida originalmente em conjunto com a Rocketseat.
- **`/docs/apiFakeFront`**: Frontend autoral e totalmente customizado, acompanhado de uma "Fake API" baseada em `localStorage`, desenvolvido exclusivamente para composição de portfólio e demonstração estática.

### Contexto de Deploy e Uso

- A API original (Node.js) **não está exposta** publicamente. Para validação de suas rotas durante o desenvolvimento, utilizou-se o **Insomnia**.
- O frontend publicado no GitHub Pages simula as requisições à API, provendo uma experiência completa ("ponta a ponta") de uso da ferramenta diretamente no navegador, sem a necessidade de rodar o backend localmente.

## O Problema e a Solução

**Problema:** A API construída é puramente backend. Sem uma interface, o fluxo completo de interação e a utilidade prática do sistema ficavam abstratos.  
**Solução:** Foi projetado e desenvolvido um frontend modular, responsivo e interativo. Ele replica fielmente os comportamentos esperados pela API e persiste os dados localmente, permitindo que qualquer pessoa teste a aplicação completa por meio do deploy estático.

## Stack Tecnológico

- **Backend (API Real):** Node.js (HTTP nativo, arquitetura ESM) localizado em `src/`
- **Frontend (Interface & Fake API):** HTML5, CSS3, JavaScript (ES Modules) e WebGL (Three.js) localizados em `docs/apiFakeFront/`
- **Testes de API:** Insomnia

## Funcionalidades e Diferenciais

### Core da Aplicação

- Listagem e filtragem de tickets dinamicamente por status (`open` / `closed`).
- Motor de busca integrado por equipamento, descrição e nome do solicitante.
- CRUD Completo: Criação, edição, encerramento e remoção de chamados.
- Dashboard de estatísticas e painel resumido (tickets abertos vs. resolvidos).
- Funcionalidade de "Reset de Seed" para restaurar os dados de demonstração.

### UX, UI e Validações

- **Design Moderno e Imersivo:** Fundo dinâmico animado renderizado via WebGL com **Three.js**.
- **Micro-interações:** Efeitos de *spotlight* interativos ao passar o mouse sobre os cards de tickets e animações fluidas nos botões de ação estruturados para enriquecer a experiência do usuário.
- **Responsividade e Acessibilidade:** Abordagem *mobile-first* com navegação por abas otimizada e atributos de acessibilidade (a11y) aprimorados.
- Identidade visual customizada com iconografia em formato SVG.
- Validação robusta de formulários com *Toasts* de feedback (sucesso, aviso, erro).
- Modais interativos para fluxos de criação, edição e encerramento.
- *Empty states* amigáveis para listas vazias.
- Persistência de dados local com estratégia de *fallback* para sessão quando requisições simuladas falham.

## Arquitetura do Frontend

O frontend foi estruturado para ser dinâmico, escalável e de fácil manutenção, separando responsabilidades de negócio, estado e renderização:

```text
main.js (Ponto de entrada)
  ↳ actions.js (Regras de negócio e handlers)
    ↳ ticketsRepoLocal.js (Fake API + Gerenciamento de Persistência)
      ↳ store.js (Gerenciamento de Estado Centralizado)
        ↳ renderApp.js / templates.js (Renderização reativa da UI)
```

**Decisões Arquiteturais Chave:**

1. **Separação de Contextos:** Isolar a API real da demonstração em diretórios diferentes garante clareza sobre o escopo do frontend autoral.
2. **Fake API Modular:** Permite o deploy estático no GitHub Pages e viabiliza a demonstração interativa do sistema sem complexidade de infraestrutura.
3. **Desacoplamento de UI e Estado:** Facilita a escalabilidade, permitindo manutenção e adição de features visuais de maneira isolada (como a recente adição do Three.js).
4. **Segurança no Render:** Mitigação de riscos de XSS na manipulação de dados na camada visual através da geração segura de templates.

## Scripts Disponíveis

- `npm run dev` -> Inicia a API HTTP via backend em modo watch (`src/server.js`).

## Estrutura do Projeto

```text
ticket-health-api/
├── src/                    # API real (Backend Node.js)
├── docs/
│   └── apiFakeFront/       # Frontend autoral + Fake API interativa
├── package.json
└── README.md
```

## Autor

**Horacio Junior**  
- GitHub: https://github.com/juninalmeida  
- LinkedIn: https://www.linkedin.com/in/júnior-almeida-3563a934b/  
- Email: junioralmeidati2023@gmail.com
