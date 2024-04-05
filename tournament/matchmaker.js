import { randomInt } from "node:crypto";

class MatchMakerError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

const findMatchingPlayerIndex = (player, otherPlayers) => {
  if (player.dropped) {
    // if player has dropped, because of the way the array
    // is sorted, we can assume that all other players are
    // dropped as well.
    return randomInt(otherPlayers.length);
  }

  let startIndex = 0;
  while (startIndex < otherPlayers.length) {
    // we want to gather all players with same number of points
    // that have not dropped yet to generate a list of
    // possible candidates.
    const points = otherPlayers[startIndex].points;
    let endIndex = otherPlayers.findIndex(
      (item, index) =>
        index > startIndex && (item.points !== points || item.dropped),
    );
    if (endIndex < 0) {
      endIndex = otherPlayers.length;
    }

    // we must filter out candidates that appear on the
    // player's history
    const candidates = otherPlayers
      .slice(startIndex, endIndex)
      .filter((item) => !player.history.includes(item.id));
    if (candidates.length > 0) {
      const partner = candidates[randomInt(candidates.length)];
      return otherPlayers.findIndex((it) => it.id === partner.id);
    }

    // if there are no candidates left after filtering we move
    // on to the next section of the array (candidates with lower points)
    startIndex = endIndex;
  }
  throw new MatchMakerError(
    `Failed to find match for player, ${JSON.stringify(player)}`,
  );
};

const computeInitialScore = (p1, p2) => {
  if (p1.dropped && p2.dropped) {
    return [0, 0];
  }
  if (p1.dropped) {
    return [0, 3];
  }
  if (p2.dropped) {
    return [3, 0];
  }
  return [];
};
/**
 * Creates the matches between players, making sure that players with similar
 * scores face each other and that each match is unique (players can't face the same
 * opponents from previous rounds).
 *
 * @param {Array} An array of tournament player objects. The following keys
 * are expected on each object:
 * - `id` {number} The player's unique id
 * - `history` {Array} An array of the player ids that the current player has
 *   faced on previous rounds
 * - `points` {number} The player's current total points
 * - `data` {Any} Player data. This can be anything you wish. If this is null,
 *   this player is treated as bye (auto-loss).
 * - `dropped` {boolean} true if the player has dropped from the tournament
 *   this player is treated as bye (auto-loss) and we will try to pair with other
 *   dropped players.
 * This array must have an even length. If that's not the case, you must add a
 * bye player with null `data`.
 *
 * @returns {Array} an array of the match objects. Each object has the following keys
 * - `p1` {number} id of player 1
 * - `p2` {number} id of player 2
 *   `score` {Array} A score array. The first element is player 1's score and second
 *   element is player 2's score. By default no score data is available so the array
 *   is empty. If a player is paired with a bye opponent, or a dropped opponent then
 *   score array is [3, 0] or [0, 3] indicating a win for the player.
 * */
export const runMatchmaker = (input) => {
  // sort in descending points order
  // dropped players should go to the bottom
  const players = [...input].sort((a, b) => {
    if (a.dropped && !b.dropped) {
      return 1;
    }
    if (!a.dropped && b.dropped) {
      return -1;
    }
    return b.points - a.points;
  });

  const matches = [];

  try {
    while (players.length > 0) {
      const [p1] = players.splice(0, 1);
      const [p2] = players.splice(findMatchingPlayerIndex(p1, players), 1);
      const score = computeInitialScore(p1, p2);
      matches.push({ p1: p1.id, p2: p2.id, score });
    }
    return matches;
  } catch (err) {
    if (err instanceof MatchMakerError) {
      // the matchmaker algorithm violated a constraint
      // this is due to the randomness of the process. Lets retry
      return runMatchmaker(input);
    }
    throw err;
  }
};
