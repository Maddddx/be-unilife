/**
 * Research sources used on reveal screens.
 * Rule: a claim may show numbers only when `verified: true`
 * (checked against the original paper, not a summary).
 *
 * Verification pass: 2026-11-11. Every number in `facts` was read in the
 * document named in `readFrom`, at the page/table given in `where`.
 * Page numbers are the paper's printed page numbers of that document.
 * If a number is not in `facts`, it has NOT been verified — don't show it.
 */
export interface SourceFact {
  /** the claim, with the exact number as printed in the paper */
  claim: string
  /** page / table / figure in the document listed in `readFrom` */
  where: string
}

export interface Source {
  id: string
  citation: string
  url: string
  /** checked against the original paper */
  verified: boolean
  note?: string
  /** which version of the paper was actually read (WP / author copy / journal scan) */
  readFrom?: string
  /** verified, quotable numbers with location in the original */
  facts?: SourceFact[]
}

export const SOURCES: Record<string, Source> = {
  allcott2022: {
    id: 'allcott2022',
    citation:
      'Allcott, Gentzkow & Song (2022). Digital Addiction. American Economic Review 112(7): 2424–63.',
    url: 'https://doi.org/10.1257/aer.20210867',
    verified: true,
    readFrom:
      'NBER Working Paper 28936 (June 2021, revised March 2022), https://www.nber.org/papers/w28936 — cross-checked against the authors’ accepted version dated 7 Mar 2022 (same numbers). Journal typeset PDF not read (paywalled); AER citation/DOI confirmed on aeaweb.org.',
    note:
      'Sample: ~2,000 US adults aged 18–64, Android users, recruited via Facebook/Instagram ads, Mar–Jul 2020 (COVID onset). NOT students, NOT Thai. ' +
      '"Social media" in the body = FITSBY screen time (Facebook, Instagram, Twitter, Snapchat, web browsers, YouTube) on the phone only. ' +
      'CORRECTION vs docs/PLAN.md: limit effect is 16% (22 min/day), not 17%. ' +
      'The 31% is a MODEL counterfactual (structural estimate, assumes limits remove 100% of self-control problems), not a direct measurement. ' +
      'Authors caution sample is not representative of US adults (p.5). Use wording like "งานหนึ่งในสหรัฐฯ ประเมินว่า..." and show the sample.',
    facts: [
      {
        claim:
          'Model estimate: eliminating self-control problems would cut FITSBY use by 48 min/day = 31% of baseline use ("self-control problems cause 31 percent of social media use").',
        where: 'Abstract; Introduction p.5',
      },
      {
        claim:
          'Giving access to screen-time-limit functionality reduced FITSBY use by 22 min/day = 16% vs Control, over periods 2–5 (12 weeks); still 19 min/day in the last week.',
        where: 'pp.4 and 19',
      },
      {
        claim:
          'No incentive was offered, yet 78% of Limit-group participants set binding limits and kept using them to the end.',
        where: 'p.4',
      },
      {
        claim:
          'Average willingness to pay for 3 weeks of limit functionality: $4.20; ~58% would pay something, 20% more than $10.',
        where: 'pp.4 and 20',
      },
      {
        claim:
          'Control group underestimated next-period FITSBY use by 6.1 min/day (~4%) — partial naivete, even after being reminded of past use.',
        where: 'p.4; p.20 (Figure 6)',
      },
      {
        claim:
          'About half of the time the limit removed moved to other (non-limited) apps: 12 min/day substitution.',
        where: 'p.19',
      },
      {
        claim:
          'Eligibility: US resident, 18–64, Android primary phone; 4,038 completed survey 1, 1,938 completed the study; analysis sample 1,933.',
        where: 'pp.9 and 15',
      },
    ],
  },
  ariely2002: {
    id: 'ariely2002',
    citation:
      'Ariely & Wertenbroch (2002). Procrastination, Deadlines, and Performance: Self-Control by Precommitment. Psychological Science 13(3): 219–224.',
    url: 'https://doi.org/10.1111/1467-9280.00441',
    verified: true,
    readFrom:
      'Author manuscript (MIT-hosted): https://erationality.media.mit.edu/papers/dan/eRational/Dynamic%20preferences/deadlines.pdf. Page numbers below are the MANUSCRIPT page numbers (-1- … -8-), not the journal pages 219–224.',
    note:
      'Samples: pilot studies = MIT students in a 14-week course; Study 1 = 99 PROFESSIONALS in an MIT executive-education course (sections assigned, not individuals); Study 2 = 60 students recruited at MIT via ads, randomly assigned. ' +
      'Key nuance for the reveal: self-imposed deadlines DO help (better than one end deadline), but are worse than evenly spaced external deadlines, because people space them sub-optimally. ' +
      'Study 2 error counts are only in Figure 2 (not legible as numbers in the manuscript) — do not quote error counts.',
    facts: [
      {
        claim:
          'Free-choice section (could set own, penalised deadlines): only 27% (12 students) put all three papers on the last day; only 43 deadlines (32%) were in the final week.',
        where: 'Study 1 Results, manuscript p.4',
      },
      {
        claim:
          'Grades on the 3 papers: evenly-spaced external deadlines 88.76 vs self-imposed 85.67 (t(97)=3.03, p=.003); final project 86 vs 77.',
        where: 'Study 1 Results, manuscript p.4',
      },
      {
        claim:
          'Study 2 (proofreading, N=60, $0.10 per error found, $1/day late penalty): errors detected highest with evenly spaced deadlines, then self-imposed, lowest with a single end deadline (all p < .01).',
        where: 'Study 2 Results, manuscript p.6',
      },
      {
        claim:
          'Among self-imposers who spaced deadlines evenly, the gap to external deadlines shrank and became non-significant (Study 1 effect size −59%; Study 2 −55% to −79%).',
        where: 'manuscript pp.5 and 7',
      },
    ],
  },
  bisin2020: {
    id: 'bisin2020',
    citation:
      'Bisin & Hyndman (2020). Present-bias, procrastination and deadlines in a field experiment. Games and Economic Behavior 119: 339–357.',
    url: 'https://doi.org/10.1016/j.geb.2019.11.010',
    verified: true,
    readFrom:
      'Published GEB version (author-hosted at NYU: https://bpb-us-e1.wpmucdn.com/wp.nyu.edu/dist/c/16384/files/2021/07/1-s2.0-S0899825619301757-main.pdf), journal pages. Also read NBER WP w19874 (rev. Apr 2018) — its present-bias numbers DIFFER (see note).',
    note:
      'Sample: 278 New York University students, sessions in spring 2010 and 2011 at NYU CESS lab; task = alphabetise a list of nonsense "words" at home within 2h, paid $20 (1 task) or $15/task (3 tasks). Not Thai. ' +
      'CORRECTION vs docs/PLAN.md "present bias ~30–40%": the published paper classifies ~42% as present-biased (26/81 in 1-task, 90/197 in 3-task), via a logit on survey traits — a proxy, not a direct β estimate. ' +
      'The 2018 NBER WP instead reported "about 30% likely quasi-hyperbolic" from a structural model — superseded; do not use. ' +
      'Results conflict partly with Ariely & Wertenbroch: here deadlines did NOT raise completion. Reveal must say evidence is mixed.',
    facts: [
      {
        claim:
          'Demand for commitment: 31.4% self-imposed a binding deadline in the 1-task treatment; 20.8%–61.9% per task/session in the 3-task treatments (61.9% on task 1, mid-semester).',
        where: 'Table 2, p.345',
      },
      {
        claim:
          'Deadlines did not raise completion: 1-task 57.1% (endogenous deadlines) vs 45.6% (no deadline), n.s.; 3-task 36.8% (self-imposed) vs 40.6% (external) vs 47.0% (no deadlines), endogenous vs none significant at p<0.05.',
        where: 'Table 3 and Section 4.2, p.345',
      },
      {
        claim:
          'Students who actually set a deadline completed fewer tasks than those who did not (3-task: 33.3% vs 40.4%).',
        where: 'Table 3, p.345',
      },
      {
        claim: 'About 42% of subjects classified as present-biased (26 of 81 in 1T, 90 of 197 in 3T).',
        where: 'p.348',
      },
      {
        claim:
          'Present-biased students procrastinated with a single task, but behaved like non-present-biased students with repeated tasks.',
        where: 'Abstract; p.348',
      },
      {
        claim: 'Sample sizes per treatment (total 278).',
        where: 'Table 1, p.343',
      },
    ],
  },
  buehler1994: {
    id: 'buehler1994',
    citation:
      'Buehler, Griffin & Ross (1994). Exploring the "planning fallacy": Why people underestimate their task completion times. Journal of Personality and Social Psychology 67(3): 366–381.',
    url: 'https://doi.org/10.1037/0022-3514.67.3.366',
    verified: true,
    readFrom:
      'Journal PDF (APA), course copy: https://bear.warrington.ufl.edu/brenner/mar7588/Papers/buehler-et-al-1994.pdf',
    note:
      'Sample (Study 1): 37 psychology honours students (27 women, 10 men), final semester of the Honors Thesis course, University of Waterloo, Canada; 33 included in the days analysis (4 had not finished). ' +
      'The "14%–102% overconfident" figure from the textbook is NOT in this paper (Study 1) — do not use it. ' +
      'Derived (our arithmetic, label as such): actual time was ~1.6× the best-guess prediction (55.5 / 33.9).',
    facts: [
      {
        claim:
          'Thesis completion: best-guess prediction 33.9 days vs actual 55.5 days (t(32)=3.43, p<.002); only 29.7% finished by their best-guess date.',
        where: 'Study 1, p.369, Table 1',
      },
      {
        claim:
          '"If everything went as poorly as it possibly could" (worst-case) prediction was 48.6 days — still shorter than the actual 55.5; fewer than half (48.7%) finished by their worst-case date.',
        where: 'Study 1, p.369, Table 1',
      },
      {
        claim: 'Best-case prediction 27.4 days; only 10.8% finished by it.',
        where: 'Study 1, p.369, Table 1',
      },
      {
        claim:
          'Classroom survey: students reported finishing about two-thirds (M = 68%) of past projects later than they expected.',
        where: 'Introduction, p.366',
      },
    ],
  },
  arkes1985: {
    id: 'arkes1985',
    citation:
      'Arkes & Blumer (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35: 124–140.',
    url: 'https://doi.org/10.1016/0749-5978(85)90049-4',
    verified: true,
    readFrom: 'Journal scan PDF: https://cognition.aau.at/bg/BA/Arkes%20%26%20Blumer%201985.pdf',
    note:
      'Questionnaire studies: Ohio and Oregon college students, between-subjects (no one answered more than one question) (p.126). Field study: Ohio University Theater season-ticket buyers 1982–83. US, 1980s, hypothetical scenarios — not Thai.',
    facts: [
      {
        claim:
          'Ski trip ($100 Michigan vs $50 Wisconsin you expect to enjoy more, same weekend): only 46% chose the trip they preferred; 33 of 61 chose the $100 trip.',
        where: 'Experiment 1, pp.126–127',
      },
      {
        claim:
          'Theater field experiment (randomised discounts, N=54): full-price buyers used more tickets in the first half of the season (4.11 plays) than $2-discount (3.32) and $7-discount (3.29) buyers; no difference in the second half.',
        where: 'Experiment 2, pp.127–128',
      },
      {
        claim:
          'Radar-blank plane: with $10M already invested (90% done), 41 of 48 (85%) chose to fund the last 10%; with nothing invested, only 10 of 60 (17%) would fund it.',
        where: 'Experiment 3, p.129',
      },
      {
        claim:
          'Those with a sunk cost rated the project’s chance of success higher: 41.0 vs 34.0 (0–100 scale).',
        where: 'Experiment 4, p.130',
      },
      {
        claim:
          'Economics training did not help: the share choosing the $100 trip was similar for economics students (20/61), psychology students without economics (22/61) and with economics (19/59); χ² n.s.',
        where: 'Experiment 10 and Table 1, p.136',
      },
      {
        claim: 'Proposed mechanism: reluctance to appear wasteful.',
        where: 'Abstract p.124; pp.132–133',
      },
    ],
  },
  fischbacher2001: {
    id: 'fischbacher2001',
    citation:
      'Fischbacher, Gächter & Fehr (2001). Are people conditionally cooperative? Evidence from a public goods experiment. Economics Letters 71(3): 397–404.',
    url: 'https://doi.org/10.1016/S0165-1765(01)00394-9',
    verified: true,
    readFrom:
      'University of Zurich IEW Working Paper No. 16 (July 2000, "forthcoming: Economics Letters"): https://www.econ.uzh.ch/apps/workingpapers/wp/iewwp016.pdf — page numbers are WP pages. Journal version not read; volume/pages from the DOI record.',
    note:
      'Sample: 44 first- and second-semester undergraduates (any field except economics), University of Zurich, 2 sessions, 11 groups of 4, one-shot game, avg earnings 27.6 CHF. ' +
      'Design: 20 tokens, MPCR 0.4; strategy method — own contribution for each of the 21 possible average contributions of the others (0–20). ' +
      'Very small N; later studies find different shares. Show as "งานคลาสสิกหนึ่งชิ้น (N=44)".',
    facts: [
      {
        claim: 'Conditional cooperators: 22 of 44 subjects (50%) — contribute more the more others contribute.',
        where: 'Section 3, WP p.7',
      },
      {
        claim:
          'Free riders: 13 of 44 (about 30%; abstract says "a third") contributed 0 in all 21 entries.',
        where: 'Section 3, WP p.8; Abstract',
      },
      {
        claim: '"Hump-shaped" contributors: 6 subjects (14%); 3 others (1 constant at 1 token, 2 unclassifiable).',
        where: 'Section 3, WP p.8',
      },
      {
        claim:
          'Conditional cooperators lean selfish: only 11.9% of their entries were above the diagonal ("conditional cooperation with a self-serving bias"); 4 of 22 matched others exactly.',
        where: 'Section 3, WP pp.7–8',
      },
    ],
  },
  thaler1985: {
    id: 'thaler1985',
    citation: 'Thaler (1985). Mental Accounting and Consumer Choice. Marketing Science 4(3): 199–214.',
    url: 'https://doi.org/10.1287/mksc.4.3.199',
    verified: true,
    readFrom:
      'JSTOR scan hosted by Chicago Booth: https://faculty.chicagobooth.edu/-/media/research/cdr/docs/thaler/mental-accounting-and-consumer-choice.pdf (journal pages).',
    note:
      'Small hypothetical surveys, US, 1980s: 87 Cornell undergraduate statistics students (hedonic-editing items); executive-development-program participants who drink beer (beer question, N not reported on that page). Use qualitatively + the beer example.',
    facts: [
      {
        claim:
          'Hedonic editing principles: segregate gains, integrate losses, cancel small losses against larger gains, segregate "silver linings".',
        where: 'p.202',
      },
      {
        claim:
          'Two separate losses feel worse than one combined loss of the same total: owing $100 + $50 (Mr. A) was judged more upsetting than owing $150 (Mr. B) by 66 vs 14 (7 no difference) of 87 Cornell students.',
        where: 'pp.203–204',
      },
      {
        claim:
          'Two separate wins feel better: $50 + $25 (Mr. A) judged happier than a single $75 by 56 vs 16 (15 no difference).',
        where: 'p.203',
      },
      {
        claim:
          'Transaction utility — beer on the beach: median willingness to pay $2.65 if bought from a fancy resort hotel vs $1.50 from a run-down grocery store (same beer, same beach).',
        where: 'p.206',
      },
    ],
  },
  prelec1998: {
    id: 'prelec1998',
    citation:
      'Prelec & Loewenstein (1998). The Red and the Black: Mental Accounting of Savings and Debt. Marketing Science 17(1): 4–28.',
    url: 'https://doi.org/10.1287/mksc.17.1.4',
    verified: true,
    readFrom:
      'Journal scan hosted by MIT Neuroeconomics Lab: https://nel.mit.edu/wp-content/uploads/2016/10/redblack.pdf (image PDF; read via OCR, Table 1 checked visually). Journal pages.',
    note:
      'Samples: visitors to the Phipps Conservatory (botanical garden), Pittsburgh (N≈60–91 per survey); conjoint study at an MIT student center (n=44) and a US airport (n=42). Hypothetical choices, US, 1990s. ' +
      'Concepts usable qualitatively: "pain of paying", prospective accounting (prepaid consumption feels free), coupling (credit cards weaken the link between buying and paying), debt aversion.',
    facts: [
      {
        claim:
          'Caribbean vacation ($1,200): 60% of 91 visitors preferred six $200 payments BEFORE the trip, despite an implicit interest cost of about $50.',
        where: 'Section 2, p.6',
      },
      {
        claim:
          'Washer-dryer, same payments: 84% preferred to pay AFTER it arrives (prepay: 24% within-subjects N=89; 16% first-question N=30).',
        where: 'Section 2 and Table 1, p.6',
      },
      {
        claim:
          'Separate survey of 60 visitors: 92% said a prepaid vacation would be more enjoyable; 82% said paying before would also feel less unpleasant.',
        where: 'Footnote, p.7',
      },
      {
        claim:
          'Their double-entry mental-accounting model fit 60% of subjects better vs 29% for standard discounting.',
        where: 'Abstract, p.4',
      },
    ],
  },
}
