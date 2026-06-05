// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DocuMind AI — Mock Data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { User, Document, ChatSession, Message, Citation, Analytics, RevenueData, UserActivity, SystemHealthLog, Notification, ApiKey, PricingPlan } from '@/types';

export const mockUser: User = {
  id: 'usr_001',
  email: 'alex@techcorp.com',
  firstName: 'Alex',
  lastName: 'Rivera',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHdVhBsZPfpvN9xcNy9Azk795fjwb1nmgH8PnW9QMQmPwJHFlqTWPNTqK92jtmTF-eq7ynhpqbNzgWYPJrL1dKAMc1P5_Uv31f5VqrL0-MqtZSjOW61426-O3_MEqeH1VlpG03DnvowezvsaJnz0yDDofRZeDhrCfHwW_0yVQzzUN15KtPUQtLNzuXiYJaMaAlD8LKK3ple8dgcOW8GZHdzFZGgQDg3vGCxQJPWjReXNzUe0M0jHgY6tf48-_u3FXF5_vYCW_4wg4J',
  role: 'admin',
  company: 'TechCorp',
  companySize: '51-250',
  subscriptionTier: 'precision',
  isActive: true,
  isVerified: true,
  twoFactorEnabled: true,
  lastLoginAt: new Date().toISOString(),
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: new Date().toISOString(),
};

export const mockDocuments: Document[] = [
  {
    id: 'doc_001', userId: 'usr_001', title: 'Q3 Annual Report 2024', fileName: 'Q3_Report.pdf',
    fileType: 'pdf', fileSizeBytes: 4_500_000, status: 'ready', pageCount: 48, chunkCount: 156,
    tags: ['finance', 'quarterly', 'report'], metadata: {}, createdAt: '2024-10-01T09:00:00Z', updatedAt: '2024-10-01T09:05:00Z',
  },
  {
    id: 'doc_002', userId: 'usr_001', title: 'Employee Handbook v3.1', fileName: 'Handbook_v3.1.pdf',
    fileType: 'pdf', fileSizeBytes: 2_100_000, status: 'ready', pageCount: 82, chunkCount: 245,
    tags: ['hr', 'policy', 'handbook'], metadata: {}, createdAt: '2024-09-15T14:30:00Z', updatedAt: '2024-09-15T14:35:00Z',
  },
  {
    id: 'doc_003', userId: 'usr_001', title: 'Legal Compliance Audit 2024', fileName: 'Legal_Audit_2024.pdf',
    fileType: 'pdf', fileSizeBytes: 8_700_000, status: 'ready', pageCount: 124, chunkCount: 389,
    tags: ['legal', 'audit', 'compliance'], metadata: {}, createdAt: '2024-08-22T11:00:00Z', updatedAt: '2024-08-22T11:10:00Z',
  },
  {
    id: 'doc_004', userId: 'usr_001', title: 'Product Roadmap 2025', fileName: 'Roadmap_2025.docx',
    fileType: 'docx', fileSizeBytes: 1_200_000, status: 'ready', pageCount: 15, chunkCount: 42,
    tags: ['product', 'roadmap', 'strategy'], metadata: {}, createdAt: '2024-10-10T16:00:00Z', updatedAt: '2024-10-10T16:02:00Z',
  },
  {
    id: 'doc_005', userId: 'usr_001', title: 'Technical Architecture Guide', fileName: 'Architecture.md',
    fileType: 'md', fileSizeBytes: 350_000, status: 'ready', pageCount: 1, chunkCount: 28,
    tags: ['engineering', 'architecture'], metadata: {}, createdAt: '2024-10-12T08:00:00Z', updatedAt: '2024-10-12T08:01:00Z',
  },
  {
    id: 'doc_006', userId: 'usr_001', title: 'Market Analysis Report', fileName: 'Market_Analysis.pdf',
    fileType: 'pdf', fileSizeBytes: 5_600_000, status: 'processing', pageCount: 67, chunkCount: 0,
    tags: ['market', 'analysis'], metadata: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

export const mockChatSessions: ChatSession[] = [
  {
    id: 'chat_001', userId: 'usr_001', title: 'Q1 Research Deep-Dive', documentId: 'doc_001',
    model: 'gpt-4o', isPinned: true, messageCount: 12, lastMessageAt: new Date().toISOString(),
    createdAt: '2024-10-14T10:00:00Z', updatedAt: new Date().toISOString(),
  },
  {
    id: 'chat_002', userId: 'usr_001', title: 'Legal Audit 2024', documentId: 'doc_003',
    model: 'gpt-4o', isPinned: false, messageCount: 8, lastMessageAt: '2024-10-13T15:30:00Z',
    createdAt: '2024-10-12T09:00:00Z', updatedAt: '2024-10-13T15:30:00Z',
  },
  {
    id: 'chat_003', userId: 'usr_001', title: 'Product Strategy Discussion', documentId: 'doc_004',
    model: 'gpt-4o', isPinned: false, messageCount: 5, lastMessageAt: '2024-10-11T14:00:00Z',
    createdAt: '2024-10-11T13:00:00Z', updatedAt: '2024-10-11T14:00:00Z',
  },
  {
    id: 'chat_004', userId: 'usr_001', title: 'Architecture Review', documentId: 'doc_005',
    model: 'gpt-4o', isPinned: false, messageCount: 3, lastMessageAt: '2024-10-10T11:00:00Z',
    createdAt: '2024-10-10T10:00:00Z', updatedAt: '2024-10-10T11:00:00Z',
  },
];

export const mockMessages: Record<string, Message[]> = {
  chat_001: [
    {
      id: 'msg_001', sessionId: 'chat_001', role: 'user',
      content: 'Analyze the fiscal impact mentioned on page 14 of the Q3 Annual Report.',
      createdAt: '2024-10-14T10:24:00Z',
    },
    {
      id: 'msg_002', sessionId: 'chat_001', role: 'assistant',
      content: 'Based on the Q3 report (p.14), the fiscal impact is estimated at $4.2M due to operational shifts. This aligns with the "Efficiency Goal" stated in your internal handbook.\n\nKey findings:\n\n1. **Revenue Impact**: $4.2M increase from Q2, primarily driven by the new enterprise licensing model\n2. **Operational Costs**: Reduced by 18% through automation initiatives\n3. **Net Position**: Positive trajectory with projected 22.1% growth by Q4\n\nThe report specifically cites three catalysts for this improvement on pages 14-16.',
      citations: [
        { id: 'cit_001', messageId: 'msg_002', documentId: 'doc_001', documentTitle: 'Q3_Report.pdf', pageNumber: 14, excerpt: 'Fiscal impact estimated at $4.2M...', relevanceScore: 0.95, fileType: 'pdf' },
        { id: 'cit_002', messageId: 'msg_002', documentId: 'doc_002', documentTitle: 'Handbook_v3.1.pdf', pageNumber: 8, excerpt: 'Efficiency Goal alignment...', relevanceScore: 0.82, fileType: 'pdf' },
      ],
      createdAt: '2024-10-14T10:24:05Z',
    },
    {
      id: 'msg_003', sessionId: 'chat_001', role: 'user',
      content: 'What are the risk factors mentioned in the compliance section?',
      createdAt: '2024-10-14T10:26:00Z',
    },
    {
      id: 'msg_004', sessionId: 'chat_001', role: 'assistant',
      content: 'The compliance section (pp. 32-35) identifies four primary risk factors:\n\n1. **Regulatory Changes**: New data privacy regulations in EU markets may require infrastructure updates (est. $800K)\n2. **Supply Chain Dependencies**: Single-source vendor risk for 3 critical components\n3. **Cybersecurity Exposure**: Two medium-severity vulnerabilities flagged in the Q2 audit remain open\n4. **Talent Retention**: 15% attrition rate in engineering exceeds industry benchmark of 11%\n\nEach risk is mapped to a mitigation strategy in Appendix C.',
      citations: [
        { id: 'cit_003', messageId: 'msg_004', documentId: 'doc_001', documentTitle: 'Q3_Report.pdf', pageNumber: 32, excerpt: 'Risk factors analysis...', relevanceScore: 0.97, fileType: 'pdf' },
      ],
      createdAt: '2024-10-14T10:26:10Z',
    },
  ],
};

export const mockAnalytics: Analytics = {
  totalUsers: 24592,
  totalDocuments: 1_200_000,
  totalQueries: 850_000,
  storageUsedGB: 450,
  storageLimitGB: 1000,
  currentMRR: 182400,
  systemHealth: 99.98,
  activeUsers: 18200,
  mrrChange: 4.2,
  userChange: 12.5,
  documentChange: 22.1,
};

export const mockRevenueData: RevenueData[] = [
  { month: 'May', revenue: 142000 },
  { month: 'Jun', revenue: 148000 },
  { month: 'Jul', revenue: 151000 },
  { month: 'Aug', revenue: 155000 },
  { month: 'Sep', revenue: 163000 },
  { month: 'Oct', revenue: 172000 },
  { month: 'Nov', revenue: 182000 },
];

export const mockUserActivity: UserActivity[] = [
  { id: 'ua_001', user: { id: 'usr_001', firstName: 'Alex', lastName: 'Sterling', email: 'alex@techcorp.com', avatarUrl: undefined, role: 'admin' }, status: 'active', lastActivity: '2 mins ago' },
  { id: 'ua_002', user: { id: 'usr_002', firstName: 'Sarah', lastName: 'Chen', email: 's.chen@quantum.io', avatarUrl: undefined, role: 'viewer' }, status: 'active', lastActivity: '15 mins ago' },
  { id: 'ua_003', user: { id: 'usr_003', firstName: 'Marcus', lastName: 'Thorne', email: 'm.thorne@glacier.ai', avatarUrl: undefined, role: 'editor' }, status: 'offline', lastActivity: '4 hours ago' },
];

export const mockSystemHealth: SystemHealthLog[] = [
  { id: 'sh_001', title: 'API Gateway Stable', description: 'All requests processed < 50ms', status: 'healthy', timestamp: new Date().toISOString() },
  { id: 'sh_002', title: 'Neural Engine Warm', description: 'Inference throughput: 1.2k req/s', status: 'healthy', timestamp: new Date().toISOString() },
  { id: 'sh_003', title: 'Sync Completed', description: 'Backup successful to EU-Central-1', status: 'info', timestamp: new Date().toISOString() },
  { id: 'sh_004', title: 'Latency Spike', description: 'Redis cluster rerouted.', status: 'error', timestamp: new Date().toISOString() },
];

export const mockNotifications: Notification[] = [
  { id: 'notif_001', userId: 'usr_001', type: 'success', title: 'Document Processed', message: 'Q3 Annual Report is ready for chat.', isRead: false, createdAt: new Date().toISOString() },
  { id: 'notif_002', userId: 'usr_001', type: 'info', title: 'New Team Member', message: 'Sarah Chen joined your workspace.', isRead: true, createdAt: '2024-10-13T10:00:00Z' },
  { id: 'notif_003', userId: 'usr_001', type: 'warning', title: 'Storage Warning', message: 'You have used 65% of your storage quota.', isRead: false, createdAt: '2024-10-12T08:00:00Z' },
];

export const mockApiKeys: ApiKey[] = [
  { id: 'key_001', name: 'Production Primary', keyPreview: 'dm_live_••••••••3k92', lastUsed: '2 mins ago', createdAt: 'Oct 12, 2024' },
  { id: 'key_002', name: 'Staging Environment', keyPreview: 'dm_test_••••••••p10w', lastUsed: 'Yesterday', createdAt: 'Sep 30, 2024' },
];

export const mockPricingPlans: PricingPlan[] = [
  {
    id: 'plan_starter', name: 'Starter', description: 'For individual precision.',
    price: 0, period: 'month',
    features: ['5 PDF uploads / month', 'Basic AI Chat', 'Single workspace'],
    disabledFeatures: ['Batch processing'],
    ctaText: 'Start Free',
  },
  {
    id: 'plan_precision', name: 'Precision', description: 'Unleash full AI potential.',
    price: 29, period: 'month', isPopular: true,
    features: ['Unlimited uploads', 'Advanced LLM models', 'Collaborative Folders', 'Source Citations API'],
    ctaText: 'Upgrade to Pro',
  },
  {
    id: 'plan_enterprise', name: 'Enterprise', description: 'Global scale security.',
    price: 'custom', period: 'month',
    features: ['Self-hosted option', 'SSO & SAML Login', 'Dedicated account lead', 'SLA Guarantees'],
    ctaText: 'Contact Sales',
  },
];

export const suggestedQuestions = [
  'Summarize the key findings from Q3',
  'What are the main risk factors?',
  'Compare revenue trends across quarters',
  'Extract all action items from the report',
];

export const mockAIResponses = [
  'Based on my analysis of the uploaded documents, I can provide the following insights:\n\nThe data shows a clear upward trend in the metrics you\'re asking about. Specifically, the key indicators point to a 22% improvement over the previous quarter.\n\nI found 3 relevant sections across your documents that support this conclusion.',
  'After reviewing the relevant sections of your knowledge base, here\'s what I found:\n\nThe document explicitly addresses your question on pages 14-18. The primary conclusion is that the strategic initiatives outlined in Q2 have begun yielding measurable results.\n\nKey data points:\n- Revenue growth: 18.3%\n- Cost reduction: 12.1%\n- Customer satisfaction: Up 7 points',
  'I\'ve cross-referenced multiple documents in your knowledge base to answer this question comprehensively.\n\nThe analysis reveals three interconnected themes:\n1. **Operational Efficiency** — streamlined processes have reduced overhead by 15%\n2. **Market Expansion** — two new regions contributed $2.1M in new revenue\n3. **Product Innovation** — the new AI features drove a 34% increase in user engagement',
];
