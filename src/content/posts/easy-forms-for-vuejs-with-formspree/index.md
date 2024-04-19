---
title: Easy Forms for VueJS with Formspree
subtitle: Add a Contact Form to Your Vue or Nuxt App
description: Add a form to a VueJS website using Formspree.
pubDate: 2024-04-19T05:10:00.000Z
heroImage: formspree-vue.png
tags:
  - vue
  - formspree
---

Recently, I decided to consolidate some accounts by moving my domain registrations from Namecheap to Cloudflare and moving my static generated websites from Netlify to Cloudflare as well.

It was all pretty painless, but a few weeks later it dawned on me that **I had been using Netlify Forms** for the contact form on my portfolio site, and I hadn't bothered to change that code, so **the form was broken**.

Cloudflare doesn't have a 1:1 replacement for that feature but in their docs they have a few examples using <a href="https://formspree.io/" target="_blank">Formspree</a>, so I decided to give that service a try. Formspree has a generous free tier with up to 50 messages a month, which is more than enough for my needs.

## Options API version

The Formspree docs have examples using HMTL, AJAX, and React (there's also an official React wrapper), but no example for VueJS. Below is what I am using in my Nuxt 2 app.

```js
export default {
  name: 'Contact',
  data() {
    return {
      status: '',
    };
  },
  methods: {
    async handleSubmit(e) {
      try {
        const data = new FormData(e.target);
        const res = await fetch('https://formspree.io/f/<YOUR ENDPOINT>', {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          this.status = "Thanks! I'll get back to you soon.";
          this.$refs.contactForm.reset();
          setTimeout(() => {
            this.status = '';
          }, 5000);
        } else {
          const json = await res.json();
          if (Object.hasOwn(json, 'errors')) {
            const errors = json.errors.map((error) => error.message).join(', ');
            throw new Error(errors);
          } else {
            throw new Error('Uh-oh! There was a problem submitting your form.');
          }
        }
      } catch (err) {
        console.error(err);
        this.status = err.message;
      }
    },
  },
};
```

```html
<p v-if="status">{{ status }}</p>
<form v-else ref="contactForm" name="contactme" @submit.prevent="handleSubmit">
  <label>
    Name
    <input id="name" name="name" type="text" required />
  </label>
  <label>
    Email
    <input id="email" name="email" type="email" required />
  </label>
  <label>
    Message
    <textarea id="message" name="message" required></textarea>
  </label>
  <label class="hidden">Don't fill this out: <input name="_gotcha" /></label>
  <button type="submit">Send Message</button>
</form>
```

And so far, it's working great! Notice **I also added a** <a href="https://help.formspree.io/hc/en-us/articles/360013580813-Honeypot-spam-filtering" target="_blank">hidden "honeypot" input</a>. Any form submitted with a filled in **"\_gotcha"** input will be silently ignored by Formspree.

## Composition API version

My portfolio site is static generated and I see no good reason to spend time updating it to Nuxt/Vue 3, but if I did I would definitely use Composition API and the code would look more like this:

```js
// use script setup
const status = ref('');
const contactForm = ref(null);

async function handleSubmit(e) {
  try {
    const data = new FormData(e.target);
    const res = await fetch('https://formspree.io/f/<YOUR ENDPOINT>', {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      status.value = "Thanks! I'll get back to you soon.";
      contactForm.value.reset();
      setTimeout(() => {
        status.value = '';
      }, 5000);
    } else {
      const json = await res.json();
      if (Object.hasOwn(json, 'errors')) {
        const errors = json.errors.map((error) => error.message).join(', ');
        throw new Error(errors);
      } else {
        throw new Error('Uh-oh! There was a problem submitting your form.');
      }
    }
  } catch (err) {
    console.error(err);
    status.value = err.message;
  }
},
```
