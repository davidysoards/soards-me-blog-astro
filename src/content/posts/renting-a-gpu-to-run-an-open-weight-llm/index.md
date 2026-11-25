---
title: Renting a GPU to Run an Open-Weight LLM
subtitle: Testing Qwen3-8B on RunPod with vLLM before buying local hardware.
description: Deploying Qwen3-8B on RunPod with vLLM to see what self-hosting actually costs and whether it is worth the effort.
pubDate: 2026-11-24T12:00:00.000Z
heroImage: renting-a-gpu-to-run-an-open-weight-llm.webp
tags:
  - ai
  - vllm
  - gpu
  - pi
---

Until recently, I had only used language models through commercial APIs. When I got curious about running an open-weight model myself, my first thought was to buy a maxed out Mac Studio, but spending several thousand dollars just to satisfy my curiosity did not make much sense, so I rented a cloud GPU instead.

I wanted to answer three practical questions: how to run an open-weight model without buying local hardware, what it actually costs, and whether it is worth the effort.

## Getting a model running without buying hardware

I used RunPod so I could rent an NVIDIA GPU by the hour without managing a physical machine. I looked at cheaper cards first, including the RTX A5000 and RTX 3090, but availability pushed me to an NVIDIA RTX A6000 with 48 GB of VRAM in RunPod's EU-SE-1 Secure Cloud. In October 2026, that GPU rented for $0.59/hour.

![RunPod GPU selection grid showing the RTX A6000 at $0.59/hr alongside RTX 3090 and RTX A5000 options](./images/gpu-selection.png)

I had already installed RunPod's official skills for <a href="https://pi.dev" target="_blank" rel="noopener">Pi</a>, my coding agent, yet **I deliberately did the first deployment by hand**. Letting an agent set up infrastructure I did not understand would have defeated the purpose.

I picked RunPod's `vLLM Latest` template (`vllm/vllm-openai:latest`, which ran vLLM 0.31.0 at the time) and deployed `Qwen/Qwen3-8B` with a 5 GB container disk and a separate volume mounted at `/workspace` for the model cache. If you try this now, pin a specific vLLM version tag rather than `latest`, which changes over time.

![RunPod template picker showing the vLLM Latest template using vllm/vllm-openai:latest](./images/template-selection.png)

Here is the launch configuration captured from my running pod. RunPod's container entrypoint invokes `vllm serve`, so the pod start command passes `Qwen/Qwen3-8B` and these flags:

```bash
vllm serve Qwen/Qwen3-8B \
  --host 0.0.0.0 \
  --port 8000 \
  --dtype auto \
  --enforce-eager \
  --gpu-memory-utilization 0.95 \
  --max-model-len 8128
```

Right after the model loaded, `nvidia-smi` showed about 46 GB of the 48 GB VRAM allocated while GPU compute utilization sat at 0%. That is `--gpu-memory-utilization 0.95` at work: vLLM reserves VRAM upfront for model weights and the KV cache. **Allocated GPU memory does not mean the card is actively running inference.**

Exposing port 8000 as an HTTP port gives you a <a href="https://docs.runpod.io/pods/configuration/expose-ports" target="_blank" rel="noopener">RunPod proxy URL</a> (`https://<pod-id>-8000.proxy.runpod.net`), with vLLM's OpenAI-compatible API under `/v1`. Passing `--api-key` (or setting `VLLM_API_KEY`) gates `/v1` requests. One caveat from the <a href="https://docs.vllm.ai/en/stable/usage/security/" target="_blank" rel="noopener">vLLM security docs</a>: `--api-key` does not authenticate every route on the server, so do not rely on it alone for a public deployment.

Once the endpoint came up, I hit it from my Mac mini over the HTTPS proxy instead of working inside SSH. Here is a reconstructed streaming request matching the settings I used:

```bash
curl --no-buffer --fail-with-body \
  "${VLLM_BASE_URL%/}/chat/completions" \
  -H "Authorization: Bearer ${VLLM_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -H "User-Agent: llm-inference-lab/1.0" \
  --data-binary @- <<'JSON'
{
  "model": "Qwen/Qwen3-8B",
  "messages": [{"role": "user", "content": "Count upward from 1, separated by spaces."}],
  "max_tokens": 32,
  "temperature": 0,
  "seed": 0,
  "stream": true,
  "stream_options": {"include_usage": true},
  "chat_template_kwargs": {"enable_thinking": false}
}
JSON
```

`stream_options.include_usage` tells vLLM to include actual token counts at the end of the stream, and `enable_thinking: false` disables Qwen3's reasoning mode. My first manual non-streaming request returned 224 tokens in about 7.1 seconds; with streaming on, the first byte arrived in about 0.89 seconds.

When you finish, stopping a RunPod pod halts the hourly GPU charge, but **storage billing continues until you terminate the pod**. If you attached a separate network or global volume at `/workspace`, delete that volume too, since terminating a pod only detaches it.

![RunPod Pods list showing the stopped RTX A6000 pod at $0.00/hr with Terminate Pod open in the actions menu](./images/terminate-pod.png)

## One user leaves most of the GPU idle

Once `curl` confirmed the endpoint worked, I brought Pi in to write a small Python script on my Mac mini to test how the server behaved under load.

On a single request with a short prompt, `Qwen3-8B` decoded at roughly 41 to 42 tokens/s after the first token. That feels snappy, but a lone request leaves most of the GPU's batch capacity unused. Here is what happened when I sent one, two, and four requests at the same time:

<style>
.llm-viz{font-family:inherit;}
.llm-viz .t{fill:var(--color-ink,#211f26);font-size:13px;}
.llm-viz .h{fill:var(--color-ink,#211f26);font-size:14px;font-weight:600;}
.llm-viz .m{fill:var(--color-mute,#65636d);font-size:12px;}
.llm-viz .g{stroke:var(--color-rule,#dcdbdd);stroke-width:1;}
.llm-viz .bar{fill:var(--color-accent,#e5484d);}
.llm-viz .line{fill:none;stroke:var(--color-accent,#e5484d);stroke-width:2;stroke-linejoin:round;stroke-linecap:round;}
.llm-viz .dot{fill:var(--color-accent,#e5484d);stroke:var(--color-paper,#fdfcfd);stroke-width:2;}
</style>

<figure>
<div style="display:flex;flex-wrap:wrap;gap:1.5rem;justify-content:center">
<svg class="llm-viz" viewBox="0 0 300 230" role="img" aria-label="Column chart: total output tokens per second rises from 36 with one request at once to 63 with two and 122 with four." style="flex:1 1 260px;max-width:340px;height:auto">
<text class="h" x="0" y="18">Total output (tokens/s)</text>
<line class="g" x1="40" x2="288" y1="186.0" y2="186.0"/>
<text class="m" x="32" y="190.0" text-anchor="end">0</text>
<line class="g" x1="40" x2="288" y1="145.4" y2="145.4"/>
<text class="m" x="32" y="149.4" text-anchor="end">40</text>
<line class="g" x1="40" x2="288" y1="104.9" y2="104.9"/>
<text class="m" x="32" y="108.9" text-anchor="end">80</text>
<line class="g" x1="40" x2="288" y1="64.3" y2="64.3"/>
<text class="m" x="32" y="68.3" text-anchor="end">120</text>
<path class="bar" d="M69.3,186.0V153.4Q69.3,149.4 73.3,149.4H89.3Q93.3,149.4 93.3,153.4V186.0Z"><title>1 at once: 36.1 output tokens/s total (5 requests in 5 batches)</title></path>
<text class="t" x="81.3" y="143.4" text-anchor="middle">36</text>
<text class="m" x="81.3" y="204" text-anchor="middle">1</text>
<path class="bar" d="M152.0,186.0V126.0Q152.0,122.0 156.0,122.0H172.0Q176.0,122.0 176.0,126.0V186.0Z"><title>2 at once: 63.1 output tokens/s total (10 requests in 5 batches)</title></path>
<text class="t" x="164.0" y="116.0" text-anchor="middle">63</text>
<text class="m" x="164.0" y="204" text-anchor="middle">2</text>
<path class="bar" d="M234.7,186.0V66.2Q234.7,62.2 238.7,62.2H254.7Q258.7,62.2 258.7,66.2V186.0Z"><title>4 at once: 122.1 output tokens/s total (20 requests in 5 batches)</title></path>
<text class="t" x="246.7" y="56.2" text-anchor="middle">122</text>
<text class="m" x="246.7" y="204" text-anchor="middle">4</text>
<text class="m" x="164.0" y="224" text-anchor="middle">requests at once</text>
</svg>
<svg class="llm-viz" viewBox="0 0 300 230" role="img" aria-label="Column chart: median time per request rises from 3.5 seconds with one request at once to 3.7 with two and 4.2 with four." style="flex:1 1 260px;max-width:340px;height:auto">
<text class="h" x="0" y="18">Median time per request (s)</text>
<line class="g" x1="40" x2="288" y1="186.0" y2="186.0"/>
<text class="m" x="32" y="190.0" text-anchor="end">0</text>
<line class="g" x1="40" x2="288" y1="157.6" y2="157.6"/>
<text class="m" x="32" y="161.6" text-anchor="end">1</text>
<line class="g" x1="40" x2="288" y1="129.2" y2="129.2"/>
<text class="m" x="32" y="133.2" text-anchor="end">2</text>
<line class="g" x1="40" x2="288" y1="100.8" y2="100.8"/>
<text class="m" x="32" y="104.8" text-anchor="end">3</text>
<line class="g" x1="40" x2="288" y1="72.4" y2="72.4"/>
<text class="m" x="32" y="76.4" text-anchor="end">4</text>
<line class="g" x1="40" x2="288" y1="44.0" y2="44.0"/>
<text class="m" x="32" y="48.0" text-anchor="end">5</text>
<path class="bar" d="M69.3,186.0V89.4Q69.3,85.4 73.3,85.4H89.3Q93.3,85.4 93.3,89.4V186.0Z"><title>1 at once: median 3.54 s per request, median 41.6 tokens/s per request after the first token</title></path>
<text class="t" x="81.3" y="79.4" text-anchor="middle">3.5</text>
<text class="m" x="81.3" y="204" text-anchor="middle">1</text>
<path class="bar" d="M152.0,186.0V84.4Q152.0,80.4 156.0,80.4H172.0Q176.0,80.4 176.0,84.4V186.0Z"><title>2 at once: median 3.72 s per request, median 41.1 tokens/s per request after the first token</title></path>
<text class="t" x="164.0" y="74.4" text-anchor="middle">3.7</text>
<text class="m" x="164.0" y="204" text-anchor="middle">2</text>
<path class="bar" d="M234.7,186.0V69.5Q234.7,65.5 238.7,65.5H254.7Q258.7,65.5 258.7,69.5V186.0Z"><title>4 at once: median 4.24 s per request, median 33.2 tokens/s per request after the first token</title></path>
<text class="t" x="246.7" y="59.5" text-anchor="middle">4.2</text>
<text class="m" x="246.7" y="204" text-anchor="middle">4</text>
<text class="m" x="164.0" y="224" text-anchor="middle">requests at once</text>
</svg>
</div>
<figcaption class="text-sm leading-normal text-mute italic">Measured from my client over RunPod's proxy (5 batches per setting, 39 prompt / 128 output tokens). Total output is combined throughput, not single-request speed.</figcaption>
</figure>

At four concurrent requests, combined output jumped from 36.1 to 122.1 tokens/s (3.38x). Individual requests slowed down by about 20% in exchange: median latency went from 3.54 to 4.24 seconds, and per-request decoding dropped from 41.6 to 33.2 tokens/s. Four was simply the highest level I tested, not a proven limit. **For a single developer sending one prompt at a time, you are paying for far more throughput than you use.**

## What it actually costs

At the historical $0.59/hour rate, sustaining that concurrency-4 rate nonstop projects to about $1.34 per million output tokens.

That number only holds if requests keep the GPU busy 100% of the time. With a rented card, **you pay for time, not tokens**: the meter runs at $0.59/hour ($14.16/day, or $424.80 for a full month) whether the model is generating output or sitting idle.

<figure>
<svg class="llm-viz" viewBox="0 0 440 290" role="img" aria-label="Line chart: projected GPU cost per million output tokens at four requests at once falls from $13.42 at 10% busy time to $1.34 at 100%." style="width:100%;max-width:520px;height:auto;display:block;margin:0 auto">
<text class="h" x="0" y="18">GPU rental per million output tokens</text>
<line class="g" x1="48" x2="416" y1="244.0" y2="244.0"/>
<text class="m" x="40" y="248.0" text-anchor="end">$0</text>
<line class="g" x1="48" x2="416" y1="189.6" y2="189.6"/>
<text class="m" x="40" y="193.6" text-anchor="end">$4</text>
<line class="g" x1="48" x2="416" y1="135.2" y2="135.2"/>
<text class="m" x="40" y="139.2" text-anchor="end">$8</text>
<line class="g" x1="48" x2="416" y1="80.8" y2="80.8"/>
<text class="m" x="40" y="84.8" text-anchor="end">$12</text>
<text class="m" x="48.0" y="262" text-anchor="middle">10%</text>
<text class="m" x="109.3" y="262" text-anchor="middle">25%</text>
<text class="m" x="211.6" y="262" text-anchor="middle">50%</text>
<text class="m" x="313.8" y="262" text-anchor="middle">75%</text>
<text class="m" x="416.0" y="262" text-anchor="middle">100%</text>
<text class="m" x="232.0" y="284" text-anchor="middle">share of rented time spent serving requests</text>
<path class="line" d="M48.0,61.4 L52.1,78.0 L56.2,91.9 L60.3,103.6 L64.4,113.6 L68.4,122.3 L72.5,129.9 L76.6,136.6 L80.7,142.6 L84.8,147.9 L88.9,152.7 L93.0,157.1 L97.1,161.0 L101.2,164.6 L105.2,167.9 L109.3,171.0 L113.4,173.8 L117.5,176.4 L121.6,178.8 L125.7,181.0 L129.8,183.1 L133.9,185.1 L138.0,186.9 L142.0,188.7 L146.1,190.3 L150.2,191.8 L154.3,193.3 L158.4,194.7 L162.5,196.0 L166.6,197.2 L170.7,198.4 L174.8,199.5 L178.8,200.5 L182.9,201.5 L187.0,202.5 L191.1,203.4 L195.2,204.3 L199.3,205.2 L203.4,206.0 L207.5,206.7 L211.6,207.5 L215.6,208.2 L219.7,208.9 L223.8,209.6 L227.9,210.2 L232.0,210.8 L236.1,211.4 L240.2,212.0 L244.3,212.5 L248.4,213.1 L252.4,213.6 L256.5,214.1 L260.6,214.6 L264.7,215.0 L268.8,215.5 L272.9,215.9 L277.0,216.3 L281.1,216.8 L285.2,217.2 L289.2,217.5 L293.3,217.9 L297.4,218.3 L301.5,218.6 L305.6,219.0 L309.7,219.3 L313.8,219.7 L317.9,220.0 L322.0,220.3 L326.0,220.6 L330.1,220.9 L334.2,221.2 L338.3,221.5 L342.4,221.7 L346.5,222.0 L350.6,222.3 L354.7,222.5 L358.8,222.8 L362.8,223.0 L366.9,223.3 L371.0,223.5 L375.1,223.7 L379.2,223.9 L383.3,224.2 L387.4,224.4 L391.5,224.6 L395.6,224.8 L399.6,225.0 L403.7,225.2 L407.8,225.4 L411.9,225.6 L416.0,225.7"/>
<circle class="dot" cx="48.0" cy="61.4" r="5"><title>10% busy: $13.42 per million output tokens</title></circle>
<text class="t" x="57.0" y="51.4" text-anchor="start">$13.42</text>
<circle class="dot" cx="109.3" cy="171.0" r="5"><title>25% busy: $5.37 per million output tokens</title></circle>
<text class="t" x="118.3" y="161.0" text-anchor="start">$5.37</text>
<circle class="dot" cx="211.6" cy="207.5" r="5"><title>50% busy: $2.68 per million output tokens</title></circle>
<text class="t" x="220.6" y="197.5" text-anchor="start">$2.68</text>
<circle class="dot" cx="416.0" cy="225.7" r="5"><title>100% busy: $1.34 per million output tokens</title></circle>
<text class="t" x="407.0" y="215.7" text-anchor="end">$1.34</text>
</svg>
<figcaption class="text-sm leading-normal text-mute italic">Projected GPU rental at $0.59/hour assuming the concurrency-4 rate during busy time and idle time otherwise. Estimates cover GPU time only, not my actual bill.</figcaption>
</figure>

In my own session, the 167-second benchmark window accounted for about $0.027 of GPU time, while the pod stayed up for 94 minutes across setup and testing. At $0.59/hour plus $0.001/hour for container disk, that works out to roughly $0.93 (an uptime estimate rather than a verified invoice, and excluding the separate `/workspace` volume).

![RunPod pod details showing 1h 34m uptime, RTX A6000 in EU-SE-1 Secure Cloud, $0.59/hr compute plus $0.001/hr container storage, and vllm/vllm-openai:latest start command](./images/pod-details.png)

## Is it worth the effort?

As a way to learn without dropping thousands of dollars on a Mac Studio, yes. Getting an open-weight model running on RunPod takes minutes, and for about a dollar you get a real feel for how the stack behaves and what hourly GPU billing looks like.

What I did not test is the bigger question for day-to-day work: **is using open-weight models actually a good experience, and can they compete with frontier models from the big labs?** The next step would be wiring Pi up to the Qwen3-8B endpoint for some real coding tasks, but that seemed like a separate, more involved project. This experiment answered the infrastructure side and satisfied my curiosity for now.

If you have been tempted to buy local hardware just to experiment with open-weight models, I suggest renting a GPU for an hour or two first. It is a cheap way to see what running a model actually involves before spending thousands.
