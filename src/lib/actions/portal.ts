/** Svelte action: port a node to <body> so position:fixed is viewport-relative. */
export function portal(node: HTMLElement) {
  document.body.appendChild(node);

  return {
    destroy() {
      node.remove();
    },
  };
}
