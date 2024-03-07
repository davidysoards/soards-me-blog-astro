---
title: Make a custom night mode toggle w/React & CSS Variables
description: This post is the first in a short series where I will detail the things I learned while designing and...
pubDate: 2019-08-25T19:48:09.455Z
heroImage: always-open-night-and-day.png
tags:
  - react
  - css
  - design
canonicalLink: https://dev.to/ninjasoards/make-a-custom-night-mode-toggle-w-react-css-variables-272o
---

This post is the first in a short series where I will detail the things I learned while designing and developing a website to promote AIGA Louisville's annual Design Week. [louisvilledesignweek.com](https://louisvilledesignweek2019.netlify.app/)

Peep my [source code](https://github.com/davidysoards/louisville-design-week) 👀

[Part 2: Animated Neon SVG](/posts/make-a-flickering-neon-svg-animation-from-scratch-w-illustrator-react-emotion)

I tried a couple other methods to achieve this effect that involved using React's Context API before settling on simple CSS variables. The trouble I ran into using Context was that it simply triggered a re-render and switched the theme colors immediately without applying a transition animation.

I also believe that the best method is often the simplest method and using CSS variables is a win in that respect. The only issue is that (wah-waaah, get ready) they aren't supported in IE 🙄. Because this site is aimed at designers, the vast majority of whom are using a modern browser on their desktop (many of them a Mac where IE isn't an option at all) or using their smartphone to access the site, I reason that full IE support is not required.

Alright, now onto the fun stuff.

## The CSS Variables

Step one is to set the CSS variables on the root in the global CSS file so they can be accessed anywhere in the DOM (or in this case the virtual DOM).

Because I'm attempting to "partially" support IE11 for this project, I'm using fallbacks by first setting the element directly to a hex code and then overriding that with the variable. The override will be ignored by any browser that doesn't support CSS variables.

```css
/* layout.css */
:root {
  --color-bg: #f0f0f0;
  --color-text: #994cc3;
  --color-primary: #ef5350;
  --color-secondary: #0c969b;
  --color-header-bg: rgba(255, 255, 255, 0.9);
  --color-neon-fill: #ef5350;
  --color-neon-glow: none;
}

body {
  background: #f0f0f0; /* fallback */
  background: var(--color-bg);
  color: #994cc3;
  color: var(--color-text);
  transition:
    background 0.8s,
    color 0.8s;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: #ef5350; /* fallback */
  color: var(--color-primary);
}

a {
  color: #0c969b; /* fallback */
  color: var(--color-secondary);
}
```

## The JavaScript

With the variables set globally in the CSS, new values can be assigned as needed using JavaScript. I started by creating two color theme objects -- lightTheme & darkTheme -- inside my main layout.js component.

```jsx
// layout.js
import './layout.css';

const lightTheme = {
  '--color-text': '#994cc3',
  '--color-bg': '#f0f0f0',
  '--color-primary': '#EF5350',
  '--color-secondary': '#0c969b',
  '--color-header-bg': 'rgba(255, 255, 255, 0.9)',
  '--color-neon-fill': '#ef5350',
  '--color-neon-glow': 'rgba(255, 255, 255, 0)',
};
const darkTheme = {
  '--color-text': '#82AAFF',
  '--color-bg': '#011627',
  '--color-primary': '#c792ea',
  '--color-secondary': '#7fdbca',
  '--color-header-bg': 'rgba(1, 10, 18, 0.9)',
  '--color-neon-fill': '#FFFEFC',
  '--color-neon-glow': '#d99fff',
};
```

Up first, inside the component, there are 2 useState hooks. One to set the mode and one to toggle the switch.

Next, a useEffect hook loops over the values in the chosen mode object and assigns the correct colors to the corresponding CSS variables. The 2nd argument tells React to only re-render if currentMode changes.

A second useEffect checks localStorage upon page load for a 'mode' item set to 'dark'. If this item is found it toggles to dark mode. For this hook the 2nd argument is an empty array, which means the effect will be run only once on the initial load of the page (similar to how ComponentDidMount works in class components).

The toggleTheme function updates the checked status to the opposite of what it is currently set to and switches the mode from 'dark' to 'light' or 'light' to 'dark'. It also sets the 'mode' item inside localStorage to the new mode.

```jsx
// layout.js
import React, { useState, useEffect } from 'react';

// ...

export default function Layout({ children }) {
const [currentMode, setCurrentMode] = useState('light');
const [isChecked, setIsChecked] = useState(false);

useEffect(() => {
  if (localStorage.getItem('mode') === 'dark') {
    setCurrentMode('dark');
    setIsChecked(true);
  }
}, []);

useEffect(() => {
  const theme = currentMode === 'light' ? lightTheme : darkTheme;
  Object.keys(theme).forEach(key => {
    const value = theme[key];
    document.documentElement.style.setProperty(key, value);
  });
}, [currentMode]);


const toggleTheme = () => {
  const newMode = currentMode === 'light' ? 'dark' : 'light';
  setIsChecked(!isChecked);
  setCurrentMode(newMode);
  localStorage.setItem('mode', newMode);
};

```

Because the ToggleSwitch component is located inside of the Header component, the toggleTheme and isChecked functions need to be passed into the Header and then into the ToggleSwitch.

```jsx
//layout.js
import Header from './header';

// ...

return (
  <div className="site">
    <Header toggleTheme={toggleTheme} isChecked={isChecked} />
    <main>{children}</main>
  </div>
);
```

```jsx
// header.js
import ToggleSwitch from './ToggleSwitch';

// ...

<ToggleSwitch
  toggleTheme={toggleTheme}
  isChecked={isChecked}
  id="mode"
  ariaLabel="dark mode toggle"
/>;
```

> A toggle is just a checkbox with some CSS magic applied to it. 🧙‍♂️

The jsx for the component consists of a div (Toggle), an input with type="checkbox", and a span (Slider). On the checkbox input, toggleTheme is assigned to onChange and isChecked is assigned to checked.

```jsx
import React from 'react';
import styled from '@emotion/styled';

export default function ToggleSwitch({ toggleTheme, isChecked, ariaLabel, id }) {
  return (
    <Toggle>
      <Input
        type="checkbox"
        onChange={toggleTheme}
        checked={isChecked}
        id={id}
        aria-label={ariaLabel}
      />
      <Slider />
    </Toggle>
  );
}
```

## Styling the Toggle Switch

As you can see I'm using CSS-in-JS 🙀 via the @emotion/styled library. If you are familiar with styled-components, it works almost exactly the same but the package is slightly smaller and apparently more performant (I haven't actually tested it, so what do I know?). Emotion also gives you the option of using css props to style components, which can be useful in certain situations.

To use styled-components, you simple rename your HTML tags to whatever makes sense semantically, and then define which native HTML elements your new tags should use with the CSS for each element inside back-ticks. The API supports nesting similar to SCSS, and the styles are **SCOPED TO THE COMPONENT!**

Personally, I love how semantic and simple this makes my JSX markup. No more jamming 14 different classnames onto every element ala Bootstrap or writing disgusting classnames like "header\_\_toggle-switch--dark-mode" ala BEM.

```jsx
const Toggle = styled.div`
  position: relative;
  &:after {
    content: '☀️';
    font-size: 18px;
    position: absolute;
    top: 7px;
    left: 37px;
  }
  &:before {
    content: '🌙';
    font-size: 18px;
    position: absolute;
    top: 7px;
    left: 6px;
    z-index: 1;
  }
`;
const Input = styled.input`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 5;
  opacity: 0;
  cursor: pointer;
  &:hover + span:after {
    box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.2);
  }
  &:checked + span {
    background: #4a5b90;
    &:after {
      transform: translate3d(32px, 0, 0);
    }
  }
`;
const Slider = styled.span`
  position: relative;
  display: block;
  height: 32px;
  width: 64px;
  border-radius: 32px;
  transition: 0.25s ease-in-out;
  background: #3a9df8;
  box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.15);
  &:after {
    content: '';
    position: absolute;
    border-radius: 100%;
    top: 0;
    left: 0;
    z-index: 2;
    background: #fff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    transition: 0.25s ease-in-out;
    width: 32px;
    height: 32px;
  }
`;
```

The CSS variable can then be assigned to any element and the colors will change upon clicking the toggle switch.

The variables can be assigned globally...

```css
/* layout.css */
body {
  margin: 0;
  line-height: 1;
  background: #f0f0f0;
  background: var(--color-bg);
  color: #994cc3;
  color: var(--color-text);
  transition:
    background 0.8s,
    color 0.8s;
}
```

and inside components using CSS-in-JS.

```jsx
// header.js
const MenuButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  .hamburger {
    fill: #994cc3;
    fill: var(--color-text);
    transition: fill 0.5s;
    height: 40px;
  }
  @media screen and (min-width: ${bpMed}) {
    display: none;
  }
`;
```

Thanks for reading! I hope you found this informative.

Next up, I will be documenting how I created the flickering Neon SVG animation.
