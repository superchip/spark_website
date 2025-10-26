// Database types matching Supabase schema
export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  display_name: string | null;
  avatar_url: string | null;
  premium_tier: 'free' | 'premium';
  subscription_ends_at: string | null;
}

export interface Goal {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  status: 'active' | 'paused' | 'completed' | 'archived';
  total_sparks_completed: number;
}

export interface Spark {
  id: string;
  goal_id: string;
  created_at: string;
  title: string;
  description: string | null;
  effort_minutes: number;
  resource_link: string | null;
  ai_generated: boolean;
  sequence_number: number;
}

export interface SparkCompletion {
  id: string;
  user_id: string;
  spark_id: string;
  goal_id: string;
  completed_at: string;
  session_id: string | null;
  notes: string | null;
}

export interface Session {
  id: string;
  user_id: string;
  goal_id: string;
  started_at: string;
  ended_at: string | null;
  sparks_count: number;
  chain_length: number;
}

// API types
export interface GenerateSparkRequest {
  goalId: string;
  goalTitle: string;
  previousSparks?: Spark[];
}

export interface GenerateSparkResponse {
  spark: Spark;
  error?: string;
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
}

export interface CompleteSparkRequest {
  sparkId: string;
  goalId: string;
  sessionId: string;
  notes?: string;
}

// UI State types
export interface SparkCardData {
  title: string;
  description: string;
  effort: string;
  resourceLink: string | null;
}

export interface SessionState {
  sessionId: string | null;
  goalId: string | null;
  currentSpark: Spark | null;
  completedSparks: SparkCompletion[];
  chainLength: number;
  isActive: boolean;
}
