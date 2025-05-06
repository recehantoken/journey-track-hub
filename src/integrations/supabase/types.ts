export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      drivers: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          license_number: string
          phone_number: string
          photo_url: string | null
          status: Database["public"]["Enums"]["driver_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id?: string
          license_number?: string
          phone_number: string
          photo_url?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          license_number?: string
          phone_number?: string
          photo_url?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rentals: {
        Row: {
          created_at: string | null
          destination: string
          driver_id: string
          end_date: string
          id: string
          payment_price: number
          payment_status: Database["public"]["Enums"]["payment_status"]
          renter_address: string
          renter_name: string
          renter_phone: string
          start_date: string
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          destination: string
          driver_id: string
          end_date: string
          id?: string
          payment_price?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          renter_address?: string
          renter_name: string
          renter_phone: string
          start_date: string
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          destination?: string
          driver_id?: string
          end_date?: string
          id?: string
          payment_price?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          renter_address?: string
          renter_name?: string
          renter_phone?: string
          start_date?: string
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rentals_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      tracking_history: {
        Row: {
          id: string
          latitude: number
          longitude: number
          rental_id: string | null
          timestamp: string | null
          vehicle_id: string
        }
        Insert: {
          id?: string
          latitude: number
          longitude: number
          rental_id?: string | null
          timestamp?: string | null
          vehicle_id: string
        }
        Update: {
          id?: string
          latitude?: number
          longitude?: number
          rental_id?: string | null
          timestamp?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_history_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          color: string
          created_at: string | null
          current_location_lat: number | null
          current_location_lng: number | null
          id: string
          license_plate: string
          name: string
          note: string | null
          photo_url: string | null
          price: number
          seats: number
          status: Database["public"]["Enums"]["vehicle_status"]
          type: Database["public"]["Enums"]["vehicle_type"]
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          current_location_lat?: number | null
          current_location_lng?: number | null
          id?: string
          license_plate: string
          name: string
          note?: string | null
          photo_url?: string | null
          price?: number
          seats: number
          status?: Database["public"]["Enums"]["vehicle_status"]
          type: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          current_location_lat?: number | null
          current_location_lng?: number | null
          id?: string
          license_plate?: string
          name?: string
          note?: string | null
          photo_url?: string | null
          price?: number
          seats?: number
          status?: Database["public"]["Enums"]["vehicle_status"]
          type?: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          rental_id: string
          invoice_number: string
          customer_name: string
          customer_phone: string
          customer_address: string | null
          amount: number
          status: Database["public"]["Enums"]["payment_status"]
          issued_at: string
          due_at: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          rental_id: string
          invoice_number: string
          customer_name: string
          customer_phone: string
          customer_address?: string | null
          amount: number
          status?: Database["public"]["Enums"]["payment_status"]
          issued_at?: string
          due_at?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          rental_id?: string
          invoice_number?: string
          customer_name?: string
          customer_phone?: string
          customer_address?: string | null
          amount?: number
          status?: Database["public"]["Enums"]["payment_status"]
          issued_at?: string
          due_at?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      driver_status: "active" | "on-duty" | "off"
      payment_status: "pending" | "paid" | "cancelled"
      vehicle_status: "available" | "rented" | "service"
      vehicle_type: "bus" | "elf" | "hi-ace" | "car"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      driver_status: ["active", "on-duty", "off"],
      payment_status: ["pending", "paid", "cancelled"],
      vehicle_status: ["available", "rented", "service"],
      vehicle_type: ["bus", "elf", "hi-ace", "car"],
    },
  },
} as const

// Additional types for AccountingPage
export interface MonthlyIncome {
  month: string;
  income: number;
  count: number;
}

export interface IncomeByPeriod {
  name: string;
  value: number;
}

export interface Vehicle {
  id: string;
  name: string;
  license_plate: string;
  type: Database["public"]["Enums"]["vehicle_type"];
  price: number;
  color: string;
  note: string | null;
  created_at: string;
  updated_at: string | null;
  seats: number;
  status: Database["public"]["Enums"]["vehicle_status"];
  current_location_lat: number | null;
  current_location_lng: number | null;
  photo_url: string | null;
}

export interface Driver {
  id: string;
  full_name: string;
  phone_number: string;
  license_number: string;
  status: Database["public"]["Enums"]["driver_status"];
  created_at: string;
  updated_at: string | null;
  photo_url: string | null;
}

export interface Rental {
  id: string;
  renter_name: string;
  renter_phone: string;
  renter_address: string;
  destination: string;
  vehicle_id: string;
  driver_id: string;
  start_date: string;
  end_date: string;
  payment_price: number;
  payment_status: Database["public"]["Enums"]["payment_status"];
  created_at: string;
  updated_at: string | null;
  vehicle?: Vehicle;
  driver?: Driver;
}

export interface Invoice {
  id: string;
  rental_id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  amount: number;
  status: Database["public"]["Enums"]["payment_status"];
  issued_at: string;
  due_at: string;
  created_at: string | null;
  updated_at: string | null;
  rental?: Rental;
}

export interface TrackingData {
  id: string;
  vehicle_id: string;
  rental_id: string | null;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string | null;
  category: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}