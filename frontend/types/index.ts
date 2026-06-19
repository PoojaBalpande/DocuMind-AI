// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DocuMind AI — TypeScript Type Definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: 'user' | 'admin' | 'editor' | 'viewer';
  company?: string;
  companySize?: string;
  subscriptionTier: 'starter' | 'precision' | 'enterprise';
  isActive: boolean;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'md';
  fileSizeBytes: number;
  fileUrl?: string;
  status: 'processing' | 'ready' | 'error' | 'archived';
  pageCount?: number;
  chunkCount: number;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  pageNumber?: number;
  tokenCount?: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  documentId?: string;
  model: string;
  isPinned: boolean;
  messageCount: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  tokenCount?: number;
  model?: string;
  isLoading?: boolean;
  createdAt: string;
}

export interface Citation {
  id: string;
  messageId: string;
  chunkId?: string;           // V8: chunk UUID for traceability
  documentId?: string;
  documentTitle: string;
  pageNumber?: number;
  excerpt?: string;
  relevanceScore?: number;    // V8: now populated from similarity_score
  fileType?: 'pdf' | 'docx' | 'txt' | 'md';
}

export interface Analytics {
  totalUsers: number;
  totalDocuments: number;
  totalQueries: number;
  storageUsedGB: number;
  storageLimitGB: number;
  currentMRR: number;
  systemHealth: number;
  activeUsers: number;
  mrrChange: number;
  userChange: number;
  documentChange: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface UserActivity {
  id: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'avatarUrl' | 'role'>;
  status: 'active' | 'offline' | 'away';
  lastActivity: string;
}

export interface SystemHealthLog {
  id: string;
  title: string;
  description: string;
  status: 'healthy' | 'warning' | 'error' | 'info';
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: 'starter' | 'precision' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  monthlyPrice: number;
}

export interface Settings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  twoFactorEnabled: boolean;
  defaultModel: string;
  autoSave: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberCount: number;
  documentCount: number;
  storageUsedBytes: number;
  plan: 'starter' | 'precision' | 'enterprise';
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  lastUsed?: string;
  createdAt: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number | 'custom';
  period: 'month' | 'year';
  features: string[];
  disabledFeatures?: string[];
  isPopular?: boolean;
  ctaText: string;
}

// V9: User settings — matches backend UserSettingsResponse shape
export interface UserSettings {
  id: string;
  user_id: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  retrieval_top_k: number;
  default_scope: 'workspace' | 'current_document' | 'selected_documents';
  created_at: string;
  updated_at: string;
}

// V9: Settings update request — explicit contract for PATCH /api/settings
export interface SettingsUpdateRequest {
  model_name?: string;
  temperature?: number;
  max_tokens?: number;
  retrieval_top_k?: number;
  default_scope?: 'workspace' | 'current_document' | 'selected_documents';
}

// V9 Phase 3: Workspace overview analytics
export interface WorkspaceOverview {
  total_documents: number;
  total_chats: number;
  total_messages: number;
  storage_used_mb: number;
}

// V9 Phase 4: Usage Insights Types
export interface ActivityItem {
  type: 'document_upload' | 'chat_created' | 'recent_question';
  description: string;
  timestamp: string;
}

export interface UploadTrends {
  today: number;
  week: number;
  month: number;
}

export interface ChatTrends {
  today: number;
  week: number;
  month: number;
}

export interface TopChat {
  session_id: string;
  title: string;
  message_count: number;
}

export interface AnalyticsInsights {
  recent_activity: ActivityItem[];
  upload_trends: UploadTrends;
  chat_trends: ChatTrends;
  top_chats: TopChat[];
}

