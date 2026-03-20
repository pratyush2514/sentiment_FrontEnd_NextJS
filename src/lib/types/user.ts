export interface UserProfile {
  id: string;
  name: string;
  displayName: string;
  avatarUrl: string;
  title?: string;
}

export interface AppSession {
  workspaceId: string;
  workspaceName: string;
  userId: string | null;
  userName: string | null;
  authMode: "mock" | "slack" | "slack_openid";
  issuedAt: number;
  expiresAt: number;
}
