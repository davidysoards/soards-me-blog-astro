---
title: Building “Decide for Me” Permissions for Pi with Jev
description: Building pi-jev-gate, a small Pi extension that combines local permission rules with Jev judgments.
pubDate: 2026-09-26T12:00:00.000Z
heroImage: jev-gate.jpg
tags:
  - ai
  - pi
  - typescript
  - jev
---

I've been using Pi lately. I like how minimal and extensible it is, but I wanted a permission option **between full YOLO (the Pi default) and asking me about every command**. Something like auto-mode in Claude Code or auto-review (“Approve for me”) in Codex.

<a href="https://github.com/earendil-works/pi/tree/main/packages/coding-agent#extensions" target="_blank">Pi's extensions</a> can intercept tool calls before they run, which seemed like a useful place to add the permission behavior I was looking for.

Enter <a href="https://typesafe.ai/blog/introducing-system-one-models-and-jev" target="_blank">Jev from TypeSafe</a>. You give it context and focused questions, and it returns typed answers. For yes/no questions, those answers are probabilities that your code can use to decide what happens next.

That seemed like a good fit. A command such as `git push` might be exactly what I asked the agent to do, or it might publish work I hadn't asked it to publish. Recognizing the command is straightforward. Connecting it to my request takes some judgment.

## Learning from existing projects

I looked at projects including <a href="https://github.com/leepokai/jev-guard" target="_blank">jev-guard</a> and <a href="https://github.com/iefnaf/pi-jev" target="_blank">pi-jev</a>. <a href="https://github.com/jomatsu/pi-jev-auto-mode" target="_blank">pi-jev-auto-mode</a> became the main inspiration, especially its division between local rules and Jev judgment. I learned a lot from version 0.4.1 while working out what I wanted my own extension to do.

I did hesitate before installing a new permission package. This code would be deciding which actions an agent could take on my computer, so I wanted to understand it closely. Building my own didn't automatically make it safer. It gave me a reason to work through those decisions and aim for something small enough that I could inspect it myself.

I also made it more complicated than it needed to be along the way.

## Pi already had the credentials

Getting access to Jev led me through a few providers. I initially landed on TypeSafe's waitlist, already used OpenRouter, and also tried Vercel AI Gateway.

During that work, I discovered that **Pi already manages provider authentication**. In my setup, OpenRouter used Pi's login flow, while Vercel AI Gateway used an API key. The extension could retrieve either credential through the same Pi API:

```ts
const providerId = provider === "openrouter"
  ? "openrouter"
  : "vercel-ai-gateway";
return (await ctx.modelRegistry.getProviderAuth(providerId))?.auth.apiKey;
```

OpenRouter's login creates an API key behind the scenes, which is why both paths end with `auth.apiKey`. I didn't need another credential store.

Direct TypeSafe access uses an environment variable. The extension's configuration file only records which provider to use.

I had also been considering broader provider abstractions and configuration options, including fallback routing and a settings UI. Returning to `pi-jev-auto-mode` helped me ask a more useful question: what is the smallest version of this that does what I actually need?

I ended up with explicit provider selection and a few provider-specific request branches. There are no retries or automatic provider fallbacks. If the selected provider can't return a judgment, the action requiring that judgment is blocked. It doesn't quietly send the request somewhere else.

The difference shows up in the source size: **508 lines in my v0.1.0 release, compared with 3,400 in pi-jev-auto-mode v0.4.1**. That's runtime TypeScript, including comments and blank lines, excluding tests and scripts. The projects cover different ground. I left out configurable policy and threshold controls, along with decision records and their UI. For example, its settings module is 327 lines; my provider-only configuration is 42. Those are features I didn't need to carry into mine.

## What stays in code

The gate handles recognizable routine work locally. `git status` and ordinary project test commands can proceed without a Jev request. Local rules also block recognized catastrophic operations and edits to gate configuration. This is the first check in the tool-call handler:

```ts
const local = classifyToolCall(event, ctx.cwd);
if (local.action === "allow") return undefined;
if (local.action === "deny") return { block: true, reason: local.reason };
```

Only calls left for judgment continue to Jev.

The questions concern the proposed action: does it fit the user's request? Could it send secrets to a network endpoint?

A TypeSafe answer for the intent question might look like this (illustrative values):

```json
{
  "answers": {
    "intent_coverage": { "type": "noul", "noul": 0.97 }
  }
}
```

Here, `noul` holds the probability that the condition is true. **The probabilities are inputs to the permission policy.** Application code combines all the required answers and applies thresholds to determine whether the call proceeds.

There is also a difference between an uncertain answer and no usable answer. A valid probability in the middle range is handled according to the particular rule. It doesn't always mean denial. A timeout, missing credential, or malformed response blocks the call that needed evaluation.

I kept requests to bounded metadata and recent genuine user input, without attaching file contents or edit bodies. Recognizable secret patterns are redacted before truncation, though that can't guarantee the remaining text contains nothing sensitive.

## The gate blocked its own development

While adding provider support, the coding agent tried to modify the permission extension. The active gate refused the write as permission-system tampering.

That was inconvenient, but it was the behavior I had asked for. Getting the agent to retry through another shell command would have worked against the protection I was building. I needed **a direct way to authorize maintenance myself**.

The solution was a pair of Pi extension commands:

```text
/jev-gate off
/jev-gate on
```

I can turn the gate off for maintenance and turn it back on afterward. These are directly invoked commands, with no corresponding model-callable tool. The switch lives in memory for the active extension instance and is never saved to configuration. A fresh instance starts enabled.

I later relaxed the blanket block on extension-file edits so they follow normal evaluation. The maintenance commands remain available.

## Checking the boundaries

One useful test supplies no credential for the selected provider and verifies that the extension doesn't try another provider.

There are still substantial limits. The shell checks match command text; they don't fully interpret aliases, wrappers, or script internals. Recognized project commands rely on trust in the checked-out code and configured development tools. Jev can make incorrect judgments too. This is **a permission layer, not a sandbox**, and passing tests doesn't establish that every allowed command is safe.

The result is <a href="https://github.com/dys-org/pi-jev-gate" target="_blank">pi-jev-gate</a>, a small Pi extension that combines local permission rules with Jev judgments for calls that need more context.
