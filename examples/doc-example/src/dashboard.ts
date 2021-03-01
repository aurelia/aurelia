import { customElement } from "@aurelia/runtime-html";

@customElement({
  name: 'dashboard',
  template: `
<code>
  bookmarks = [{
          url: "https://google.co.nz",
          alias: "Google"
  }]
</code>

<p>With Target (href.bind="bookmark.url")</p>
<a repeat.for="bookmark of bookmarks" href.bind="bookmark.url" target=_"blank">\${bookmark.alias}</a>

<p>Without Target (href.bind="bookmark.url")</p>
<a repeat.for="bookmark of bookmarks" href.bind="bookmark.url" external>\${bookmark.alias}</a>

<p>Without Target (href="...")</p>
<a repeat.for="bookmark of bookmarks" href="\${bookmark.url}" external>\${bookmark.alias}</a>

<p>With Target (href="...")</p>
<a repeat.for="bookmark of bookmarks" href="\${bookmark.url}" target="_blank">\${bookmark.alias}</a>
`,
})
export class Dashboard {
  public bookmarks = [{
      url: "https://google.co.nz",
      alias: "Google"
    }]
}
