/* eslint-env jest */
import { runMatchmaker } from "./matchmaker.js";

describe("runMatchmaker", () => {
  it("should pair the two winners from previous round", () => {
    const players = [
      { id: 0, points: 0, history: [1], data: "Mike", dropped: false },
      { id: 1, points: 3, history: [0], data: "John", dropped: false },
      { id: 2, points: 0, history: [3], data: "Paul", dropped: false },
      { id: 3, points: 3, history: [2], data: "George", dropped: false },
    ];
    const matches = runMatchmaker(players);
    expect(matches).toEqual([
      {
        p1: 1,
        p2: 3,
        score: [],
      },
      {
        p1: 0,
        p2: 2,
        score: [],
      },
    ]);
  });

  it("dropped players should be at the bottom and automatically lose", () => {
    const players = [
      { id: 0, points: 0, history: [1], data: "Mike", dropped: false },
      { id: 1, points: 3, history: [0], data: "John", dropped: false },
      { id: 2, points: 0, history: [3], data: "Paul", dropped: false },
      { id: 3, points: 3, history: [2], data: "George", dropped: true },
    ];
    const matches = runMatchmaker(players);
    expect(matches).toEqual([
      {
        p1: 1,
        p2: expect.any(Number),
        score: [],
      },
      {
        p1: expect.any(Number),
        p2: 3,
        score: [3, 0],
      },
    ]);
  });
});
