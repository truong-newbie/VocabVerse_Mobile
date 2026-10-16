/**
 * The Practice tab now hosts the PracticeStack (see
 * src/navigation/MainNavigator.tsx). This file is kept as a
 * fallback that re-exports DueTodayScreen for any caller that
 * still imports PracticeScreen directly (e.g. unit tests, deep
 * links from notifications before the navigator is mounted).
 */
export { DueTodayScreen as PracticeScreen } from '@/screens/practice';
