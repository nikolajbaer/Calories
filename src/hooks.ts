import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import type { Campaign, WeightEntry } from './types';

/**
 * `undefined` while the initial query is in flight, `null` once resolved with
 * no active campaign — kept distinct so callers can tell "still loading" from
 * "there really is no active campaign" (both would otherwise be `undefined`).
 */
export function useActiveCampaign(): Campaign | null | undefined {
  return useLiveQuery(
    async () => (await db.campaigns.where('status').equals('active').first()) ?? null,
    [],
  );
}

export function useEndedCampaigns(): Campaign[] | undefined {
  return useLiveQuery(
    () =>
      db.campaigns
        .where('status')
        .equals('ended')
        .reverse()
        .sortBy('endDate'),
    [],
  );
}

// Each of these stays `undefined` (the useLiveQuery loading sentinel) until
// campaignId is known AND the real per-day query has resolved — a query run
// with no campaignId yet is not a real answer, just "still waiting on the
// active campaign to load", so it must not masquerade as a resolved result.

export function useFoodEntriesForDay(campaignId: string | undefined, date: string) {
  return useLiveQuery(async () => {
    if (!campaignId) return undefined;
    return db.foodEntries
      .where('[campaignId+date]')
      .equals([campaignId, date])
      .toArray();
  }, [campaignId, date]);
}

export function useExerciseEntriesForDay(campaignId: string | undefined, date: string) {
  return useLiveQuery(async () => {
    if (!campaignId) return undefined;
    return db.exerciseEntries
      .where('[campaignId+date]')
      .equals([campaignId, date])
      .toArray();
  }, [campaignId, date]);
}

/**
 * `undefined` while loading, `null` once resolved with no weight logged for
 * the day — kept distinct so a component can wait for the real value before
 * deriving its initial state from it (see WeightLog).
 */
export function useWeightEntryForDay(
  campaignId: string | undefined,
  date: string,
): WeightEntry | null | undefined {
  return useLiveQuery(async () => {
    if (!campaignId) return undefined;
    const entry = await db.weightEntries
      .where('[campaignId+date]')
      .equals([campaignId, date])
      .first();
    return entry ?? null;
  }, [campaignId, date]);
}

/**
 * Most recently logged weight entry for the campaign, any date — used to
 * prefill the weight picker before today's own entry exists. `undefined`
 * while loading, `null` once resolved with no weight ever logged.
 */
export function useLatestWeightEntry(campaignId: string | undefined): WeightEntry | null | undefined {
  return useLiveQuery(async () => {
    if (!campaignId) return undefined;
    const all = await db.weightEntries.where('campaignId').equals(campaignId).sortBy('date');
    return all.length > 0 ? all[all.length - 1] : null;
  }, [campaignId]);
}

export function useFoodLibrary() {
  return useLiveQuery(() => db.foodItems.orderBy('name').toArray(), []);
}
