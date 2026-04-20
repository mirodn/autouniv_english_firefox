(() => {
  const OVERLAY_ID = "autouniv-player-overlay";

  function createOverlay(src) {
    removeOverlay();

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.style.cssText = [
      "position:fixed",
      "top:0",
      "left:0",
      "width:100%",
      "height:100%",
      "background:rgba(0,0,0,0.85)",
      "z-index:999999",
      "display:flex",
      "align-items:center",
      "justify-content:center",
    ].join(";");

    const wrapper = document.createElement("div");
    wrapper.style.cssText = [
      "position:relative",
      "width:854px",
      "max-width:95vw",
      "background:#000",
      "border-radius:8px",
      "overflow:hidden",
    ].join(";");

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.style.cssText = [
      "position:absolute",
      "top:8px",
      "right:8px",
      "z-index:1",
      "background:rgba(0,0,0,0.6)",
      "color:#fff",
      "border:none",
      "border-radius:50%",
      "width:32px",
      "height:32px",
      "cursor:pointer",
      "font-size:16px",
      "line-height:32px",
      "text-align:center",
      "padding:0",
    ].join(";");
    closeBtn.onclick = removeOverlay;

    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.style.cssText = [
      "width:854px",
      "max-width:95vw",
      "height:480px",
      "border:none",
      "display:block",
    ].join(";");
    iframe.allow = "autoplay; fullscreen";
    iframe.setAttribute("allowfullscreen", "");

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) removeOverlay();
    });

    wrapper.appendChild(closeBtn);
    wrapper.appendChild(iframe);
    overlay.appendChild(wrapper);
    document.body.appendChild(overlay);
  }

  function removeOverlay() {
    const el = document.getElementById(OVERLAY_ID);
    if (el) el.remove();
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "PLAY_VIDEO") {
      createOverlay(message.src);
    } else if (message.type === "STOP_VIDEO") {
      removeOverlay();
    }
  });
})();
