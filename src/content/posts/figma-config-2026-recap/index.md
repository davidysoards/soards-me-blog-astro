---
title: Figma Config 2026 Recap
subtitle: Context, trust, and better onboarding
description: A personal recap of Figma Config 2026, from Figma's product launch to AI workflows, PM onboarding, and designing trust at Waymo.
pubDate: 2026-06-30T16:00:00.000Z
heroImage: config-2026.png
tags:
  - design
  - ai
  - figma
  - workflow
---

I was excited to attend Config this year, but I found myself in a slightly awkward spot because lately I haven't been designing in Figma at all.

I still find Figma useful for displaying multiple screens and workflows across the canvas in a single view. But my current workflow has been moving toward generating designs in actual HTML and CSS, using a documented design system, indexed component library, and skills that provide the necessary context to my AI agent.

So I went in curious, albeit somewhat skeptical that I would be impressed by new features.

## Keynote was better than expected

The product launch felt like Figma making a direct run at Adobe. And my initial reaction was, "uh-oh, this is going to become a bloated mess. Much like Photoshop." However, by the end of the presentations, I was more impressed by the new feature list than I expected.

The new motion features seem genuinely useful. Being able to start an animation with a prompt, then edit it by hand on the timeline, with exporting to either web-native formats or video renders is a nice mix of AI acceleration and human control.

Code Layers, live code inside frames on the Figma canvas, also looks promising. My teammates were excited about it. I'm just not sure if it will fit into my recent workflow, but I think it is the right direction for Figma. Unlike Code Connect, which I still don't like. I am just really not a fan of maintaining an extra layer to keep a design tool and the actual codebase in sync. The more I work with AI-assisted design and development, the more I want the source of truth to be the actual design system and the actual components.

Figma is pushing hard on Figma-native ways to give agents design context. As they should be. But I'm of the opinion that there are better ways to document a design system and give the correct context to AI agents, without making Figma the main surface for everything.

## Favorite talks

I enjoyed several of the talks around AI and AI workflows, but some of my favorites weren't about that at all. Instead they focused on topics like designing for unique constraints, trust, onboarding, sound, and taste.

**"Beyond design systems: designing for robots and seniors" by Anna Oh** was a memorable example. Norbert is a robot used in senior-living communities. The interface is a screen with a teddy bear face. It talks with residents and can perform routine tasks like health checks and contactless vital monitoring. So much care went into selecting the most appealing bear face. And meaningful iterations were made on seemingly small details like making sure Norbert didn't keep repeating "Hi, I'm Norbert" every time it approached residents. They already knew Norbert, and re-introducing itself would break the connection that was forming.

I want more AI stories like this one about genuine improvements in people's lives, and less about automating away white-collar jobs.

**"Be the director: how stage craft informs product craft" by Kim Beverett** compared stagecraft with product design. Specifically she referenced a minimalist production of A Midsummer Night's Dream to make a point about product craft and assumed conventions.

She emphasized that we have this amazing new technology at our fingertips but seem to be stuck building the same basic interfaces. She prompted Codex: "make the best todo app ever. amazing. revolutionary," and the result was less than revolutionary: purple gradients, glowing charts, standard layout.

Her point was that prompting alone is not going to produce real innovation. I appreciate that distinction. I'm interested in AI for making work *better*, instead of using it to produce increasing amounts of confident but hollow slop.

**"How structured thinking gives your AI superpowers" by Carola Pescio Canale** inspired me to start recording daily/weekly thoughts, transcribing them, and feeding them to a personal AI in order to learn my voice and build context about my work. I took that advice to heart. I recorded my rambling thoughts on the conference, summarized them, and then molded them into this post.

## Adoption issues

**"Skill issue: how we built an OS for PMs at Figma" by Jinen Kamdar and Lawrence Luk** was one of the most personally useful talks for me.

A small group at Figma spent about a month turning repeated PM work into AI skills. Everyone who tried it loved it, but adoption rate hit a wall at around 25%. The reason turned out to be just that people didn't have time to set it up. "I just need one meeting-free day."

Their solution was to "hijack an offsite." They made it into a hands-on onboarding activity, and adoption took off.

This made me think that I need to do better at educating my co-workers on utilizing the new tools I have developed for designing and building UI (component library skills, DESIGN.md files). PMs have generally responded well to my HTML-first mockups. I've encountered more resistance from developers that are used to receiving static Figma mockups. If I want people to adopt a different workflow, I need to teach it. Objectively better workflows still need proper onboarding.

## Design for trust

I was primed for **"Legibility by design" by Ryan Powell**, having just ridden in a Waymo for the first time two days prior. The theme was designing to establish user trust, and they have obviously put a great deal of thought into just that.

For example, the in-car screen does not show everything the car senses. Instead, it shows the rider just what they need to feel safe. Other cars, pedestrians, bikes, even traffic cones are all represented and demonstrate not only that the car knows they are there but also that it can differentiate between those objects.

The sound design was equally impressive. Different tones communicate moments like entry, exit, and starting the ride. To help put riders at ease, everything is in the key of E because it is associated with joyfulness and pleasure.

The exterior signals were interesting too. A human driver can make eye contact with a pedestrian. A Waymo cannot, so the car needs another way to say "I see you." Outside lights and displays become part of the trust system.

Ryan encouraged the audience to consider spending more time designing for trust and less for promoting new features.

## Conclusion

It was a fun event, and it was nice to spend some time with a couple of my remote coworkers in person.

I came home feeling like I am on the right track with how I have been using AI at work. The talks that resonated most with me were about giving the system better context and helping people understand how to use a new workflow.

For me, that probably means pushing the HTML and component-first workflow further, but also doing a better job of teaching it.
