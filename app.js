const enterpriseEndpoints = [
  {
    method: "GET",
    path: "/enterprise/status",
    operationId: "enterpriseGetStatus",
    description:
      "Returns your enterprise balance in TON and the dedicated on-chain wallet address used for top-ups.",
    request: {
      headers: [{ name: "X-Enterprise-Auth", required: true, example: "<token>" }],
    },
    response: {
      "200": {
        properties: ["balance (string)", "wallet (string)"],
      },
    },
  },
  {
    method: "GET",
    path: "/enterprise/wallets/{wallet_id}/config",
    operationId: "enterpriseGetWalletConfig",
    description:
      "Returns wallet-specific configuration, including an excess address to use as response_destination for jetton transfers to reduce effective fees.",
    request: {
      headers: [{ name: "X-Enterprise-Auth", required: true, example: "<token>" }],
      pathParams: [{ name: "wallet_id", required: true, example: "0:..." }],
    },
    response: {
      "200": {
        properties: ["excess_account (string)"],
      },
    },
  },
  {
    method: "POST",
    path: "/enterprise/wallets/{wallet_id}/estimate",
    operationId: "enterpriseEstimate",
    description:
      "Estimates upfront TON that will be reserved to pay network fees for the provided external message BOC. Optionally returns an emulation result.",
    request: {
      headers: [
        { name: "X-Enterprise-Auth", required: true, example: "<token>" },
        { name: "Accept-Language", required: false, example: "en" },
      ],
      pathParams: [{ name: "wallet_id", required: true, example: "0:..." }],
      query: [{ name: "emulate", required: false, example: "false" }],
      body: {
        contentType: "application/json",
        example: {
          boc: "te6ccgECBQEAARUAAkWIAWTtae+KgtbrX26Bep8JSq8lFLfGOoyGR/xwdjfvpvEaHg",
          wallet_public_key: "<hex ed25519 public key>",
        },
      },
    },
    response: {
      "200": {
        properties: ["estimated_upfront_payment (string)", "emulation? (string)"],
      },
    },
  },
  {
    method: "POST",
    path: "/enterprise/wallets/{wallet_id}/send",
    operationId: "enterpriseSend",
    description:
      "Sends the signed external message. Battery pays network fees and returns msg_id for tracking. The same payload as estimate is expected.",
    request: {
      headers: [{ name: "X-Enterprise-Auth", required: true, example: "<token>" }],
      pathParams: [{ name: "wallet_id", required: true, example: "0:..." }],
      body: {
        contentType: "application/json",
        example: {
          boc: "te6ccgECBQEAARUAAkWIAWTtae+KgtbrX26Bep8JSq8lFLfGOoyGR/xwdjfvpvEaHg",
          wallet_public_key: "<hex ed25519 public key>",
        },
      },
    },
    response: {
      "200": {
        properties: ["msg_id (string)", "external? (string)"],
      },
    },
  },
  {
    method: "GET",
    path: "/enterprise/messages/{msg_id}",
    operationId: "enterpriseGetMessage",
    description:
      "Fetches message execution status and final billing info (final_cost) plus on-chain hashes for both the payment and the committed transaction.",
    request: {
      headers: [{ name: "X-Enterprise-Auth", required: true, example: "<token>" }],
      pathParams: [{ name: "msg_id", required: true, example: "<uuid>" }],
    },
    response: {
      "200": {
        properties: [
          "status (pending|completed|failed)",
          "final_cost? (string)",
          "payment_tx_hash? (string)",
          "committed_tx_hash? (string)",
          "failed_reason? (string)",
        ],
      },
    },
  },
];

const $ = (sel, root = document) => root.querySelector(sel);

function methodClass(method) {
  const m = String(method || "").toLowerCase();
  if (m === "get") return "method method--get";
  if (m === "post") return "method method--post";
  if (m === "delete") return "method method--delete";
  if (m === "put") return "method method--put";
  if (m === "patch") return "method method--patch";
  return "method";
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderKvRow(k, vHtml) {
  return `
    <div class="kv__row">
      <div class="kv__k">${escapeHtml(k)}</div>
      <div class="kv__v">${vHtml}</div>
    </div>
  `;
}

function renderEndpoint(ep, idx) {
  const headers = (ep.request?.headers || [])
    .map(
      (h) =>
        `<div><code>${escapeHtml(h.name)}</code>${h.required ? " <b>(required)</b>" : ""}${
          h.example ? ` — <span class="muted">${escapeHtml(h.example)}</span>` : ""
        }</div>`
    )
    .join("");

  const pathParams = (ep.request?.pathParams || [])
    .map(
      (p) =>
        `<div><code>${escapeHtml(p.name)}</code>${p.required ? " <b>(required)</b>" : ""}${
          p.example ? ` — <span class="muted">${escapeHtml(p.example)}</span>` : ""
        }</div>`
    )
    .join("");

  const query = (ep.request?.query || [])
    .map(
      (q) =>
        `<div><code>${escapeHtml(q.name)}</code>${q.required ? " <b>(required)</b>" : ""}${
          q.example ? ` — <span class="muted">${escapeHtml(q.example)}</span>` : ""
        }</div>`
    )
    .join("");

  const body = ep.request?.body
    ? `<div>
        <div><b>Content-Type:</b> <code>${escapeHtml(ep.request.body.contentType)}</code></div>
        <div style="margin-top:8px;">
          <pre style="margin:0; white-space:pre-wrap; overflow:auto; padding:12px; border-radius:14px; background: rgba(15,23,42,0.04); border: 1px solid rgba(15,23,42,0.06); font-family: var(--mono); font-size: 12px;">${escapeHtml(
            JSON.stringify(ep.request.body.example, null, 2)
          )}</pre>
        </div>
      </div>`
    : "";

  const resp200 = ep.response?.["200"]?.properties?.length
    ? `<div>${ep.response["200"].properties.map((p) => `<div><code>${escapeHtml(p)}</code></div>`).join("")}</div>`
    : "<div><span class='muted'>—</span></div>";

  const details = [
    renderKvRow("operationId", `<code>${escapeHtml(ep.operationId)}</code>`),
    renderKvRow("headers", headers || "<span class='muted'>—</span>"),
    ep.request?.pathParams?.length ? renderKvRow("path params", pathParams) : "",
    ep.request?.query?.length ? renderKvRow("query", query) : "",
    ep.request?.body ? renderKvRow("body", body) : "",
    renderKvRow("200 response", resp200),
  ]
    .filter(Boolean)
    .join("");

  return `
    <div class="endpoint" data-index="${idx}" data-open="false">
      <button class="endpoint__summary" type="button" aria-expanded="false">
        <span class="${methodClass(ep.method)}">${escapeHtml(ep.method)}</span>
        <span class="path">${escapeHtml(ep.path)}</span>
        <span class="endpoint__op">${escapeHtml(ep.operationId)}</span>
      </button>
      <div class="endpoint__details">
        <p class="endpoint__desc">${escapeHtml(ep.description)}</p>
        <div class="kv">
          ${details}
        </div>
      </div>
    </div>
  `;
}

function renderList(list, query) {
  const q = String(query || "").trim().toLowerCase();
  const filtered = q
    ? list.filter((ep) => {
        const hay = `${ep.method} ${ep.path} ${ep.operationId} ${ep.description}`.toLowerCase();
        return hay.includes(q);
      })
    : list;

  const root = $("#apiList");
  root.innerHTML = filtered.length
    ? filtered.map(renderEndpoint).join("")
    : `<div class="card"><div class="card__title">No matches</div><div class="card__note">Try a different search query.</div></div>`;

  root.querySelectorAll(".endpoint__summary").forEach((btn) => {
    btn.addEventListener("click", () => {
      const endpoint = btn.closest(".endpoint");
      const isOpen = endpoint.getAttribute("data-open") === "true";
      endpoint.setAttribute("data-open", isOpen ? "false" : "true");
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  });
}

function setAll(open) {
  $("#apiList")
    .querySelectorAll(".endpoint")
    .forEach((ep) => {
      ep.setAttribute("data-open", open ? "true" : "false");
      const btn = ep.querySelector(".endpoint__summary");
      if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
}

function init() {
  const search = $("#apiSearch");
  renderList(enterpriseEndpoints, "");

  search.addEventListener("input", () => {
    renderList(enterpriseEndpoints, search.value);
  });

  $("#expandAll").addEventListener("click", () => setAll(true));
  $("#collapseAll").addEventListener("click", () => setAll(false));
}

init();

