export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      affiliate_clicks: {
        Row: {
          affiliate_id: string
          created_at: string
          id: string
          ip_address: unknown
          product_id: string | null
          referrer: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          id?: string
          ip_address?: unknown
          product_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          product_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_commissions: {
        Row: {
          affiliate_id: string
          commission_amount: number
          commission_rate: number
          created_at: string
          id: string
          order_amount: number
          order_id: string
          product_id: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          commission_amount: number
          commission_rate?: number
          created_at?: string
          id?: string
          order_amount: number
          order_id: string
          product_id?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          order_amount?: number
          order_id?: string
          product_id?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          code: string
          created_at: string
          id: string
          pending_earnings: number
          status: string
          total_clicks: number
          total_conversions: number
          total_earnings: number
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          pending_earnings?: number
          status?: string
          total_clicks?: number
          total_conversions?: number
          total_earnings?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          pending_earnings?: number
          status?: string
          total_clicks?: number
          total_conversions?: number
          total_earnings?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_holder_name: string
          account_number: string
          bank_name: string
          branch: string | null
          created_at: string
          id: string
          is_primary: boolean | null
          is_verified: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_holder_name: string
          account_number: string
          bank_name: string
          branch?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          bank_name?: string
          branch?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          affiliate_id: string | null
          buyer_email: string
          buyer_id: string
          buyer_name: string | null
          commission_amount: number
          commission_rate: number
          created_at: string
          download_count: number | null
          download_expires_at: string | null
          download_link: string | null
          id: string
          max_downloads: number | null
          notes: string | null
          order_number: string
          product_id: string
          quantity: number
          seller_amount: number
          seller_id: string
          seller_referrer_affiliate_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          affiliate_id?: string | null
          buyer_email: string
          buyer_id: string
          buyer_name?: string | null
          commission_amount: number
          commission_rate: number
          created_at?: string
          download_count?: number | null
          download_expires_at?: string | null
          download_link?: string | null
          id?: string
          max_downloads?: number | null
          notes?: string | null
          order_number: string
          product_id: string
          quantity?: number
          seller_amount: number
          seller_id: string
          seller_referrer_affiliate_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          affiliate_id?: string | null
          buyer_email?: string
          buyer_id?: string
          buyer_name?: string | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          download_count?: number | null
          download_expires_at?: string | null
          download_link?: string | null
          id?: string
          max_downloads?: number | null
          notes?: string | null
          order_number?: string
          product_id?: string
          quantity?: number
          seller_amount?: number
          seller_id?: string
          seller_referrer_affiliate_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          gateway_response: Json | null
          id: string
          order_id: string
          payment_id: string | null
          payment_method: string
          processed_at: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          gateway_response?: Json | null
          id?: string
          order_id: string
          payment_id?: string | null
          payment_method: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          gateway_response?: Json | null
          id?: string
          order_id?: string
          payment_id?: string | null
          payment_method?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          download_count: number | null
          download_only_link: string | null
          file_format: string | null
          file_size: string | null
          google_drive_link: string
          id: string
          images: string[] | null
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          original_price: number | null
          preview_link: string | null
          price: number
          rating_average: number | null
          rating_count: number | null
          read_only: boolean
          seller_id: string
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"] | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          download_count?: number | null
          download_only_link?: string | null
          file_format?: string | null
          file_size?: string | null
          google_drive_link: string
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          original_price?: number | null
          preview_link?: string | null
          price: number
          rating_average?: number | null
          rating_count?: number | null
          read_only?: boolean
          seller_id: string
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          download_count?: number | null
          download_only_link?: string | null
          file_format?: string | null
          file_size?: string | null
          google_drive_link?: string
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          original_price?: number | null
          preview_link?: string | null
          price?: number
          rating_average?: number | null
          rating_count?: number | null
          read_only?: boolean
          seller_id?: string
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_verified: boolean | null
          phone: string | null
          referred_by_affiliate_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          seller_commission_rate: number | null
          total_purchases: number | null
          total_sales: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          referred_by_affiliate_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          seller_commission_rate?: number | null
          total_purchases?: number | null
          total_sales?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          referred_by_affiliate_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          seller_commission_rate?: number | null
          total_purchases?: number | null
          total_sales?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          buyer_id: string
          comment: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          buyer_id: string
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_followers: {
        Row: {
          created_at: string
          follower_id: string
          id: string
          seller_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          id?: string
          seller_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          id?: string
          seller_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webtoon_chapters: {
        Row: {
          created_at: string
          drive_file_id: string
          id: string
          number: number
          title: string
          webtoon_id: string
        }
        Insert: {
          created_at?: string
          drive_file_id: string
          id?: string
          number: number
          title?: string
          webtoon_id: string
        }
        Update: {
          created_at?: string
          drive_file_id?: string
          id?: string
          number?: number
          title?: string
          webtoon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webtoon_chapters_webtoon_id_fkey"
            columns: ["webtoon_id"]
            isOneToOne: false
            referencedRelation: "webtoons"
            referencedColumns: ["id"]
          },
        ]
      }
      webtoons: {
        Row: {
          author: string
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string
          genres: string[]
          id: string
          is_featured: boolean
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          genres?: string[]
          id?: string
          is_featured?: boolean
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          genres?: string[]
          id?: string
          is_featured?: boolean
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          bank_account_id: string
          created_at: string
          fee: number | null
          id: string
          net_amount: number
          processed_at: string | null
          rejected_reason: string | null
          requested_at: string
          status: Database["public"]["Enums"]["withdrawal_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          bank_account_id: string
          created_at?: string
          fee?: number | null
          id?: string
          net_amount: number
          processed_at?: string | null
          rejected_reason?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          bank_account_id?: string
          created_at?: string
          fee?: number | null
          id?: string
          net_amount?: number
          processed_at?: string | null
          rejected_reason?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_products: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          download_count: number | null
          download_only_link: string | null
          file_format: string | null
          file_size: string | null
          id: string | null
          images: string[] | null
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          original_price: number | null
          preview_link: string | null
          price: number | null
          rating_average: number | null
          rating_count: number | null
          read_only: boolean | null
          seller_id: string | null
          short_description: string | null
          slug: string | null
          status: Database["public"]["Enums"]["product_status"] | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          download_only_link?: string | null
          file_format?: string | null
          file_size?: string | null
          id?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          original_price?: number | null
          preview_link?: string | null
          price?: number | null
          rating_average?: number | null
          rating_count?: number | null
          read_only?: boolean | null
          seller_id?: string | null
          short_description?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["product_status"] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          download_only_link?: string | null
          file_format?: string | null
          file_size?: string | null
          id?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          original_price?: number | null
          preview_link?: string | null
          price?: number | null
          rating_average?: number | null
          rating_count?: number | null
          read_only?: boolean | null
          seller_id?: string | null
          short_description?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["product_status"] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          is_verified: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          total_sales: number | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          is_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          total_sales?: number | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          is_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          total_sales?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_order_number: { Args: never; Returns: string }
      get_my_profile: {
        Args: never
        Returns: {
          address: string | null
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_verified: boolean | null
          phone: string | null
          referred_by_affiliate_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          seller_commission_rate: number | null
          total_purchases: number | null
          total_sales: number | null
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_product_download_link: {
        Args: { _product_id: string }
        Returns: string
      }
      get_seller_download_only_link: {
        Args: { _product_id: string }
        Returns: string
      }
      get_seller_order_amounts: {
        Args: never
        Returns: {
          seller_amount: number
          status: Database["public"]["Enums"]["order_status"]
        }[]
      }
      get_seller_orders: {
        Args: never
        Returns: {
          affiliate_id: string
          buyer_id: string
          buyer_name: string
          commission_amount: number
          commission_rate: number
          created_at: string
          download_count: number
          download_expires_at: string
          download_link: string
          id: string
          max_downloads: number
          notes: string
          order_number: string
          product_id: string
          product_price: number
          product_slug: string
          product_thumbnail: string
          product_title: string
          quantity: number
          seller_amount: number
          seller_id: string
          seller_referrer_affiliate_id: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          unit_price: number
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_affiliate_click: {
        Args: {
          _code: string
          _product_id?: string
          _referrer?: string
          _user_agent?: string
          _visitor_id?: string
        }
        Returns: string
      }
      resolve_affiliate_code: { Args: { _code: string }; Returns: string }
      set_seller_referrer: { Args: { _code: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "seller" | "buyer"
      order_status: "pending" | "paid" | "delivered" | "cancelled" | "refunded"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      product_status: "draft" | "active" | "inactive" | "suspended"
      user_role: "admin" | "seller" | "buyer"
      withdrawal_status: "pending" | "processing" | "completed" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "seller", "buyer"],
      order_status: ["pending", "paid", "delivered", "cancelled", "refunded"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      product_status: ["draft", "active", "inactive", "suspended"],
      user_role: ["admin", "seller", "buyer"],
      withdrawal_status: ["pending", "processing", "completed", "rejected"],
    },
  },
} as const
