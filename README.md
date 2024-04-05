# swiss-rounds [![CircleCI](https://dl.circleci.com/status-badge/img/gh/GAumala/swiss-rounds/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/GAumala/swiss-rounds/tree/main)

Swiss rounds algorithm for TCG events.

## Usage

``` javascript
import * as swr from '@GAumala/swiss-rounds'

// first create the tournament with a list of participant names
const t1 = swr.createTournament([
  'alice',
  'bob',
  'charlie',
  'daniel',
])

// check current round matches:
t1.rounds[t1.rounds.length - 1]

// submit match results
const t2 = swr.submitScores(t1, 0, 3, 0)
const t3 = swr.submitScores(t2, 1, 0, 3)


// generate pairings for next round
const t4 = swr.computeNextRound(t3)

// submit match results
const t5 = swr.submitScores(t4, 0, 3, 0)
const t6 = swr.submitScores(t5, 1, 0, 3)

// print final placings list
swr.computePlacings(t6)
```

## References

- https://en.onepiece-cardgame.com/pdf/tournament_rules_manual.pdf?20230407
- https://midwestchess.com/pdf/USCF_ChessTie-Break_%20Systems.pdf
- https://www.thechessrefinery.org/tiebreaks.html
