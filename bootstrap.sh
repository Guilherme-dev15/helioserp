#!/usr/bin/env bash

set -euo pipefail

echo "===================================="
echo "GitHub Bootstrap - HeliosERP"
echo "===================================="

REPO="Guilherme-dev15/helioserp"
echo "Repositório Alvo: $REPO"

# Verificar autenticação do GitHub CLI
if ! gh auth status &>/dev/null; then
    echo "❌ Erro: Você não está autenticado no GitHub CLI."
    echo "Por favor, execute: gh auth login"
    exit 1
fi

# Função para criar Milestone de forma segura usando gh api
criar_milestone() {
    local titulo="$1"
    local descricao="$2"
    
    echo "Verificando Milestone: '$titulo'..."
    
    # Listar as milestones existentes via API e checar se o título já existe
    local existe
    existe=$(gh api "repos/$REPO/milestones?state=all" --jq ".[] | select(.title == \"$titulo\") | .title")

    if [ -n "$existe" ]; then
        echo "⚠️ Milestone '$titulo' já existe. Pulando criação."
    else
        echo "🚀 Criando Milestone: '$titulo'..."
        gh api -X POST "repos/$REPO/milestones" -f title="$titulo" -f description="$descricao" > /dev/null
    fi
}

# Função para criar Issue de forma segura
criar_issue() {
    local titulo="$1"
    local corpo="$2"
    local milestone_titulo="$3"
    
    echo "Verificando Issue: '$titulo'..."
    
    # Listar issues existentes com o mesmo título para evitar duplicações
    local existe
    existe=$(gh issue list --repo "$REPO" --state all --json title --jq ".[] | select(.title == \"$titulo\") | .title")

    if [ -n "$existe" ]; then
        echo "⚠️ Issue '$titulo' já existe. Pulando criação."
    else
        echo "🚀 Criando Issue: '$titulo'..."
        # O gh issue create aceita o nome textual da milestone diretamente no parâmetro --milestone
        gh issue create --repo "$REPO" --title "$titulo" --body "$corpo" --milestone "$milestone_titulo"
    fi
}

# ==============================================================================
# 1. CRIAÇÃO DAS MILESTONES (MARCOS DO PROJETO)
# ==============================================================================

echo "------------------------------------"
echo "Criando Milestones..."
echo "------------------------------------"

criar_milestone "MILESTONE 1 — FUNDAÇÃO (Semana 1)" "Critério de saída: pipeline CI verde, nenhum teste falhando, tenant isolado."
criar_milestone "MILESTONE 2 — MÓDULO DE ESTOQUE (Semana 1–2)" "Critério de saída: 100% de cobertura de testes no motor de estoque."
criar_milestone "MILESTONE 3 — CATÁLOGO + CHECKOUT (Semana 2–3)" "Critério de saída: fluxo completo de venda funcionando em mobile sem erros."
criar_milestone "MILESTONE 4 — PAINEL ADMIN + KANBAN (Semana 3–4)" "Critério de saída: dono da adega consegue abrir, vender e fechar o dia."
criar_milestone "MILESTONE 5 — PRÉ-PRODUÇÃO & DEPLOY (Semana 4–5)" "Critério de saída: primeiro pedido real processado em produção."

# ==============================================================================
# 2. CRIAÇÃO DAS ISSUES (TAREFAS POR MARCO)
# ==============================================================================

echo "------------------------------------"
echo "Criando Issues..."
echo "------------------------------------"

# --- MILESTONE 1 ---
M1="MILESTONE 1 — FUNDAÇÃO (Semana 1)"
criar_issue "Configuração do Repositório GitHub" "Configurar branches, regras de proteções de branch e GitHub Actions estruturado." "$M1"
criar_issue "Estrutura de pastas Clean Architecture" "Implementar o esqueleto e design pattern da arquitetura limpa no projeto." "$M1"
criar_issue "Configuração de Ambiente de Desenvolvimento" "Montar o Docker Compose (dev) + ambiente para CI básico." "$M1"
criar_issue "Modelagem de dados completa + migrations" "Definição do esquema de banco de dados e criação das migrações iniciais." "$M1"
criar_issue "Multitenancy ativo no banco" "Implementar isolamento por Row Level Security (RLS) ou filtro global por tenant_id." "$M1"
criar_issue "Autenticação + RBAC básico" "Desenvolver sistema de login com RBAC para regras de Admin, Vendedor e Entregador." "$M1"

# --- MILESTONE 2 ---
M2="MILESTONE 2 — MÓDULO DE ESTOQUE (Semana 1–2)"
criar_issue "CRUD de Produtos com variantes" "Desenvolver cadastro de produtos aceitando categorias, código EAN e cálculo de markup." "$M2"
criar_issue "Motor de Estoque com concorrência" "Criar o core do motor de estoque bloqueando cenários de race condition." "$M2"
criar_issue "Alertas de estoque mínimo" "Implementar gatilhos e avisos para produtos que atingirem a quantidade mínima." "$M2"
criar_issue "Upload de imagem de produto" "Integrar serviço para armazenamento e upload de imagens dos produtos." "$M2"

# --- MILESTONE 3 ---
M3="MILESTONE 3 — CATÁLOGO + CHECKOUT (Semana 2–3)"
criar_issue "Catálogo público por tenant" "Criar rota dinâmica e pública acessível por /loja/:slug para listagem de itens." "$M3"
criar_issue "Busca e filtros Mobile-First" "Interface de busca e refinamento otimizada prioritariamente para smartphones." "$M3"
criar_issue "Carrinho persistente local" "Desenvolver configuração no LocalStorage permitindo adição sem login obrigatório." "$M3"
criar_issue "Checkout com identificação leve" "Formulário rápido solicitando apenas Nome + WhatsApp do cliente." "$M3"
criar_issue "Integração e envio para WhatsApp" "Gerar link e URL formatada contendo o payload detalhado do pedido." "$M3"
criar_issue "Seleção de modalidade de entrega" "Opção de escolha pelo usuário entre Retirada no local ou Delivery." "$M3"

# --- MILESTONE 4 ---
M4="MILESTONE 4 — PAINEL ADMIN + KANBAN (Semana 3–4)"
criar_issue "Kanban de pedidos com FSM" "Painel visual em colunas aplicando uma Máquina de Estados Finita (FSM)." "$M4"
criar_issue "Transição de status e log de auditoria" "Registrar histórico e logs detalhados para cada mudança de status do pedido." "$M4"
criar_issue "Link de rastreamento público" "Criar tela anônima de consulta em tempo real do andamento de um pedido." "$M4"
criar_issue "Painel de métricas financeiras" "Métricas de negócio essenciais: CMV, Lucro, Ticket Médio e classificação Curva ABC." "$M4"

# --- MILESTONE 5 ---
M5="MILESTONE 5 — PRÉ-PRODUÇÃO & DEPLOY (Semana 4–5)"
criar_issue "Testes E2E do fluxo crítico" "Cobrir o fluxo de ponta a ponta: do cliente criando o pedido até a confirmação admin." "$M5"
criar_issue "Hardening de segurança" "Aplicar proteções essenciais como rate limit, validação rigorosa de inputs e CORS." "$M5"
criar_issue "Documentação de Variáveis de Ambiente" "Atualizar e detalhar todas as configurações fundamentais no .env.example." "$M5"
criar_issue "Deploy em staging + smoke tests" "Publicar em ambiente de homologação simulando produção com testes rápidos." "$M5"
criar_issue "Deploy em produção + monitoramento" "Subir o projeto em ambiente live com ferramentas básicas de coleta de logs de erro." "$M5"
criar_issue "Documentação de API (Swagger/OpenAPI)" "Configurar a auto-geração automática de rotas via NestJS." "$M5"

echo "===================================="
echo "✅ Importação de metas finalizada!"
echo "===================================="
