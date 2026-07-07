#!/usr/bin/env bash

# Não para o script se faltar algo simples
set -e

echo "=========================================================="
echo "Gerador de Estrutura: Clean Architecture (HeliosERP)"
echo "=========================================================="

# Criando a estrutura completa do SRC de uma vez só
echo "Criando diretórios de código fonte..."
mkdir -p src/domain/entities
mkdir -p src/domain/value-objects
mkdir -p src/domain/repositories
mkdir -p src/domain/services

mkdir -p src/application/use-cases/stock
mkdir -p src/application/use-cases/order
mkdir -p src/application/use-cases/catalog
mkdir -p src/application/ports

mkdir -p src/infrastructure/database
mkdir -p src/infrastructure/repositories
mkdir -p src/infrastructure/auth
mkdir -p src/infrastructure/http

mkdir -p src/interface/rest
mkdir -p src/interface/events

# Criando a estrutura de TESTES de uma vez só
echo "Criando diretórios de testes..."
mkdir -p __tests__/unit
mkdir -p __tests__/integration
mkdir -p __tests__/e2e

# Criando arquivos de marcação explicitamente para o Git monitorar
echo "Criando arquivos .gitkeep..."
touch src/domain/entities/.gitkeep
touch src/domain/value-objects/.gitkeep
touch src/domain/repositories/.gitkeep
touch src/domain/services/.gitkeep

touch src/application/use-cases/stock/.gitkeep
touch src/application/use-cases/order/.gitkeep
touch src/application/use-cases/catalog/.gitkeep
touch src/application/ports/.gitkeep

touch src/infrastructure/database/.gitkeep
touch src/infrastructure/repositories/.gitkeep
touch src/infrastructure/auth/.gitkeep
touch src/infrastructure/http/.gitkeep

touch src/interface/rest/.gitkeep
touch src/interface/events/.gitkeep

touch __tests__/unit/.gitkeep
touch __tests__/integration/.gitkeep
touch __tests__/e2e/.gitkeep

echo "=========================================================="
echo "✅ Estrutura gerada!"
echo "=========================================================="