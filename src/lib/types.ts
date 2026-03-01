// Core type definitions for Scorr Studio v2

// ==========================================
// MATCH TYPES
// ==========================================

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'cancelled';

export interface BaseMatchState {
  status: MatchStatus;
  team1Score: number;
  team2Score: number;
  clock: {
    seconds: number;
    isRunning: boolean;
    direction: 'up' | 'down';
  };
  period: number;
  isMatchStarted: boolean;
  // Team Info
  teamName1: string;
  teamName2: string;
  teamAbbrev1: string;
  teamAbbrev2: string;
  teamLogo1: string;
  teamLogo2: string;
  teamColor1: string;
  teamColor2: string;
  // Match Info
  matchRound: string;
  eventName: string;
}

export interface SportAction {
  type: string;
  payload?: unknown;
}

export interface InitialStateData {
  team1?: { name: string; logoUrl?: string; color?: string };
  team2?: { name: string; logoUrl?: string; color?: string };
  eventName?: string;
  matchRound?: string;
}

export interface Match<TState = unknown> {
  id: string;
  sportId: string;
  tenantId: string;
  status: MatchStatus;
  team1Id: string | null;
  team2Id: string | null;
  team1: {
    id: string | null;
    name: string;
    logoUrl?: string;
    score: number;
  };
  team2: {
    id: string | null;
    name: string;
    logoUrl?: string;
    score: number;
  };
  state: TState;
  createdAt: string;
  scheduledAt?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  competitionId?: string;
  eventId?: string;
  eventName?: string;
  round?: string;
  isPlayoff?: boolean;
  roundIndex?: number;
  matchIndex?: number;
  nextMatchId?: string;
  nextMatchSlot?: 'team1Id' | 'team2Id';
  note?: string;
}

export interface CreateMatchParams {
  id: string;
  tenantId: string;
  team1Id?: string | null;
  team2Id?: string | null;
  team1?: { name: string; logoUrl?: string; color?: string };
  team2?: { name: string; logoUrl?: string; color?: string };
  eventName?: string;
  matchRound?: string;
  competitionId?: string;
  eventId?: string;
  options?: Record<string, unknown>;
  [key: string]: unknown;
}

// ==========================================
// SPORT CONFIG
// ==========================================

export interface SportConfig<TState = unknown> {
  id: string;
  name: string;
  description: string;
  initialState: TState & BaseMatchState;
  getInitialState: (data?: InitialStateData) => TState & BaseMatchState;
  createMatch: (params: CreateMatchParams) => Match<TState & BaseMatchState>;
  getMatchSummary: (state: TState & BaseMatchState) => {
    status: MatchStatus;
    team1Score: number;
    team2Score: number;
    team1: { name: string; score: number; image?: string | null };
    team2: { name: string; score: number; image?: string | null };
  };
  konvaConfig?: KonvaConfig;
  handleAction: (state: TState & BaseMatchState, action: SportAction) => TState & BaseMatchState;
}

// ==========================================
// KONVA CONFIG
// ==========================================

export type KonvaNodeType = 'text' | 'score' | 'image' | 'timer' | 'container' | 'rect' | 'visibility' | 'flex' | 'separator';

export type KonvaBehaviorType =
  | 'text'
  | 'visibility'
  | 'inverse-visibility'
  | 'image'
  | 'progress'
  | 'countdown'
  | 'countup'
  | 'class-toggle'
  | 'style';

export type KonvaAnimationType =
  | 'none'
  | 'pulse'
  | 'flash'
  | 'bounce'
  | 'slide-up'
  | 'slide-down'
  | 'glow'
  | 'scale-up';

export interface KonvaBlockDefinition {
  id: string;
  type: KonvaNodeType;
  label: string;
  category: string;
  icon?: string;
  defaultProps: Record<string, unknown>;
  dataBinding?: {
    field: string;
    behaviorType: KonvaBehaviorType;
    formatter?: string;
    animation?: KonvaAnimationType;
  };
  sample?: string | number | boolean;
}

export interface KonvaConfig {
  blocks: KonvaBlockDefinition[];
  defaultCanvasSize?: { width: number; height: number };
}

// ==========================================
// TENANT & RBAC
// ==========================================

export type TenantRole = 'owner' | 'admin' | 'designer' | 'scorer' | 'viewer';

export interface Tenant {
  tenantId: string;
  name: string;
  slug?: string;
  createdAt: string;
  subscription?: {
    tier: 'free' | 'pro' | 'enterprise';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    status?: string;
    currentPeriodEnd?: string;
  };
  usage?: {
    matches?: number;
    competitions?: number;
    leagues?: number;
    displays?: number;
  };
  settings?: {
    enabledSports?: Record<string, boolean>;
    socialAutomation?: {
      autoPostOnFinish?: boolean;
      platforms?: string[];
      customHashtags?: string;
    };
    customFields?: CustomFieldDefinition[];
  };
}

export interface Member {
  tenantId: string;
  userId: string;
  email: string;
  name?: string;
  role: TenantRole;
  joinedAt: string;
}

export interface Invitation {
  tenantId: string;
  token: string;
  email: string;
  role: TenantRole;
  invitedBy: string;
  createdAt: string;
  expiresAt?: string;
}

export const PERMISSIONS = {
  // Tenant
  'tenant:manage': ['owner', 'admin'],
  'tenant:invite': ['owner', 'admin'],
  'tenant:remove_member': ['owner', 'admin'],
  // Matches
  'match:create': ['owner', 'admin'],
  'match:update': ['owner', 'admin'],
  'match:delete': ['owner', 'admin'],
  'match:score': ['owner', 'admin', 'scorer'],
  'match:view': ['owner', 'admin', 'designer', 'scorer', 'viewer'],
  // Competitions
  'competition:create': ['owner', 'admin'],
  'competition:update': ['owner', 'admin'],
  'competition:delete': ['owner', 'admin'],
  'competition:view': ['owner', 'admin', 'designer', 'scorer', 'viewer'],
  // Displays & Stages
  'display:create': ['owner', 'admin', 'designer'],
  'display:update': ['owner', 'admin', 'designer'],
  'display:delete': ['owner', 'admin', 'designer'],
  'display:view': ['owner', 'admin', 'designer', 'scorer', 'viewer'],
  'stage:create': ['owner', 'admin'],
  'stage:update': ['owner', 'admin'],
  'stage:delete': ['owner', 'admin'],
  'stage:view': ['owner', 'admin', 'designer', 'scorer', 'viewer'],
  // Social
  'social:manage': ['owner', 'admin'],
  'social:post': ['owner', 'admin'],
  // Settings
  'settings:view': ['owner', 'admin', 'designer', 'scorer'],
  'settings:update': ['owner', 'admin'],
  // Billing
  'billing:view': ['owner'],
  'billing:manage': ['owner'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

// ==========================================
// COMPETITION TYPES
// ==========================================

export type CompetitionFormat =
  | 'single_match'
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'round_robin_to_single'
  | 'swiss';

export type CompetitionType = 'team' | 'individual';

export interface CompetitionEvent {
  id: string;
  name: string;
  format: CompetitionFormat;
  type: CompetitionType;
  status: 'draft' | 'active' | 'completed';
  teams?: Record<string, Participant>;
  seeding?: string[];
  matches?: Record<string, Match>;
  matchesGenerated?: boolean;
  matchesGeneratedAt?: string;
  // Round Robin
  groupSize?: number;
  groupFormat?: 'linear' | 'snake';
  advancingPerGroup?: number;
  playoffsGenerated?: boolean;
  // Swiss
  swissRounds?: SwissRound[];
  totalSwissRounds?: number;
  currentSwissRound?: number;
  // General
  allowByes?: boolean;
  byeSeeding?: string;
  description?: string;
  matchSettings?: Record<string, unknown>;
  poolStandings?: Record<string, PoolStanding[]>;
}

export interface Participant {
  id: string;
  name: string;
  logoUrl?: string;
  city?: string;
  imageUrl?: string;
  joinedAt?: string;
}

export interface SwissRound {
  roundNumber: number;
  matches: string[]; // match IDs
  completed: boolean;
}

export interface PoolStanding {
  participantId: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gameDifference: number;
  points: number;
}

// ==========================================
// LEAGUE TYPES
// ==========================================

export type LeagueType = 'individual' | 'team_simple' | 'team_multi_match';

export type SeasonStatus = 'upcoming' | 'registration' | 'active' | 'completed' | 'cancelled';

export interface Season {
  id: string;
  leagueId: string;
  name: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  startDate: string;
  endDate: string;
  status: SeasonStatus;
  divisions: Division[];
  playoffsEnabled?: boolean;
  playoffsBracket?: unknown;
  playoffsStartDate?: string;
  createdAt: string;
}

export interface Division {
  id: string;
  seasonId: string;
  name: string;
  groups: Group[];
  teamMatchFormat?: TeamMatchFormat;
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  tiebreakers: TiebreakerType[];
}

export interface Group {
  id: string;
  divisionId: string;
  name: string;
  participants: DivisionParticipant[];
  fixtures: Fixture[];
  standings: Standing[];
}

export interface DivisionParticipant {
  id: string;
  name: string;
  type: 'team' | 'individual';
}

export interface Fixture {
  id: string;
  groupId: string;
  name: string;
  scheduledDate?: string;
  scheduledTime?: string;
  venue?: string;
  teamMatches: TeamMatch[];
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface TeamMatch {
  id: string;
  fixtureId: string;
  team1Id: string;
  team1Name: string;
  team2Id: string;
  team2Name: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
  matches?: TeamMatchIndividual[];
  team1Wins: number;
  team2Wins: number;
  team1Points: number;
  team2Points: number;
  winner?: 'team1' | 'team2' | 'draw';
}

export interface TeamMatchIndividual {
  id: string;
  matchType: 'singles' | 'doubles' | 'mixed_doubles';
  label: string;
  matchId: string;
}

export interface Standing {
  participantId: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
  points: number;
  form?: string[];
}

export type TiebreakerType =
  | 'goal_difference'
  | 'goals_for'
  | 'head_to_head'
  | 'matches_won'
  | 'games_won'
  | 'points_difference'
  | 'games_difference';

export interface TeamMatchFormat {
  matchCount: number;
  matchTypes: ('singles' | 'doubles' | 'mixed_doubles')[];
  matchLabels?: string[];
  winCondition: 'majority' | 'first_to_x';
  winsRequired?: number;
  allowConcurrentMatches: boolean;
}

// ==========================================
// USER PROFILE TYPES
// ==========================================

export interface UserProfile {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say';
  nationality?: string;
  hometown?: string;
  twitterHandle?: string;
  instagramHandle?: string;
  linkedinHandle?: string;
  taggingEnabled?: boolean;
  athleteAttributes?: AthleteAttributes;
  playerRatings?: PlayerRatings;
  customFieldValues?: Record<string, Record<number, string | number | boolean>>;
  verified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AthleteAttributes {
  [sportId: string]: {
    handedness?: 'right' | 'left' | 'ambidextrous';
    height?: { value: number; unit: 'cm' | 'in' };
    weight?: { value: number; unit: 'kg' | 'lb' };
    reach?: { value: number; unit: 'cm' | 'in' };
    stance?: string;
    grip?: string;
    playStyle?: string;
    preferredPosition?: string;
    yearsPlaying?: number;
    coachName?: string;
    clubName?: string;
  };
}

export interface PlayerRatings {
  [sportId: string]: ExternalRating[];
}

export interface ExternalRating {
  source: string;
  ratingValue: number;
  rankValue?: number;
  memberId?: string;
  lastUpdated: string;
}

export interface CustomFieldDefinition {
  slot: number; // 1-10
  tenantId: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: string[];
  required?: boolean;
  sportId?: string;
}

// ==========================================
// DEFAULT TYPES
// ==========================================

export interface MatchDefault {
  type: 'forfeit' | 'walkover' | 'double_default' | 'retirement';
  defaultedSide: 'team1' | 'team2' | 'both';
  reason?: string;
  recordedBy: string;
  recordedAt: string;
}

// ==========================================
// BROADCAST TYPES
// ==========================================

export type SceneType = 'idle' | 'versus' | 'scoreboard' | 'winner' | 'break';

export interface Stage {
  stageId: string;
  tenantId: string;
  sportId: string;
  name: string;
  currentMatchId?: string;
  queue?: string[];
  activeCompetitionId?: string;
  currentScene?: SceneType;
  displays?: Record<string, { urlId: string; createdAt: string }>;
}

export interface ScoreDisplay {
  displayId: string;
  tenantId: string;
  sportId: string;
  name: string;
  type: 'standard' | 'konva' | 'composite' | 'bracket';
  width: number;
  height: number;
  theme?: Record<string, unknown>;
  overlays?: Record<string, unknown>;
  sceneData?: KonvaSceneData;
  assignedStageId?: string;
}

// ==========================================
// KONVA SCENE TYPES
// ==========================================

export interface KonvaSceneData {
  version: number;
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
    gridSize: number;
    showGrid: boolean;
    snapToGrid: boolean;
  };
  nodes: ScoreboardNodeData[];
}

export type ScoreboardNodeData = BaseNodeData & (
  | TextNodeData
  | ImageNodeData
  | TimerNodeData
  | FlexContainerNodeData
  | ContainerNodeData
  | RectNodeData
  | VisibilityNodeData
  | SeparatorNodeData
);

export interface BaseNodeData {
  id: string;
  type: KonvaNodeType;
  name: string;
  x: number;
  y: number;
  width: number;
  widthUnit: 'px' | '%' | 'auto';
  height: number;
  heightUnit: 'px' | '%' | 'auto';
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  dataBinding?: {
    field: string;
    behaviorType: KonvaBehaviorType;
    formatter?: string;
    animation?: KonvaAnimationType;
  };
  animation?: {
    entrance: 'none' | 'scale-up' | 'slide-up' | 'slide-down';
    dataChange: 'none' | 'pulse' | 'flash';
    duration: number;
    delay: number;
  };
}

export interface TextNodeData extends BaseNodeData {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontStyle: 'normal' | 'bold' | 'italic';
  fill: string;
  align: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  textDecoration: 'none' | 'underline' | 'line-through';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  stroke?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export interface ImageNodeData extends BaseNodeData {
  type: 'image';
  src: string;
  cornerRadius: number;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
}

export interface TimerNodeData extends BaseNodeData {
  type: 'timer';
  format: 'MM:SS' | 'HH:MM:SS' | 'SS' | 'M:SS';
  direction: 'up' | 'down';
  fontSize: number;
  fontFamily: string;
  fill: string;
  align: 'left' | 'center' | 'right';
}

export interface FlexContainerNodeData extends BaseNodeData {
  type: 'flex';
  direction: 'row' | 'column';
  justify: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  align: 'start' | 'center' | 'end' | 'stretch';
  gap: number;
  padding: number;
  fill?: string | GradientConfig;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  children: ScoreboardNodeData[];
}

export interface ContainerNodeData extends BaseNodeData {
  type: 'container';
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  children?: ScoreboardNodeData[];
}

export interface RectNodeData extends BaseNodeData {
  type: 'rect';
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
}

export interface VisibilityNodeData extends BaseNodeData {
  type: 'visibility';
  children: ScoreboardNodeData[];
}

export interface SeparatorNodeData extends BaseNodeData {
  type: 'separator';
  orientation: 'horizontal' | 'vertical';
  length: number;
  strokeWidth: number;
  stroke: string;
}

export interface GradientConfig {
  type: 'linear';
  angle: number;
  startColor: string;
  endColor: string;
}
