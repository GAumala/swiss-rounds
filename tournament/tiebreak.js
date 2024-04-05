export class TieBreaker {
  static modifiedMean = new TieBreaker("modifiedMean");
  static solkoff = new TieBreaker("solkoff");
  static cumulative = new TieBreaker("cumulative");
  static avgWinRate = new TieBreaker("avgWinRate");
  static avgOpponentWinRate = new TieBreaker("avgOpponentWinRate");

  constructor(code) {
    this.code = code;
  }

  toString() {
    return `TieBreaker.${this.code}`;
  }
}

export const calculatePlayerScore = (rounds, playerId) =>
  rounds.reduce((res, round) => {
    const playerMatch = round.find(
      (match) => match.p1 === playerId || match.p2 === playerId,
    );

    const { p1, p2, score } = playerMatch;

    if (p1 === playerId) {
      if (score[0] > score[1]) {
        return res + 10;
      }
      if (score[0] < score[1]) {
        return res;
      }
    }
    if (p2 === playerId) {
      if (score[1] > score[0]) {
        return res + 10;
      }
      if (score[1] < score[0]) {
        return res;
      }
    }
    return res + 5; // game ended in draw
  }, 0);

const calculateOpponentScore = (rounds, playerId) =>
  rounds.reduce((res, round) => {
    const playerMatch = round.find(
      (match) => match.p1 === playerId || match.p2 === playerId,
    );

    const { p1, p2, score, autoWin } = playerMatch;

    if (autoWin) {
      return res + 5;
    }

    if (p1 === playerId) {
      if (score[0] > score[1]) {
        return res + 10;
      }
      if (score[0] < score[1]) {
        return res;
      }
    }
    if (p2 === playerId) {
      if (score[1] > score[0]) {
        return res + 10;
      }
      if (score[1] < score[0]) {
        return res;
      }
    }
    return res + 5; // game ended in draw
  }, 0);

const getPlayerOpponents = (rounds, playerId) =>
  rounds.reduce((opponents, round) => {
    const playerMatch = round.find(
      (match) => match.p1 === playerId || match.p2 === playerId,
    );

    const { p1, p2, autoWin } = playerMatch;
    if (autoWin) {
      return [...opponents, null];
    }
    const id = p1 === playerId ? p2 : p1;
    const opponent = { id, autoWin };

    return [...opponents, opponent];
  }, []);

export const calculateModifiedMedian = (tournament, playerId) => {
  const { rounds } = tournament;
  const opponents = getPlayerOpponents(rounds, playerId);
  const opponentScores = opponents.map((opponent) => {
    if (opponent.autoWin) return 0;
    return calculateOpponentScore(rounds, opponent.id);
  });
  opponentScores.sort((a, b) => a - b);

  const totalRounds = rounds.length;
  const playerScore = calculatePlayerScore(rounds, playerId);
  const medianScore = (totalRounds * 10) / 2;
  if (playerScore === medianScore) {
    opponentScores.splice(totalRounds - 1, 1);
    opponentScores.splice(0, 1);
  } else if (playerScore < medianScore) {
    opponentScores.splice(totalRounds - 1, 1);
  } else if (playerScore > medianScore) {
    opponentScores.splice(0, 1);
  }

  return opponentScores.reduce((res, score) => res + score, 0);
};

export const calculateSolkoff = (tournament, playerId) => {
  const { rounds } = tournament;
  const opponents = getPlayerOpponents(rounds, playerId);
  const opponentScores = opponents.map((opponent) => {
    if (opponent.autoWin) return 0;
    return calculateOpponentScore(rounds, opponent.id);
  });

  return opponentScores.reduce((res, score) => res + score, 0);
};

export const calculateCumulative = (tournament, playerId) =>
  tournament.rounds.reduce((res, round, index) => {
    const playerMatch = round.find(
      (match) => match.p1 === playerId || match.p2 === playerId,
    );
    const { p1, p2, score, autoWin } = playerMatch;

    if (p1 === playerId) {
      const addition = 10 * (tournament.rounds.length - index);
      if (score[0] > score[1]) {
        if (autoWin) {
          return res + addition - 10;
        }
        return res + addition;
      }
      if (score[0] < score[1]) {
        return res;
      }
    }
    if (p2 === playerId) {
      const addition = 10 * (tournament.rounds.length - index);
      if (score[1] > score[0]) {
        if (autoWin) {
          return res + addition - 10;
        }
        return res + addition;
      }
      if (score[1] < score[0]) {
        return res;
      }
    }
    return res + 5 * (tournament.rounds.length - index); // game ended in draw
  }, 0);

const countPlayerWinRatePoints = (rounds, playerId) =>
  rounds.reduce((res, round) => {
    const playerMatch = round.find(
      (match) => match.p1 === playerId || match.p2 === playerId,
    );

    const { p1, score, autoWin } = playerMatch;
    if (autoWin) return res;

    if (p1 === playerId) {
      return res + score[0];
    }
    return res + score[1];
  }, 0);

export const calculateAvgWinRate = (tournament, playerId) => {
  const { rounds } = tournament;
  const totalRounds = rounds.length;
  const wins = countPlayerWinRatePoints(rounds, playerId);
  return Math.round((wins * 10000) / 3 / totalRounds);
};

export const calculateAvgOpponentWinRate = (tournament, playerId) => {
  const { rounds } = tournament;
  const totalRounds = rounds.length;
  const totalOpponentWinRate = getPlayerOpponents(rounds, playerId).reduce(
    (res, opponent) => res + calculateAvgWinRate(tournament, opponent.id),
    0,
  );

  return Math.round(totalOpponentWinRate / totalRounds);
};

export const calculateTieBreakScores = (tournament, playerId) => {
  const { tieBreakers } = tournament;
  return tieBreakers.map((tieBreaker) => {
    switch (tieBreaker) {
      case TieBreaker.modifiedMean: {
        return calculateModifiedMedian(tournament, playerId);
      }
      case TieBreaker.solkoff: {
        return calculateSolkoff(tournament, playerId);
      }
      case TieBreaker.cumulative: {
        return calculateCumulative(tournament, playerId);
      }
      case TieBreaker.avgWinRate: {
        return calculateAvgWinRate(tournament, playerId);
      }
      case TieBreaker.avgOpponentWinRate: {
        return calculateAvgOpponentWinRate(tournament, playerId);
      }
      default: {
        throw Error("Unknown tieBreaker: " + tieBreaker);
      }
    }
  });
};
