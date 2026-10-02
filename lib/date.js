function parseDate(value) {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatDateUTC(date) {
  return date.toISOString().slice(0, 10);
}

export function todayUTC() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

export function calculateGoal(startDateString, goalDateString) {
  const start = parseDate(startDateString);
  const goal = parseDate(goalDateString);

  if (!start || !goal) {
    throw new Error(
      "start_date and goal_date are required and must use YYYY-MM-DD."
    );
  }

  if (goal < start) {
    throw new Error("goal_date must be on or after start_date.");
  }

  const today = todayUTC();

  const totalDays =
    Math.floor((goal - start) / 86400000) + 1;

  let currentIndex = Math.floor((today - start) / 86400000);

  if (currentIndex < 0) currentIndex = -1;
  if (currentIndex >= totalDays) currentIndex = totalDays - 1;

  const elapsedDays =
    today < start ? 0 : Math.min(totalDays, currentIndex + 1);

  const remainingDays =
    today < start ? totalDays : Math.max(0, totalDays - elapsedDays);

  const progress =
    totalDays > 0 ? elapsedDays / totalDays : 1;

  const isBeforeStart = today < start;
  const isAfterGoal = today > goal;

  return {
    start,
    goal,
    today,
    totalDays,
    elapsedDays,
    remainingDays,
    progress,
    currentIndex,
    isBeforeStart,
    isAfterGoal
  };
}
