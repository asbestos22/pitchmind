/**
 * Roast generator. Turns the recalled record into a roast.
 *
 * The roast EXPLICITLY cites memory that could only exist after multiple
 * sessions — "you've backed Brazil 4 times, hit once" — which is exactly the
 * before/after the judges want: on day 1 there is nothing to roast.
 */
import { RecordSummary, ScoredPick } from "../data/model.js";
import { favouriteBias } from "./score.js";

export interface RoastInput {
  summary: RecordSummary;
  scored: ScoredPick[];
  day: number;
}

export function templateRoast({ summary, scored, day }: RoastInput): string {
  if (scored.length === 0) {
    return `Day ${day}: I don't know you yet. Make some picks, let a few matches finish, and come back — I remember everything, and I will use it against you.`;
  }

  const lines: string[] = [];

  if (summary.decided === 0) {
    // No results yet — roast the picks themselves
    lines.push(`Day ${day}, ${summary.user}: no matches finished yet, but I can already see trouble.`);

    const picks = scored.map(s => s.pick);
    const homeCount = picks.filter(p => p === 'HOME').length;
    const drawCount = picks.filter(p => p === 'DRAW').length;
    const awayCount = picks.filter(p => p === 'AWAY').length;
    const total = picks.length;

    if (homeCount > total * 0.6) lines.push(`Out of ${total} picks, ${homeCount} are home wins. That's not analysis, that's home-court bias.`);
    else if (drawCount > total * 0.4) lines.push(`${drawCount} draws out of ${total}? You're playing it safe and that's exactly why you'll lose.`);
    else if (awayCount > total * 0.6) lines.push(`${awayCount} away wins out of ${total}. Bold. Probably wrong, but bold.`);

    const avgConf = Math.round(scored.reduce((a, s) => a + s.confidence, 0) / total);
    if (avgConf >= 80) lines.push(`Average confidence ${avgConf}%. You trust yourself more than you should. I'll be here when reality hits.`);
    else if (avgConf <= 40) lines.push(`Average confidence ${avgConf}% — at least you know you don't know. That's the first step.`);

    // Quote a hot take
    const withTake = scored.filter(s => s.take);
    if (withTake.length) {
      const pick = withTake[Math.floor(Math.random() * withTake.length)];
      lines.push(`Receipt: "${pick.take}" — you said that about ${pick.home} vs ${pick.away}. I saved it. I always do.`);
    }

    lines.push(`Come back after a few matches finish. I'll have real ammo then.`);
    return lines.join('\n');
  }

  // Has results — full roast
  const pct = Math.round(summary.accuracy * 100);
  lines.push(
    `Day ${day} verdict, ${summary.user}: ${summary.correct}/${summary.decided} correct (${pct}%).`,
  );

  const bias = favouriteBias(summary);
  if (bias) {
    const bpct = bias.picks ? Math.round((bias.correct / bias.picks) * 100) : 0;
    if (bpct < 50) {
      lines.push(
        `You keep backing ${bias.team} — ${bias.picks} times, right ${bias.correct} (${bpct}%). That's not loyalty, that's a betting addiction with extra steps.`,
      );
    } else {
      lines.push(
        `${bias.team} is carrying you: ${bias.correct}/${bias.picks}. Don't get cocky, regression to the mean is undefeated.`,
      );
    }
  }

  if (summary.overconfidentMisses > 0) {
    lines.push(
      `You called ${summary.overconfidentMisses} match${summary.overconfidentMisses > 1 ? "es" : ""} at 70%+ confidence and ate dirt. Confidence ${summary.avgConfidence}/100, accuracy ${pct}% — the gap is where your ego lives.`,
    );
  }

  const worst = scored
    .filter((s) => s.correct === false)
    .sort((a, b) => b.confidence - a.confidence)[0];
  if (worst) {
    lines.push(
      `Receipt: "${worst.take}" — you said that about ${worst.home} vs ${worst.away}, picked ${worst.pick} at ${worst.confidence}%. It went ${worst.actual}. I kept the receipt.`,
    );
  }

  if (pct >= 60) lines.push(`Annoyingly, you're actually decent. I hate that.`);
  else if (pct >= 40) lines.push(`Coin-flip merchant. A literal coin is cheaper than your takes.`);
  else lines.push(`At ${pct}% you'd profit by doing the exact opposite of whatever you believe.`);

  return lines.join("\n");
}

/** Optional LLM upgrade — same facts, sharper delivery. Falls back on any error. */
export async function llmRoast(input: RoastInput): Promise<string> {
  const key = process.env.LLM_API_KEY;
  const base = process.env.LLM_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.LLM_MODEL ?? "gpt-4o-mini";
  if (!key) return templateRoast(input);

  const facts = templateRoast(input); // grounded facts the model must not contradict
  const sys =
    "You are PitchMind, a savage but witty World Cup prediction roaster. " +
    "You ONLY roast using the factual record provided. Never invent stats. " +
    "2-5 sentences, punchy, quote at least one of the user's past takes. No emojis spam.";
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0.9,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: `Here is the user's record and grounded facts:\n\n${facts}\n\nRoast them. Stay factual.` },
        ],
      }),
    });
    if (!res.ok) return templateRoast(input);
    const data = (await res.json()) as any;
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || templateRoast(input);
  } catch {
    return templateRoast(input);
  }
}
