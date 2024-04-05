import {
  currentRoundHasUnsubmittedMatches,
  computePlayerPoints,
  computePlayerHistory,
} from "./tournament/rounds.js";
import { runMatchmaker } from "./tournament/matchmaker.js";
import { TieBreaker, calculateTieBreakScores } from "./tournament/tiebreak.js";
import { isEven, log2 } from "./util/number.js";

export { TieBreaker } from "./tournament/tiebreak.js";

const defaultTieBreakers = [
  TieBreaker.avgWinRate,
  TieBreaker.avgOpponentWinRate,
  TieBreaker.cumulative,
];

/**
 * Creates a new tournament object
 *
 * @param {Array} an array of participants. Each element is something
 * that can help you identify the participant. Could be string, object,
 * or any type.
 * @param {Array<TieBreaker>} an array specifying the tiebreaker methods
 * to use and in what order. by default we use
 * [avgWinRate, avgOpponentWinRate, cumulative]
 *
 * @returns a tournament object with the first round of pairings ready.
 */
export const createTournament = (
  participants,
  tieBreakers = defaultTieBreakers,
) => {
  const hasByeParticipant = !isEven(participants.length);
  const players = participants.map((data, id) => ({
    data,
    id,
  }));
  const drops = [[]];
  if (hasByeParticipant) {
    const byeId = players.length;
    players.push({
      data: null,
      id: byeId,
    });
    drops[0].push(byeId);
  }

  const matchmakerInput = players.map((player) => ({
    ...player,
    points: 0,
    history: [],
    dropped: player.data === null,
  }));
  const rounds = [runMatchmaker(matchmakerInput)];

  return { players, rounds, drops, tieBreakers };
};

/**
 * Submits scores for a match
 * @param {object} the tournament object
 * @param {number} the index of the match in the `tournament.rounds[]` array.
 * @param {number} the score for player 1
 * @param {number} the score for player 2
 * @param {boolean} true if the match was not played and the result was
 * set immediately because of a bye player or a dropped player. By default
 * this is false.
 *
 * @returns A new tournament object with the new submitted score.
 */
export const submitScores = (
  tournament,
  matchIndex,
  scoreP1,
  scoreP2,
  autoWin = false,
) => {
  const currentRoundIndex = tournament.rounds.length - 1;
  const currentRound = tournament.rounds[currentRoundIndex];
  const currentMatch = currentRound[matchIndex];
  const scoresAlreadySubmitted = currentMatch.score.length === 2;
  if (scoresAlreadySubmitted) {
    throw new Error(`Scores for match #${matchIndex} already submitted`);
  }

  const newMatch = { ...currentMatch, score: [scoreP1, scoreP2], autoWin };
  const newRound = [
    ...currentRound.slice(0, matchIndex),
    newMatch,
    ...currentRound.slice(matchIndex + 1),
  ];
  const newRounds = [
    ...tournament.rounds.slice(0, currentRoundIndex),
    newRound,
  ];
  return { ...tournament, rounds: newRounds };
};

export const submitScoresArray = (tournament, array) =>
  array.reduce(
    (res, [matchIndex, scoreP1, scoreP2]) =>
      submitScores(res, matchIndex, scoreP1, scoreP2),
    tournament,
  );

/**
 * Generates pairings for the next round. You can only call this
 * after submitting scores for all matches in the current round.
 * You should also make sure tournament has not ended yet before
 * calling this see [isTournamentComplete].
 *
 * @param {object} the tournament object
 * @returns A new tournament object with new pairings for the next round.
 */
export const computeNextRound = (tournament) => {
  const { players, rounds, drops } = tournament;
  if (currentRoundHasUnsubmittedMatches(rounds)) {
    return new Error("current round still has unsubmitted matches");
  }

  const matchmakerInput = players.map((player) => ({
    ...player,
    points: computePlayerPoints(rounds, player.id),
    history: computePlayerHistory(rounds, player.id),
    dropped: hasPlayerDropped(drops, player.id),
  }));

  const matches = runMatchmaker(matchmakerInput);
  return { ...tournament, rounds: [...rounds, matches], drops: [...drops, []] };
};

const hasPlayerDropped = (drops, playerId) =>
  drops.find((it) => it.includes(playerId));

/**
 * Drops a player from the tournament. if the player is involved
 * in a match in progress, that match will have its score submitted
 * giving an auto win to the other player. Subsequent rounds will
 * try to not pair this player with other active players.
 *
 * @param {object} the tournament object
 * @returns An updated tournament object.
 */
export const dropPlayer = (tournament, playerId) => {
  if (hasPlayerDropped(playerId)) {
    return new Error("Player already dropped");
  }

  const { drops, rounds } = tournament;
  const currentRoundIndex = drops.length - 1;
  const currentRoundDrops = drops[currentRoundIndex];
  const newRoundDrops = [...currentRoundDrops, playerId];
  const newDrops = [...drops.slice(0, currentRoundIndex), newRoundDrops];
  const newTournament = { ...tournament, drops: newDrops };

  // after dropping the player, if they have an unsubmitted match
  // we should give them a loss immediately.
  const currentRoundMatches = rounds[currentRoundIndex];
  const playerMatchIndex = currentRoundMatches.indexOf(
    (it) => it.p1 === playerId || it.p2 === playerId,
  );
  const playerMatch = currentRoundMatches[playerMatchIndex];
  if (playerMatch.score === []) {
    const { p1, p2 } = playerMatch;
    if (playerMatch.p1 === playerId) {
      return submitScores(newTournament, p1, p2, [0, 3], true);
    } else {
      return submitScores(newTournament, p1, p2, [3, 0], true);
    }
  }

  return newTournament;
};

/**
 * Checks if the tournament has reached the maximum amount of rounds
 * and all match results have been submitted.
 *
 * @param {object} the tournament object
 * @returns true if the tournament is complete and we should not
 * play more rounds.
 */
export const isTournamentComplete = (tournament) => {
  const { players, rounds } = tournament;
  const maxRounds = Math.ceil(log2(players.length));
  if (rounds.length < maxRounds) {
    return false;
  }

  return !currentRoundHasUnsubmittedMatches(rounds);
};

/**
 * Generates an array of placings for the tournament. You should
 * call this after the tournament has completed. See [isTournamentComplete]
 *
 * @param {object} the tournament object
 * @returns An array of objects with the following keys:
 * - id {number} The player id
 * - data {Any} The player data
 * - points {number} The total points earned by the player during the tournament
 * - tieBreakScores {Array<Number>} The tiebreak scores (in order) used to
 *   determine placing among tied players.
 */
export const computePlacings = (tournament) => {
  const { players, rounds, tieBreakers } = tournament;
  const placings = players.map((player) => ({
    ...player,
    points: computePlayerPoints(rounds, player.id),
    tieBreakScores: calculateTieBreakScores(tournament, player.id),
  }));
  const comparisons = tieBreakers.length;
  placings.sort((a, b) => {
    let i = 0;
    while (i < comparisons) {
      const diff = b.tieBreakScores[i] - a.tieBreakScores[i];
      if (diff !== 0) {
        return diff;
      }
      i++;
    }
    return 0;
  });
  return placings;
};
