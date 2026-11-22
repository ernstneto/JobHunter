# 🚀 JobHunter AI — Relatório Geral do Projeto & Handoff Técnico

**Data de Atualização:** 17 de Novembro de 2026  
**Fase Atual:** Sprint 2.1 — AI Match Scoring & Resilience Completed  
**Status do Ecossistema:** 🟢 100% Funcional Full-Stack (Frontend ↔ Gateway Go ↔ AI Service Python ↔ JSearch & Groq)

---

## 1. Visão Geral do Sistema

O **JobHunter AI** é uma plataforma inteligente para busca de vagas, gerenciamento de carreiras, cálculo de match por IA, otimização de CV e análise ATS. O projeto foi projetado do zero com uma arquitetura microserviços escalável e moderna, mantendo **custo zero (100% Free Tiers)**.

### Diagrama de Arquitetura
┌─────────────────────────┐
│ Frontend (Next.js 15) │ Porta 3000
│ TypeScript + Tailwind │
└────────────┬────────────┘
│ HTTP / JWT
▼
┌─────────────────────────┐
│ API Gateway (Go) │ Porta 8080
│ Auth, Proxy, CORS │
└────────────┬────────────┘
│ Reverse Proxy
▼
┌─────────────────────────┐
│ AI Service (FastAPI) │ Porta 8000
│ Python 3.13 + Pydantic│
└──────┬────────────┬─────┘
│ │
▼ ▼
┌────────────┐ ┌──────────────────────────────────────────────┐
│ JSearch │ │ Engine de IA Híbrido: │
│ RapidAPI │ │ 1. Groq LLM (openai/gpt-oss-20b) │
└────────────┘ │ 2. Fallback NLP Local (Algoritmo Keyword) │
└──────────────────────────────────────────────┘

---

## 2. Status das Sprints e Funcionalidades Entregues

### ✅ P1 — Arquitetura de Integração & Pipelines
- [x] **API Gateway em Go (Porta 8080):** Middlewares de Auth JWT, CORS e proxying assíncrono para o serviço de IA.
- [x] **AI Service em Python 3.13 (Porta 8000):** FastAPI com rotas de scraping, modelos Pydantic v2 e carregamento de `.env` via `load_dotenv()`.
- [x] **Scraper Engine (JSearch API v2):** Varredura em tempo real de agregadores (LinkedIn, Indeed, Glassdoor, Monster).
- [x] **Frontend Next.js (Porta 3000):** Roteamento App Router (`/`, `/login`, `/jobs`), Axios Interceptors para JWT e estilização responsiva com Tailwind CSS.

### ✅ Sprint 2.1 — AI Match Scoring & Resiliência
- [x] **Batching da IA no Groq:** Processamento em lote das vagas em 1 única chamada HTTP para otimizar cotas.
- [x] **Fallback Híbrido de Resiliência:** Caso a API externa de IA sofra *Rate Limit (429)*, *Forbidden (403)* ou instabilidade de rede, o **Algoritmo NLP Local** assume instantaneamente sem falhar a requisição.
- [x] **UI Enriquecida:** Cards exibem Score em Porcentagem com código de cores (Verde, Amarelo, Cinza), bloco de *AI Insight*, tags de *Skills Correspondentes* e *Skills Faltantes (Gaps)*.

---

## 3. Matriz Tecnológica e Custos

| Camada | Tecnologia | Provedor / Runtime | Custo |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TS, Tailwind | Vercel (Futuro) / Localhost | R$ 0,00 |
| **Gateway** | Go (Golang) net/http, JWT, Rate Limiter | Executável Binário Local | R$ 0,00 |
| **AI Service** | Python 3.13, FastAPI, Pydantic, HTTPX | Uvicorn Local / Oracle Cloud (Futuro) | R$ 0,00 |
| **Agregador Vagas**| JSearch API via RapidAPI | Tier Gratuito (500 req/mês) | R$ 0,00 |
| **Engine de IA** | Groq API (openai/gpt-oss-20b) | Tier Gratuito (Rate Limited) | R$ 0,00 |
| **NLP Local** | Algoritmo em Python puro (Fallback) | Execução interna em memória | R$ 0,00 |

---

## 4. Como Executar os Serviços

### Terminal 1 — AI Service (Python)
```powershell
cd "C:\Users\ernst\OneDrive\Documentos\project\JobHunter\jobhunter-ai\services\ai-service"
.\venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8000

### Terminal 2 - API Gateway (Go)
```powershell
cd "C:\Users\ernst\OneDrive\Documentos\project\JobHunter\jobhunter-ai\services\api-gateway"
$env:GOTOOLCHAIN = "local"
$env:AI_SERVICE_URL = "http://127.0.0.1:8000"
$env:PORT = "8080"
.\api-gateway.exe

### Terminal 3 - Frontend (Next.js)
```powershell
cd "C:\Users\ernst\OneDrive\Documentos\project\JobHunter\jobhunter-ai\apps\web"
npm run dev

5. Histórico de Problemas Resolvidos (Lessons Learned)

    Windows IPv6 vs IPv4: localhost resolvendo para ::1 bloqueava requisições do Go para o Uvicorn. Solução: Usar explicitamente 127.0.0.1 nas URLs.
    Pydantic v2 vs os.environ: pydantic-settings carrega variáveis no objeto settings, mas não em os.environ. Solução: Adicionado load_dotenv() como primeira linha do app/main.py.
    PowerShell Quote Escaping: Strings complexas no python -c quebravam no PowerShell. Solução: Uso exclusivo de scripts .py em disco via Set-Content com Here-Strings.
    Resiliência de IA (429/403 Groq): Respostas de limite de taxa no Groq travavam a busca. Solução: Implementada arquitetura de Fallback Híbrido com Matcher NLP local.

6. Próximos Passos no Roadmap
🎯 Próximo Foco: Sprint 2.2 — Perfil do Usuário & Match Multidimensional

    Criar modelo de dados de Perfil/CV Base do Usuário (Skills, Anos de Experiência, Senioridade e Idiomas).
    Atualizar o Motor de IA/NLP para comparar a Vaga contra o Perfil do Usuário + Query de Busca.
    Implementar Ordenação por Match Score (sort by match_score desc) no backend para entregar as vagas mais compatíveis no topo.
    Adicionar detecção de Senioridade exigida e Idiomas obrigatórios.

🎯 Sprints Futuras

    Sprint 2.3: Job Application Tracker (CRM) + Integração com Supabase (PostgreSQL).
    Sprint 2.4: Gerador de CV Customizado por Vaga + Central de Aconselhamento e Cursos Gratuitos para Skill Gaps.

Relatório gerado automaticamente para auditoria e controle de desenvolvimento do JobHunter AI.
