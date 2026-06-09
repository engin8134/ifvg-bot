const trades = [];

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    const body = req.body || {};
    const msg = body.message || body.text || JSON.stringify(body);
    const ticker = body.ticker || "UNKNOWN";
    const interval = body.interval || "?";
    const price = parseFloat(body.close) || 0;
    const now = new Date().toISOString();

    let direction = "UNKNOWN";
    if (msg.includes("Bullish")) direction = "LONG";
    else if (msg.includes("Bearish")) direction = "SHORT";

    const trade = {
      id: trades.length + 1,
      time: now,
      ticker,
      interval,
      direction,
      entryPrice: price,
      message: msg,
      status: "OPEN",
      result: null,
    };

    trades.push(trade);
    return res.status(200).json({ ok: true, trade });
  }

  if (req.method === "GET") {
    const wins = trades.filter((t) => t.result === "WIN").length;
    const losses = trades.filter((t) => t.result === "LOSS").length;
    const total = trades.length;
    const wr = total > 0 ? ((wins / total) * 100).toFixed(1) : "0.0";

    const rows = trades.slice().reverse().map((t) => `
      <tr>
        <td>${t.id}</td>
        <td>${t.time.replace("T"," ").substring(0,19)}</td>
        <td>${t.ticker}</td>
        <td>${t.interval}</td>
        <td style="color:${t.direction==="LONG"?"#1D9E75":"#D85A30"};font-weight:600">${t.direction}</td>
        <td>${t.entryPrice > 0 ? t.entryPrice : "-"}</td>
        <td style="color:${t.status==="OPEN"?"#BA7517":t.result==="WIN"?"#1D9E75":"#D85A30"}">${t.status==="OPEN"?"AÇIK":t.result}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8">
<title>IFVG Bot</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d0d0d;color:#e0e0e0;font-family:'Segoe UI',sans-serif;padding:24px}
h1{font-size:22px;color:#85B7EB;margin-bottom:4px}
.sub{font-size:13px;color:#666;margin-bottom:24px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.stat{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:16px;text-align:center}
.stat-val{font-size:28px;font-weight:600}
.stat-label{font-size:12px;color:#666;margin-top:4px}
.green{color:#1D9E75}.red{color:#D85A30}.blue{color:#378ADD}
table{width:100%;border-collapse:collapse;background:#1a1a1a;border-radius:8px;overflow:hidden}
th{background:#111;padding:12px 16px;text-align:left;font-size:12px;color:#666;border-bottom:1px solid #2a2a2a}
td{padding:10px 16px;font-size:13px;border-bottom:1px solid #1f1f1f}
tr:hover td{background:#1f1f1f}
.empty{text-align:center;padding:48px;color:#444;font-size:14px}
button{background:#185FA5;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;margin-bottom:16px}
</style></head>
<body>
<h1>⚡ IFVG Bot — Trade Log</h1>
<p class="sub">Tlosx OrderFlow Confluence Engine · Paper Trading</p>
<div class="stats">
  <div class="stat"><div class="stat-val blue">${total}</div><div class="stat-label">Toplam</div></div>
  <div class="stat"><div class="stat-val green">${wins}</div><div class="stat-label">Win</div></div>
  <div class="stat"><div class="stat-val red">${losses}</div><div class="stat-label">Loss</div></div>
  <div class="stat"><div class="stat-val ${parseFloat(wr)>=50?"green":"red"}">${wr}%</div><div class="stat-label">Win Rate</div></div>
</div>
<button onclick="location.reload()">↻ Yenile</button>
<table><thead><tr><th>#</th><th>Zaman</th><th>Ticker</th><th>TF</th><th>Yön</th><th>Giriş</th><th>Sonuç</th></tr></thead>
<tbody>${rows||'<tr><td colspan="7" class="empty">Henüz sinyal gelmedi...</td></tr>'}</tbody>
</table></body></html>`;

    return res.setHeader("Content-Type","text/html").status(200).send(html);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
