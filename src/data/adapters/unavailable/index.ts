import type {
  ComplaintRepository,
  IntegrityCaseRepository,
  MatchRepository,
  PlayerRepository,
  ReadRepository,
  RulebookRepository,
  TeamRepository,
  TournamentRepository,
} from "@/data/contracts";
import { unavailableState } from "@/lib/data-state";

const message = "No information is available for this view.";

function createUnavailableRepository<T>(): ReadRepository<T> {
  return {
    async list() {
      return unavailableState<readonly T[]>([], message);
    },
    async findById() {
      return unavailableState<T | null>(null, message);
    },
  };
}

export const unavailablePlayerRepository: PlayerRepository = createUnavailableRepository();
export const unavailableTeamRepository: TeamRepository = createUnavailableRepository();
export const unavailableTournamentRepository: TournamentRepository = createUnavailableRepository();
export const unavailableMatchRepository: MatchRepository = createUnavailableRepository();
export const unavailableComplaintRepository: ComplaintRepository = createUnavailableRepository();
export const unavailableIntegrityCaseRepository: IntegrityCaseRepository = createUnavailableRepository();
export const unavailableRulebookRepository: RulebookRepository = createUnavailableRepository();
