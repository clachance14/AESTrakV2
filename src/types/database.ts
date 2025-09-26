export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          acknowledged_at: string | null;
          acknowledged_by: string | null;
          created_at: string;
          id: string;
          level: Database['public']['Enums']['alert_level'];
          message: string | null;
          organization_id: string;
          purchase_order_id: string;
          status: Database['public']['Enums']['alert_status'];
          threshold: number;
          updated_at: string;
          utilization_percent: number;
        };
        Insert: {
          acknowledged_at?: string | null;
          acknowledged_by?: string | null;
          created_at?: string;
          id?: string;
          level: Database['public']['Enums']['alert_level'];
          message?: string | null;
          organization_id: string;
          purchase_order_id: string;
          status?: Database['public']['Enums']['alert_status'];
          threshold: number;
          updated_at?: string;
          utilization_percent: number;
        };
        Update: {
          acknowledged_at?: string | null;
          acknowledged_by?: string | null;
          created_at?: string;
          id?: string;
          level?: Database['public']['Enums']['alert_level'];
          message?: string | null;
          organization_id?: string;
          purchase_order_id?: string;
          status?: Database['public']['Enums']['alert_status'];
          threshold?: number;
          updated_at?: string;
          utilization_percent?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'alerts_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'alerts_purchase_order_id_fkey';
            columns: ['purchase_order_id'];
            isOneToOne: false;
            referencedRelation: 'purchase_orders';
            referencedColumns: ['id'];
          },
        ];
      };
      audit_logs: {
        Row: {
          acted_at: string;
          acted_by: string | null;
          action: string;
          after: Json | null;
          before: Json | null;
          context: Json | null;
          entity_id: string;
          entity_type: string;
          id: string;
          organization_id: string;
        };
        Insert: {
          acted_at?: string;
          acted_by?: string | null;
          action: string;
          after?: Json | null;
          before?: Json | null;
          context?: Json | null;
          entity_id: string;
          entity_type: string;
          id?: string;
          organization_id: string;
        };
        Update: {
          acted_at?: string;
          acted_by?: string | null;
          action?: string;
          after?: Json | null;
          before?: Json | null;
          context?: Json | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          organization_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      import_jobs: {
        Row: {
          created_at: string;
          created_by: string;
          error_count: number | null;
          error_report_path: string | null;
          file_name: string | null;
          id: string;
          metadata: Json | null;
          organization_id: string;
          row_count: number | null;
          status: Database['public']['Enums']['import_job_status'];
          type: Database['public']['Enums']['import_job_type'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          error_count?: number | null;
          error_report_path?: string | null;
          file_name?: string | null;
          id?: string;
          metadata?: Json | null;
          organization_id: string;
          row_count?: number | null;
          status?: Database['public']['Enums']['import_job_status'];
          type: Database['public']['Enums']['import_job_type'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          error_count?: number | null;
          error_report_path?: string | null;
          file_name?: string | null;
          id?: string;
          metadata?: Json | null;
          organization_id?: string;
          row_count?: number | null;
          status?: Database['public']['Enums']['import_job_status'];
          type?: Database['public']['Enums']['import_job_type'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'import_jobs_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      organization_members: {
        Row: {
          invited_at: string;
          joined_at: string | null;
          organization_id: string;
          role: Database['public']['Enums']['member_role'];
          status: Database['public']['Enums']['member_status'];
          user_id: string;
        };
        Insert: {
          invited_at?: string;
          joined_at?: string | null;
          organization_id: string;
          role?: Database['public']['Enums']['member_role'];
          status?: Database['public']['Enums']['member_status'];
          user_id: string;
        };
        Update: {
          invited_at?: string;
          joined_at?: string | null;
          organization_id?: string;
          role?: Database['public']['Enums']['member_role'];
          status?: Database['public']['Enums']['member_status'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organization_members_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          plan: string;
          stripe_customer_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          name: string;
          plan?: string;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          plan?: string;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_orders: {
        Row: {
          company: string | null;
          completion_date: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          order_short_text: string | null;
          order_value: number;
          organization_id: string;
          purchase_order_no: string;
          remaining_budget: number;
          start_date: string | null;
          status: string;
          total_spent: number;
          updated_at: string;
          updated_by: string | null;
          utilization_percent: number;
          vendor_id: string | null;
          vendor_short_term: string | null;
          work_coordinator_name: string | null;
        };
        Insert: {
          company?: string | null;
          completion_date?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          order_short_text?: string | null;
          order_value?: number;
          organization_id: string;
          purchase_order_no: string;
          remaining_budget?: number;
          start_date?: string | null;
          status?: string;
          total_spent?: number;
          updated_at?: string;
          updated_by?: string | null;
          utilization_percent?: number;
          vendor_id?: string | null;
          vendor_short_term?: string | null;
          work_coordinator_name?: string | null;
        };
        Update: {
          company?: string | null;
          completion_date?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          order_short_text?: string | null;
          order_value?: number;
          organization_id?: string;
          purchase_order_no?: string;
          remaining_budget?: number;
          start_date?: string | null;
          status?: string;
          total_spent?: number;
          updated_at?: string;
          updated_by?: string | null;
          utilization_percent?: number;
          vendor_id?: string | null;
          vendor_short_term?: string | null;
          work_coordinator_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'purchase_orders_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      quantity_surveys: {
        Row: {
          accepted_date: string | null;
          accounting_document: string | null;
          contractor_contact: string | null;
          created_at: string;
          created_date: string | null;
          id: string;
          import_job_id: string | null;
          invoice_date: string | null;
          invoice_number: string | null;
          organization_id: string;
          purchase_order_id: string | null;
          purchase_order_no: string;
          qs_number: string;
          quantity_survey_short_text: string | null;
          total: number;
          transfer_date: string | null;
          updated_at: string;
          vendor_id: string | null;
        };
        Insert: {
          accepted_date?: string | null;
          accounting_document?: string | null;
          contractor_contact?: string | null;
          created_at?: string;
          created_date?: string | null;
          id?: string;
          import_job_id?: string | null;
          invoice_date?: string | null;
          invoice_number?: string | null;
          organization_id: string;
          purchase_order_id?: string | null;
          purchase_order_no: string;
          qs_number: string;
          quantity_survey_short_text?: string | null;
          total?: number;
          transfer_date?: string | null;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Update: {
          accepted_date?: string | null;
          accounting_document?: string | null;
          contractor_contact?: string | null;
          created_at?: string;
          created_date?: string | null;
          id?: string;
          import_job_id?: string | null;
          invoice_date?: string | null;
          invoice_number?: string | null;
          organization_id?: string;
          purchase_order_id?: string | null;
          purchase_order_no?: string;
          qs_number?: string;
          quantity_survey_short_text?: string | null;
          total?: number;
          transfer_date?: string | null;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'quantity_surveys_import_job_id_fkey';
            columns: ['import_job_id'];
            isOneToOne: false;
            referencedRelation: 'import_jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'quantity_surveys_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'quantity_surveys_purchase_order_id_fkey';
            columns: ['purchase_order_id'];
            isOneToOne: false;
            referencedRelation: 'purchase_orders';
            referencedColumns: ['id'];
          },
        ];
      };
      subscriptions: {
        Row: {
          current_period_end: string | null;
          metadata: Json | null;
          organization_id: string;
          seats_allocated: number | null;
          seats_used: number | null;
          status: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
        };
        Insert: {
          current_period_end?: string | null;
          metadata?: Json | null;
          organization_id: string;
          seats_allocated?: number | null;
          seats_used?: number | null;
          status?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
        };
        Update: {
          current_period_end?: string | null;
          metadata?: Json | null;
          organization_id?: string;
          seats_allocated?: number | null;
          seats_used?: number | null;
          status?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: true;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      user_profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          mfa_enabled: boolean;
          phone: string | null;
          timezone: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          mfa_enabled?: boolean;
          phone?: string | null;
          timezone?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          mfa_enabled?: boolean;
          phone?: string | null;
          timezone?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_org_admin: {
        Args: { org_id: string };
        Returns: boolean;
      };
      is_org_member: {
        Args: { org_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      alert_level: 'on_track' | 'warning' | 'critical' | 'over_budget';
      alert_status: 'active' | 'acknowledged' | 'resolved';
      import_job_status: 'pending' | 'processing' | 'succeeded' | 'failed';
      import_job_type: 'purchase_orders' | 'quantity_surveys';
      member_role: 'admin' | 'member';
      member_status: 'invited' | 'active';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      alert_level: ['on_track', 'warning', 'critical', 'over_budget'],
      alert_status: ['active', 'acknowledged', 'resolved'],
      import_job_status: ['pending', 'processing', 'succeeded', 'failed'],
      import_job_type: ['purchase_orders', 'quantity_surveys'],
      member_role: ['admin', 'member'],
      member_status: ['invited', 'active'],
    },
  },
} as const;
