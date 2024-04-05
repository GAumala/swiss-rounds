export const currentRoundHasUnsubmittedMatches = (rounds) => {
  const currentRoundIndex = rounds.length - 1;
  const currentRound = rounds[currentRoundIndex];
  const unsubmittedMatch = currentRound.find(
    (match) => match.score.length === 0,
  );
  return unsubmittedMatch;
};

export const computePlayerPoints = (rounds, playerId) =>
  rounds.reduce((res, round) => {
    const playerMatch = round.find(
      (match) => match.p1 === playerId || match.p2 === playerId,
    );
    if (playerMatch.p1 === playerId) {
      return res + playerMatch.score[0];
    }
    if (playerMatch.p2 === playerId) {
      return res + playerMatch.score[1];
    }
    throw new Error(
      `could not compute points for player ${playerId} in match ${playerMatch}`,
    );
  }, 0);

export const computePlayerHistory = (rounds, playerId) =>
  rounds.map((round) => {
    const playerMatch = round.find(
      (match) => match.p1 === playerId || match.p2 === playerId,
    );
    if (playerMatch.p1 === playerId) {
      return playerMatch.p2;
    }
    if (playerMatch.p2 === playerId) {
      return playerMatch.p1;
    }
    throw new Error(
      `could not compute history for player ${playerId} in match ${playerMatch}`,
    );
  });
