/* eslint-env jest */
import {
  calculateAvgWinRate,
  calculateAvgOpponentWinRate,
  calculateCumulative,
  calculatePlayerScore,
  calculateModifiedMedian,
  calculateSolkoff,
} from "./tiebreak.js";

const tournament = {
  players: [
    { id: 1, data: "player 1" },
    { id: 2, data: "player 2" },
    { id: 3, data: "player 3" },
    { id: 4, data: "player 4" },
    { id: 5, data: "player 5" },
    { id: 6, data: "player 6" },
  ],
  rounds: [
    [
      { p1: 1, p2: 4, score: [3, 0] },
      { p1: 2, p2: 5, score: [3, 0] },
      { p1: 3, p2: 6, score: [3, 0] },
    ],
    [
      { p1: 1, p2: 2, score: [1, 1] },
      { p1: 3, p2: 4, score: [0, 3] },
      { p1: 5, p2: 6, score: [0, 3] },
    ],
    [
      { p1: 1, p2: 3, score: [3, 0] },
      { p1: 2, p2: 6, score: [3, 0] },
      { p1: 4, p2: 5, score: [0, 3] },
    ],
    [
      { p1: 1, p2: 5, score: [0, 3] },
      { p1: 2, p2: 3, score: [0, 3] },
      { p1: 4, p2: 6, score: [0, 3] },
    ],
  ],
};

describe("calculatePlayerScore", () => {
  it("calculates the correct value for each player in the tournament", () => {
    const { rounds } = tournament;
    const res = tournament.players.map(({ id }) =>
      calculatePlayerScore(rounds, id),
    );
    expect(res).toEqual([25, 25, 20, 10, 20, 20]);
  });
});

describe("calculateModifiedMedian", () => {
  it("calculates the correct value for each player in the tournament", () => {
    const res = tournament.players.map(({ id }) =>
      calculateModifiedMedian(tournament, id),
    );
    expect(res).toEqual([65, 65, 45, 60, 45, 40]);
  });
});

describe("calculateSolkoff", () => {
  it("calculates the correct value for each player in the tournament", () => {
    const res = tournament.players.map(({ id }) =>
      calculateSolkoff(tournament, id),
    );
    expect(res).toEqual([75, 85, 80, 85, 80, 75]);
  });
});

describe("calculateCumulative", () => {
  it("calculates the correct value for each player in the tournament", () => {
    const res = tournament.players.map(({ id }) =>
      calculateCumulative(tournament, id),
    );
    expect(res).toEqual([75, 75, 50, 30, 30, 40]);
  });
});

describe("calculateAvgWinRate", () => {
  it("calculates the correct value for each player in the tournament", () => {
    const res = tournament.players.map(({ id }) =>
      calculateAvgWinRate(tournament, id),
    );
    expect(res).toEqual([5833, 5833, 5000, 2500, 5000, 5000]);
  });
});
describe("calculateAvgOpponentWinRate", () => {
  it("calculates the correct value for each player in the tournament", () => {
    const res = tournament.players.map(({ id }) =>
      calculateAvgOpponentWinRate(tournament, id),
    );
    expect(res).toEqual([4583, 5208, 4792, 5208, 4792, 4583]);
  });
});
