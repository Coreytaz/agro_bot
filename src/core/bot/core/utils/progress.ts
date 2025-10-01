export const progressBar = (percent: number) => {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const total = 10;
  const filled = Math.round((p / 100) * total);
  const empty = total - filled;
  return `Загрузка: [${"#".repeat(filled)}${"·".repeat(empty)}] ${p}%`;
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
