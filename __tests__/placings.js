/* eslint-env jest */
import { computePlacings } from "../index.js";
import { TieBreaker } from "../tournament/tiebreak.js";

describe("computePlacings", () => {
  const tournament = {
    tieBreakers: [
      TieBreaker.avgWinRate,
      TieBreaker.avgOpponentWinRate,
      TieBreaker.cumulative,
    ],
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

  it("returns an array with the placings and scores", () => {
    const result = computePlacings(tournament);
    const expected = [
      { id: 2, data: "player 2", points: 7, tieBreakScores: [5833, 5208, 75] },
      { id: 1, data: "player 1", points: 7, tieBreakScores: [5833, 4583, 75] },
      { id: 3, data: "player 3", points: 6, tieBreakScores: [5000, 4792, 50] },
      { id: 5, data: "player 5", points: 6, tieBreakScores: [5000, 4792, 30] },
      { id: 6, data: "player 6", points: 6, tieBreakScores: [5000, 4583, 40] },
      { id: 4, data: "player 4", points: 3, tieBreakScores: [2500, 5208, 30] },
    ];
    expect(result).toEqual(expected);
  });
});
