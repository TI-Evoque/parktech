import { createClient } from '@supabase/supabase-js';
import { AcademyUnit } from '../types/academy';

// Configuração do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseService {
  // Salvar todas as unidades
  static async saveUnits(units: AcademyUnit[]): Promise<void> {
    try {
      // Primeiro, deletar todas as unidades existentes
      await supabase.from('units').delete().neq('id', '');
      
      // Depois, inserir as novas unidades
      const { error } = await supabase
        .from('units')
        .insert(units);

      if (error) {
        throw error;
      }
      
      console.log('Unidades salvas com sucesso no Supabase');
    } catch (error) {
      console.error('Erro ao salvar unidades:', error);
      throw error;
    }
  }

  // Carregar todas as unidades
  static async loadUnits(): Promise<AcademyUnit[]> {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      console.log('Unidades carregadas do Supabase');
      return data || [];
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      throw error;
    }
  }

  // Atualizar uma unidade específica
  static async updateUnit(unit: AcademyUnit): Promise<void> {
    try {
      const { error } = await supabase
        .from('units')
        .upsert(unit, { onConflict: 'id' });

      if (error) {
        throw error;
      }
      
      console.log('Unidade atualizada no Supabase');
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error);
      throw error;
    }
  }

  // Deletar uma unidade
  static async deleteUnit(unitId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unitId);

      if (error) {
        throw error;
      }
      
      console.log('Unidade deletada do Supabase');
    } catch (error) {
      console.error('Erro ao deletar unidade:', error);
      throw error;
    }
  }

  // Criar backup dos dados
  static async createBackup(): Promise<string> {
    try {
      const units = await this.loadUnits();
      const backup = {
        timestamp: new Date().toISOString(),
        data: units,
        version: '1.0'
      };
      
      const { data, error } = await supabase
        .from('backups')
        .insert(backup)
        .select('id')
        .single();

      if (error) {
        throw error;
      }
      
      console.log('Backup criado com ID:', data.id);
      return data.id;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw error;
    }
  }

  // Listar backups disponíveis
  static async listBackups(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      throw error;
    }
  }

  // Restaurar backup
  static async restoreBackup(backupId: string): Promise<AcademyUnit[]> {
    try {
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .eq('id', backupId)
        .single();

      if (error || !data) {
        throw new Error('Backup não encontrado');
      }

      // Restaurar dados
      await this.saveUnits(data.data);
      console.log('Backup restaurado com sucesso');
      return data.data;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      throw error;
    }
  }

  // Inicializar tabelas (executar uma vez para criar estrutura)
  static async initializeTables(): Promise<void> {
    try {
      // Esta função seria usada para criar as tabelas via SQL
      // No Supabase, você criaria as tabelas via Dashboard ou SQL:
      
      /*
      -- Tabela de unidades
      CREATE TABLE units (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        manufacturer TEXT NOT NULL,
        status TEXT NOT NULL,
        equipment JSONB DEFAULT '[]'::jsonb,
        manager TEXT,
        managerPhone TEXT,
        coordinator TEXT,
        coordinatorPhone TEXT,
        regional TEXT,
        internetPlan TEXT,
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
      */

      console.log('Para inicializar as tabelas, execute o SQL acima no Dashboard do Supabase');
    } catch (error) {
      console.error('Erro ao inicializar tabelas:', error);
      throw error;
    }
  }

  // Testar conexão
  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('count')
        .limit(1);

      if (error) {
        console.warn('Tabela units não existe ainda. Execute initializeTables()');
        return false;
      }
      
      console.log('Conexão com Supabase estabelecida com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  }
}
