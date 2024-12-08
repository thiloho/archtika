<script lang="ts">
  const { date }: { date: string } = $props();

  const dateObject = new Date(date);

  const calcTimeAgo = (date: Date) => {
    const secondsElapsed = (date.getTime() - Date.now()) / 1000;

    if (Math.abs(secondsElapsed) < 1) {
      return "Just now";
    }

    const formatter = new Intl.RelativeTimeFormat("en");
    const ranges = [
      ["years", 60 * 60 * 24 * 365],
      ["months", 60 * 60 * 24 * 30],
      ["weeks", 60 * 60 * 24 * 7],
      ["days", 60 * 60 * 24],
      ["hours", 60 * 60],
      ["minutes", 60],
      ["seconds", 1]
    ] as const;

    for (const [rangeType, rangeVal] of ranges) {
      if (rangeVal < Math.abs(secondsElapsed)) {
        const delta = secondsElapsed / rangeVal;
        return formatter.format(Math.round(delta), rangeType);
      }
    }
  };
</script>

<time datetime={dateObject.toLocaleString("sv").replace(" ", "T")}>
  {calcTimeAgo(dateObject)}
</time>
