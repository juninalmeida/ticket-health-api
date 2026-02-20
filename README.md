# Ticket Health API + Fake Front (Portfolio)

API de chamados feita em aula + frontend autoral com fake API persistente para demonstração prática.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ESModules-F7DF1E?logo=javascript&logoColor=111)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)

**Repositório:** https://github.com/juninalmeida/ticket-health-api  

## Visão geral

Neste repositório eu organizo duas partes com objetivos diferentes:

- **`/src`**: API real de tickets que eu construí em aula com o professor da Rocketseat Rodrigo Gonçalves.
- **`/docs/apiFakeFront`**: frontend autoral + fake API local (com `localStorage`) que eu criei para portfólio.

### O que é importante entender

- A API de `/src` **não está hospedada** para consumo público no deploy do portfólio.
- Para demonstrar a experiência completa no GitHub Pages, eu simulo as rotas no front com persistência local.
- Para validar as rotas da API real durante o desenvolvimento, eu usei **Insomnia**.
- O frontend e a fake API local foram implementados por mim.

## Problema e solução

**Problema:** a API de aula funciona, mas sem interface não dá para visualizar o fluxo completo de uso.  
**Solução:** eu criei um front modular que replica os comportamentos principais da API e persiste dados localmente para a demo funcionar de ponta a ponta.

## Stack

- **Backend (aula):** Node.js (HTTP nativo, ESM) em `src/`
- **Frontend (autoral):** HTML + CSS + JavaScript ES Modules em `docs/apiFakeFront/`
- **Ferramenta de teste de rotas:** Insomnia

## Funcionalidades

### Core

- Listagem de tickets por status (`open` / `closed`)
- Busca por equipamento, descrição e solicitante
- Criar, editar, encerrar e remover chamados
- Cards de estatística (abertos e resolvidos)
- Reset de seed para demonstração

### UX e validações

- Validação de campos nos formulários
- Toasts de feedback (sucesso, aviso e erro)
- Modais para criação/edição/encerramento
- Empty state para lista vazia
- Persistência local com fallback de sessão quando `localStorage` falha

## Arquitetura do front

Fluxo principal:

```text
main.js
  -> actions.js (regras de negócio)
    -> ticketsRepoLocal.js (fake API + persistência)
      -> store.js (estado)
        -> renderApp.js/templates.js (render de UI)
```

Decisões técnicas que eu tomei:

1. **Separar API real e demo de portfólio**
- Evita confusão de autoria e deixa explícito o que é código de aula vs implementação autoral.

2. **Fake API local para deploy estático**
- GitHub Pages não executa Node.js, então a simulação local permite mostrar os fluxos funcionando.

3. **Front modular (estado, ações, render, UI)**
- Facilita manutenção e evolução sem acoplamento excessivo.

4. **Render seguro para dados de usuário**
- Reduz risco de XSS e melhora robustez.


## Scripts disponíveis

- `npm run dev` -> inicia a API em modo watch (`src/server.js`)


## Estrutura do projeto

```text
ticket-health-api/
├── src/                    # API real (aula Rocketseat)
├── docs/
│   └── apiFakeFront/       # Front autoral + fake API local
├── package.json
└── README.md
```

## Autor

**Horacio Junior**  
GitHub: https://github.com/juninalmeida  
LinkedIn: https://www.linkedin.com/in/júnior-almeida-3563a934b/  
Email: junioralmeidati2023@gmail.com
