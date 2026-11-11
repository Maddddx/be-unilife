/**
 * Research sources used on reveal screens.
 * Rule: a claim may show numbers only when `verified: true`
 * (checked against the original paper, not a summary).
 */
export interface Source {
  id: string
  citation: string
  url: string
  /** checked against the original paper */
  verified: boolean
  note?: string
}

export const SOURCES: Record<string, Source> = {
  allcott2022: {
    id: 'allcott2022',
    citation: 'Allcott, Gentzkow & Song (2022). Digital Addiction. American Economic Review.',
    url: 'https://www.nber.org/papers/w28936',
    verified: false,
  },
  ariely2002: {
    id: 'ariely2002',
    citation:
      'Ariely & Wertenbroch (2002). Procrastination, Deadlines, and Performance. Psychological Science 13(3).',
    url: 'https://erationality.media.mit.edu/papers/dan/eRational/Dynamic%20preferences/deadlines.pdf',
    verified: false,
  },
  bisin2020: {
    id: 'bisin2020',
    citation: 'Bisin & Hyndman. Present-Bias, Procrastination and Deadlines in a Field Experiment.',
    url: 'https://www.nber.org/papers/w19874',
    verified: false,
  },
  buehler1994: {
    id: 'buehler1994',
    citation:
      'Buehler, Griffin & Ross (1994). Exploring the "planning fallacy". Journal of Personality and Social Psychology.',
    url: 'https://doi.org/10.1037/0022-3514.67.3.366',
    verified: false,
  },
  arkes1985: {
    id: 'arkes1985',
    citation: 'Arkes & Blumer (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes.',
    url: 'https://doi.org/10.1016/0749-5978(85)90049-4',
    verified: false,
  },
  fischbacher2001: {
    id: 'fischbacher2001',
    citation:
      'Fischbacher, Gächter & Fehr (2001). Are people conditionally cooperative? Evidence from a public goods experiment. Economics Letters.',
    url: 'https://doi.org/10.1016/S0165-1765(01)00394-9',
    verified: false,
  },
  thaler1985: {
    id: 'thaler1985',
    citation: 'Thaler (1985). Mental Accounting and Consumer Choice. Marketing Science.',
    url: 'https://doi.org/10.1287/mksc.4.3.199',
    verified: false,
  },
  prelec1998: {
    id: 'prelec1998',
    citation: 'Prelec & Loewenstein (1998). The Red and the Black: Mental Accounting of Savings and Debt. Marketing Science.',
    url: 'https://doi.org/10.1287/mksc.17.1.4',
    verified: false,
  },
}
