export function getVisibleText(au, host) {
  const context = { text: host.textContent };
  $getVisibleText(au.root(), context);
  return context.text;
}

function $getVisibleText(root, context) {
  let current = root.$attachableHead;
  while (current) {
    if (current.$projector && current.$projector.shadowRoot) {
      context.text += current.$projector.shadowRoot.textContent;
      $getVisibleText(current, context);
    } else if (current.currentView) { // replaceable, with
      $getVisibleText(current.currentView, context);
    } else if (current.coordinator && current.coordinator.currentView) { // if, else, au-compose
      $getVisibleText(current.coordinator.currentView, context);
    } else if (current.views) { // repeat
      for (const view of current.views) {
        $getVisibleText(view, context);
      }
    }
    current = current.$nextAttach;
  }
}
