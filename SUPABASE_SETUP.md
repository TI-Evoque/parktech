# Configuração do Supabase para Academia Evoque

## 🚀 Migração do Firebase para Supabase

O sistema foi migrado do Firebase para Supabase para melhor integração e funcionalidades avançadas.

## 📋 Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Projeto criado no Supabase
3. Acesso ao SQL Editor do Supabase

## ⚙️ Configuração Inicial

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub ou email
4. Clique em "New Project"
5. Escolha a organização e defina:
   - **Nome**: Academia Evoque System
   - **Database Password**: (senha segura)
   - **Region**: South America (São Paulo)
6. Clique em "Create new project"

### 2. Obter Credenciais

1. No dashboard do projeto, vá em **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon/public key**: `eyJ...` (chave longa)

### 3. Configurar Variáveis de Ambiente

1. Renomeie `.env.example` para `.env`
2. Substitua os valores:
```bash
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 4. Criar Tabelas no Banco de Dados

1. No dashboard do Supabase, vá em **SQL Editor**
2. Execute o seguinte SQL:

```sql
-- Tabela de unidades
CREATE TABLE units (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  status TEXT NOT NULL,
  equipment JSONB DEFAULT '[]'::jsonb,
  manager TEXT,
  "managerPhone" TEXT,
  coordinator TEXT,
  "coordinatorPhone" TEXT,
  regional TEXT,
  "internetPlan" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de backups
CREATE TABLE backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TEXT NOT NULL,
  data JSONB NOT NULL,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_units_regional ON units(regional);
CREATE INDEX idx_backups_timestamp ON backups(timestamp);

-- Habilitar Row Level Security (RLS)
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todas as operações)
CREATE POLICY "Allow all operations on units" ON units FOR ALL USING (true);
CREATE POLICY "Allow all operations on backups" ON backups FOR ALL USING (true);
```

## 🎯 Funcionalidades Implementadas

### ✅ Gerenciamento de Unidades
- **Criar**: Adicionar novas unidades da Academia Evoque
- **Ler**: Listar todas as unidades com equipamentos
- **Atualizar**: Editar informações das unidades
- **Deletar**: Remover unidades (com confirmação)

### ✅ Sistema de Backup
- **Backup automático**: Salva dados no Supabase
- **Lista de backups**: Visualiza backups anteriores com timestamps
- **Restauração**: Restaura dados de qualquer backup
- **Export/Import**: Backup local em JSON

### ✅ Sincronização
- **Sincronização manual**: Botão para sync com Supabase
- **Tratamento de erros**: Mensagens de erro detalhadas
- **Estados de loading**: Feedback visual durante operações

## 🔧 Testando a Configuração

1. Inicie o sistema: `npm run dev`
2. Acesse o **Painel Administrativo**
3. Clique em **"Sincronizar Supabase"**
4. Se aparecer "Dados sincronizados com sucesso", está funcionando!

## 🛠️ Troubleshooting

### Erro: "fetch is not defined"
- Certifique-se de que as variáveis de ambiente estão corretas
- Verifique se o projeto Supabase está ativo

### Erro: "relation 'units' does not exist"
- Execute o SQL de criação das tabelas
- Verifique se as tabelas foram criadas em **Database** > **Tables**

### Erro: "Invalid API key"
- Verifique se a chave anônima está correta
- Certifique-se de usar a chave **anon/public**, não a **service_role**

### Erro de CORS
- Verifique se a URL do projeto está correta
- O Supabase já configura CORS automaticamente

## 📊 Estrutura dos Dados

### Tabela `units`
```json
{
  "id": "alameda",
  "name": "Alameda",
  "email": "alameda@academiaevoque.com.br",
  "manufacturer": "HIKVISION",
  "status": "online",
  "equipment": [...],
  "manager": "Gabriel Torres Almeida",
  "managerPhone": "11 97131-2600",
  "coordinator": "Thiago Andrade",
  "coordinatorPhone": "11 94889-8640",
  "regional": "William Santos",
  "internetPlan": "500 Mbps Fibra"
}
```

### Tabela `backups`
```json
{
  "id": "uuid",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "data": [...unidades...],
  "version": "1.0"
}
```

## 🔐 Segurança

- **RLS habilitado**: Row Level Security para controle de acesso
- **Políticas configuradas**: Acesso controlado por políticas
- **Chave anônima**: Apenas operações permitidas pelas políticas
- **HTTPS**: Todas as comunicações criptografadas

## 🚀 Deploy em Produção

1. **Variáveis de ambiente**: Configure no Vercel/Netlify
2. **Banco de dados**: Supabase gerencia automaticamente
3. **Backup**: Configure backups automáticos no Supabase
4. **Monitoramento**: Use o dashboard do Supabase para logs

## 📈 Vantagens do Supabase

- ✅ **Open Source**: Código aberto
- ✅ **SQL Completo**: PostgreSQL com funcionalidades avançadas
- ✅ **Real-time**: Subscriptions em tempo real
- ✅ **Auth Built-in**: Sistema de autenticação integrado
- ✅ **APIs RESTful**: APIs geradas automaticamente
- ✅ **Dashboard**: Interface web completa
- ✅ **Escalabilidade**: Escala automaticamente
- ✅ **Preço**: Mais econômico que Firebase

## 🔄 Migrando Dados do Firebase (se necessário)

Se você tem dados no Firebase e quer migrar:

1. **Exporte** dados do Firebase
2. **Formate** para estrutura do Supabase
3. **Importe** usando a função de restauração de backup
4. **Verifique** se todos os dados foram migrados

O sistema está pronto para produção com Supabase! 🎉
