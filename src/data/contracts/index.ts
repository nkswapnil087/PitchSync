import type { DataState } from "@/types/data-state";

export type PersonRecord = {
  personId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  presentAddress?: string;
  permanentAddress?: string;
  phones: readonly string[];
};

export type TeamSummary = {
  teamId: string;
  teamName: string;
  category: string;
  franchiseOwner?: string;
};

export type PlayerSummary = {
  personId: string;
  fullName: string;
  playerRole: string;
  gender: "MALE" | "FEMALE";
};

export type PlayerListItem = PlayerSummary & {
  phone?: string;
  teamAssociationCount: number;
};

export type SelectOption = {
  value: string;
  label: string;
};

export type PaginationMetadata = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type BattingSummary = {
  summaryId: string;
  format: string;
  totalRuns: number;
  battingAverage: number;
  strikeRate: number;
  highestScore: number;
};

export type BowlingSummary = {
  summaryId: string;
  format: string;
  totalWickets: number;
  bowlingAverage: number;
  bestBowlingFigures: string;
};

export type FieldingSummary = {
  summaryId: string;
  format: string;
  totalCatches: number;
  totalStumpings: number;
  totalRunouts: number;
  mostDismissalsInMatch: string;
};

export type CareerRecord = {
  recordId: string;
  tierLevel: string;
  locationType: string;
  matchesPlayed: number;
  startDate: string;
  endDate?: string;
  batting: readonly BattingSummary[];
  bowling: readonly BowlingSummary[];
  fielding: readonly FieldingSummary[];
};

export type TeamAssociation = {
  team: TeamSummary;
};

export type PlayerRecord = PlayerSummary & {
  person: PersonRecord;
  education?: string;
  familyBackground?: string;
  achievements: readonly string[];
  teams: readonly TeamAssociation[];
  careerRecords: readonly CareerRecord[];
};

export type MatchSummary = {
  matchId: string;
  tournamentId: string;
  tournamentName: string;
  matchDate: string;
  venue: string;
  teams: readonly TeamSummary[];
  format?: string;
  status?: string;
  result?: string;
  winnerTeamId?: string;
};

export type TeamRecord = TeamSummary & {
  franchiseOwner?: string;
  roster: readonly PlayerSummary[];
  matches: readonly MatchSummary[];
};

export type TeamListItem = TeamSummary & {
  rosterCount: number;
  matchCount: number;
};

export type TournamentRecord = {
  tournamentId: string;
  tournamentName: string;
  tierLevel: string;
  seasonYear?: number;
  sponsors: readonly string[];
  teams: readonly TeamSummary[];
  matches: readonly MatchSummary[];
};

export type TournamentListItem = {
  tournamentId: string;
  tournamentName: string;
  tierLevel: string;
  seasonYear?: number;
  sponsorCount: number;
  teamCount: number;
  matchCount: number;
};

export type PlayerPerformanceListItem = PlayerSummary & {
  careerRecordCount: number;
  matchesPlayed: number;
  battingSummaryCount: number;
  bowlingSummaryCount: number;
  fieldingSummaryCount: number;
};

export type PlayerBattingMatchPerformance = Omit<BattingPerformance, "player"> & {
  matchId: string;
  matchDate: string;
  venue: string;
};

export type PlayerBowlingMatchPerformance = Omit<BowlingPerformance, "player"> & {
  matchId: string;
  matchDate: string;
  venue: string;
};

export type PlayerFieldingMatchPerformance = Omit<FieldingPerformance, "player"> & {
  matchId: string;
  matchDate: string;
  venue: string;
};

export type PlayerPerformanceRecord = PlayerRecord & {
  battingPerformances: readonly PlayerBattingMatchPerformance[];
  bowlingPerformances: readonly PlayerBowlingMatchPerformance[];
  fieldingPerformances: readonly PlayerFieldingMatchPerformance[];
};

export type BattingPerformance = {
  performanceId: string;
  player: PlayerSummary;
  runsScored: number;
  ballsFaced: number;
  strikeRate: number;
  dismissalType?: string;
};

export type BowlingPerformance = {
  performanceId: string;
  player: PlayerSummary;
  wicketsTaken: number;
  oversBowled: number;
  runsConceded: number;
  economyRate: number;
};

export type FieldingPerformance = {
  performanceId: string;
  player: PlayerSummary;
  catches: number;
  stumpings: number;
  directRunouts: number;
  byesConceded: number;
};

export type MatchObservation = {
  administratorId: string;
  administratorName?: string;
  playerId: string;
  playerName?: string;
  observationDate: string;
  remarks?: string;
};

export type MatchRecord = MatchSummary & {
  batting: readonly BattingPerformance[];
  bowling: readonly BowlingPerformance[];
  fielding: readonly FieldingPerformance[];
  observations: readonly MatchObservation[];
};

export type MatchListItem = {
  matchId: string;
  tournamentId: string;
  tournamentName: string;
  participatingTeams: string;
  matchDate: string;
  venue: string;
  format: string;
  status: string;
};

export type ComplaintRecord = {
  complaintId: string;
  sourceType: string;
  dateReceived: string;
  description: string;
  misconductType?: string;
  caseIds: readonly string[];
  linkedCases?: readonly ComplaintCaseSummary[];
};

export type ComplaintCaseSummary = {
  caseId: string;
  status: string;
  dateOpened: string;
  referralStatus?: string;
};

export type ComplaintListItem = Omit<ComplaintRecord, "caseIds" | "linkedCases"> & {
  linkedCaseCount: number;
};

export type RulebookRecord = {
  ruleId: string;
  clauseNumber: string;
  category: string;
  caseIds: readonly string[];
};

export type EvidenceRecord = {
  evidenceNumber: string;
  description: string;
  collectedDate: string;
};

export type InvestigationAssignment = {
  player: PlayerSummary;
  involvementType: string;
  investigatorIds: readonly string[];
};

export type IntegrityCaseRecord = {
  caseId: string;
  status: string;
  dateOpened: string;
  complaints: readonly ComplaintRecord[];
  involvedPlayers: readonly InvestigationAssignment[];
  rules: readonly RulebookRecord[];
  evidence: readonly EvidenceRecord[];
};

export interface ReadRepository<T> {
  list(): Promise<DataState<readonly T[]>>;
  findById(id: string): Promise<DataState<T | null>>;
}

export type PlayerRepository = ReadRepository<PlayerRecord>;
export type TeamRepository = ReadRepository<TeamRecord>;
export type TournamentRepository = ReadRepository<TournamentRecord>;
export type MatchRepository = ReadRepository<MatchRecord>;
export type ComplaintRepository = ReadRepository<ComplaintRecord>;
export type IntegrityCaseRepository = ReadRepository<IntegrityCaseRecord>;
export type RulebookRepository = ReadRepository<RulebookRecord>;
