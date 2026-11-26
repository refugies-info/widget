const HOUR_IN_MS = 60 * 60 * 1000;

export const TRAFFIC_WRITE_INTERVAL_MS = HOUR_IN_MS;

export const INACTIVITY_DELAY_MS = 3 * 24 * HOUR_IN_MS;

const before = (now: Date, delay: number) => new Date(now.getTime() - delay);

export const shouldRecordTraffic = (lastTrafficAt: Date | null | undefined, now: Date) =>
  !lastTrafficAt || lastTrafficAt <= before(now, TRAFFIC_WRITE_INTERVAL_MS);

export const buildTrafficUpdate = (publicId: string, now: Date) => ({
  // Checked again by the database, for the visits handled at the same time
  filter: {
    publicId,
    status: "active",
    $or: [
      { lastTrafficAt: null },
      { lastTrafficAt: { $lte: before(now, TRAFFIC_WRITE_INTERVAL_MS) } },
    ],
  },
  update: [
    {
      $set: {
        // Start of the current activity period: it restarts after an inactivity
        activeSinceAt: {
          $cond: {
            if: { $gt: ["$lastTrafficAt", before(now, INACTIVITY_DELAY_MS)] },
            then: { $ifNull: ["$activeSinceAt", "$lastTrafficAt"] },
            else: now,
          },
        },
        lastTrafficAt: now,
      },
    },
  ],
});
