---
description: Conditionally add or remove elements using switch.bind
---

# switch.bind

In Javascript we have the ability to use `switch/case` statements which act as neater `if` statements. We can use `switch.bind` to achieve the same thing within our templates.

```markup
<p switch.bind="selectedAction">
  <span case="mask">You are more protected from aerosol particles, and others are protected from you.</span>
  <span case="sanitizer">You are making sure viruses won't be spreaded easily.</span>
  <span case="wash">You are helping eliminate the virus.</span>
  <span case="all">You are protecting yourself and people around you. You rock!</span>
  <span default-case>Unknown.</span>
</p>
```

The `switch.bind` controller will watch the bound value, which in our case is `selectedAction` and when it changes, match it against our case values. It is important to note that this will add and remove elements from the DOM like the `if.bind` does.

