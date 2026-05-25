    let savedAnswers = []; // Kullanici cevap hafizasi

    function startGame() {
      document.getElementById('start-screen').style.display = 'none';
      document.getElementById('game-screen').style.display = 'block';
      qi = 0; score = 0; okN = 0; badN = 0; empN = 0;
      ansHistory = new Array(QS.length).fill(0);
      savedAnswers = new Array(QS.length).fill(null);
      recalcScore();
      render();
    }

    function recalcScore() {
      score = 0; okN = 0; badN = 0; empN = 0;
      for (let i = 0; i < QS.length; i++) {
        if (ansHistory[i] === 1) { okN++; score += 10; }
        else if (ansHistory[i] === -1) { badN++; }
        else if (ansHistory[i] === 2) { empN++; }
      }
      document.getElementById('scorenum').textContent = score;
    }

    function restartGame() {
      document.getElementById('results-screen').style.display = 'none';
      document.getElementById('start-screen').style.display = 'block';
    }

    /* ── RENDER ── */
    function render() {
      answered = false; tfSt = {}; dragSt = {};
      const q = QS[qi];
      document.getElementById('qctr').textContent = 'Soru ' + (qi + 1) + '/' + QS.length;
      document.getElementById('pfill').style.width = ((qi / QS.length) * 100) + '%';

      const area = document.getElementById('qarea');
      const tn = { mc: 'Çoktan Seçmeli', fill: 'Kod Tamamla', drag: 'Eşleştir', tf: 'Doğru / Yanlış' };
      const tc = { mc: 'bmc', fill: 'bfil', drag: 'bdrg', tf: 'btf' };
      const L = ['A', 'B', 'C', 'D'];

      let h = '<div class="card">';
      h += '<div class="qmeta">';
      h += '<span class="badge ' + tc[q.type] + '">' + tn[q.type] + '</span>';
      h += '<span class="badge btopic">' + q.topic + '</span>';
      h += '<span class="qnum">' + (qi + 1) + ' / ' + QS.length + '</span>';
      h += '</div>';
      h += '<div class="qt">' + q.q + '</div>';

      if (q.code) h += '<pre class="cb">' + hl(q.code) + '</pre>';

      if (q.type === 'mc') {
        h += '<div class="opts">';
        q.opts.forEach(function (o, i) {
          h += '<div class="opt" data-i="' + i + '" onclick="pickMC(' + i + ')">';
          h += '<span class="okey">' + L[i] + '</span>';
          h += '<span class="otxt' + (o.m ? ' mono' : '') + '">' + esc(o.t).replace(/\n/g, '<br>') + '</span>';
          h += '</div>';
        });
        h += '</div>';
      }

      if (q.type === 'tf') {
        q.stmts.forEach(function (s, i) {
          h += '<div class="tf-row">';
          h += '<div class="tf-stmt">' + s.t + '</div>';
          h += '<div class="tf-btns">';
          h += '<button class="tfb" data-si="' + i + '" data-val="true" onclick="pickTF(' + i + ',true)">✅ Doğru</button>';
          h += '<button class="tfb" data-si="' + i + '" data-val="false" onclick="pickTF(' + i + ',false)">❌ Yanlış</button>';
          h += '</div></div>';
          tfSt[i] = null;
        });
      }

      if (q.type === 'fill') {
        h += '<div class="hint">💡 İpucu: ' + q.hint + '</div>';
        h += '<div class="fill-wrap">';
        h += '<code>' + esc(q.before) + '</code>';
        h += '<input id="blank" type="text" placeholder="?" autocomplete="off" spellcheck="false">';
        h += '<code>' + esc(q.after) + '</code>';
        h += '</div>';
      }

      if (q.type === 'drag') {
        h += '<div class="hint" style="border-left-color: var(--purple);">💡 İpucu: Sol taraftaki ifadeleri farenizle basılı tutarak sürükleyip, sağ taraftaki uygun boşluklara bırakın.</div>';
        const shuf = q.items.slice().sort(function () { return Math.random() - 0.5; });
        h += '<div class="dragboard">';
        h += '<div class="dragleft"><div class="dtitle">İfadeler / Metotlar</div><div class="poolbox" id="pool">';
        shuf.forEach(function (v) {
          const ev = v.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
          h += '<div class="ditem" draggable="true" data-val="' + ev + '">' + esc(v) + '</div>';
        });
        h += '</div></div>';
        h += '<div class="dragright"><div class="dtitle">Açıklama / Tip</div><div class="dropcol">';
        q.zones.forEach(function (z) {
          const zid = 'dz_' + z.lbl.replace(/[^a-z0-9]/gi, '_');
          dragSt[z.lbl] = null;
          const evlbl = z.lbl.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
          h += '<div class="droprow">';
          h += '<span class="dlbl">' + esc(z.lbl) + '</span>';
          h += '<div class="dzone" id="' + zid + '" data-zone="' + evlbl + '"></div>';
          h += '</div>';
        });
        h += '</div></div></div>';
      }

      h += '<div class="fb" id="fb"></div>';
      h += '<div class="actions">';
      if (qi > 0) {
        h += '<button class="btn btnb" onclick="prevQ()">← Geri</button>';
      }
      h += '<button class="btn btnb" style="flex: 1; border-color: var(--yellow); color: var(--yellow);" onclick="skipQ()">Boş Bırak</button>';
      h += '<button class="btn btng" style="flex: 2" id="chk" onclick="checkAns()">Kontrol Et ✓</button>';
      if (ansHistory[qi] !== 0) {
        h += '<button class="btn btnb" id="btn-next-gray" onclick="nextQ()">İleri →</button>';
      }
      h += '</div>';
      h += '</div>'; // .card

      area.innerHTML = h;

      if (q.type === 'fill') {
        document.getElementById('blank').addEventListener('keydown', function (e) {
          if (e.key === 'Enter') checkAns();
        });
      }

      if (q.type === 'drag') initDrag();

      // Hafızadan cevapları geri yükle
      if (savedAnswers[qi] !== null) {
        let ans = savedAnswers[qi];
        if (q.type === 'mc' && ans !== null) {
          setTimeout(function () { pickMC(ans); }, 0);
        } else if (q.type === 'tf') {
          setTimeout(function () {
            Object.keys(ans).forEach(function (k) {
              if (ans[k] !== null) pickTF(k, ans[k]);
            });
          }, 0);
        } else if (q.type === 'fill' && ans !== null) {
          setTimeout(function () { document.getElementById('blank').value = ans; }, 0);
        } else if (q.type === 'drag') {
          setTimeout(function () {
            Object.keys(ans).forEach(function (k) {
              if (ans[k] !== null) {
                let items = document.querySelectorAll('.ditem');
                let el = null;
                for (let i = 0; i < items.length; i++) {
                  if (items[i].dataset.val === ans[k]) { el = items[i]; break; }
                }
                let zn = document.getElementById('dz_' + k.replace(/[^a-z0-9]/gi, '_'));
                if (el && zn) { zn.appendChild(el); dragSt[k] = ans[k]; }
              }
            });
          }, 0);
        }
      }
    }

    /* ── PICK ── */
    function pickMC(i) {
      if (answered) return;
      document.querySelectorAll('.opt[data-i]').forEach(function (el) { el.classList.remove('sel'); });
      document.querySelector('.opt[data-i="' + i + '"]').classList.add('sel');
    }

    function pickTF(si, val) {
      if (answered) return;
      document.querySelectorAll('.tfb[data-si="' + si + '"]').forEach(function (e) { e.classList.remove('sel'); });
      document.querySelectorAll('.tfb[data-si="' + si + '"][data-val="' + val + '"]').forEach(function (e) { e.classList.add('sel'); });
      tfSt[si] = val;
    }

    /* ── DRAG INIT ── */
    function initDrag() {
      let dragged = null;
      document.querySelectorAll('.ditem').forEach(function (item) {
        item.addEventListener('dragstart', function () {
          dragged = item;
          setTimeout(function () { item.classList.add('dragging'); }, 0);
        });
        item.addEventListener('dragend', function () { item.classList.remove('dragging'); });
      });
      document.querySelectorAll('.dzone').forEach(function (zone) {
        zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('over'); });
        zone.addEventListener('dragleave', function () { zone.classList.remove('over'); });
        zone.addEventListener('drop', function (e) {
          e.preventDefault();
          zone.classList.remove('over');
          const zn = zone.dataset.zone;
          if (zone.children.length > 0) {
            document.getElementById('pool').appendChild(zone.firstChild);
            dragSt[zn] = null;
          }
          zone.appendChild(dragged);
          dragSt[zn] = dragged.dataset.val;
        });
      });
    }

    /* ── SAVE STATE ── */
    function saveCurrentState() {
      const q = QS[qi];
      let currentAnswer = null;
      if (q.type === 'mc') {
        const sel = document.querySelector('.opt[data-i].sel');
        if (sel) currentAnswer = parseInt(sel.dataset.i);
      } else if (q.type === 'tf') {
        currentAnswer = { ...tfSt };
      } else if (q.type === 'fill') {
        const inp = document.getElementById('blank');
        if (inp) currentAnswer = inp.value;
      } else if (q.type === 'drag') {
        currentAnswer = { ...dragSt };
      }
      savedAnswers[qi] = currentAnswer;
    }

    /* ── CHECK & SKIP ── */
    function skipQ() {
      if (answered) { nextQ(); return; }
      saveCurrentState();
      answered = true;
      ansHistory[qi] = 2; // 2 means skipped
      recalcScore();

      const fb = document.getElementById('fb');
      fb.className = 'fb show';
      fb.style.background = '#1a1a0f';
      fb.style.borderColor = 'var(--yellow)';
      fb.innerHTML = '<div class="fbh" style="color: var(--yellow);">⏸ Boş Bırakıldı</div><div class="fbb">' + QS[qi].exp + '</div>';

      const chk = document.getElementById('chk');
      chk.textContent = qi < QS.length - 1 ? 'Sonraki Soru →' : 'Sonuçları Gör 🏆';
      const greyBtn = document.getElementById('btn-next-gray');
      if (greyBtn) greyBtn.style.display = 'none';
    }

    function checkAns() {
      if (answered) { nextQ(); return; }
      saveCurrentState();
      const q = QS[qi];
      let ok = false;

      if (q.type === 'mc') {
        const sel = document.querySelector('.opt[data-i].sel');
        if (!sel) return;
        const idx = parseInt(sel.dataset.i);
        ok = (idx === q.ans);
        document.querySelectorAll('.opt[data-i]').forEach(function (el, i) {
          el.classList.add('lk');
          if (i === q.ans) el.classList.add('ok');
          else if (el.classList.contains('sel')) el.classList.add('bad');
        });
      }

      if (q.type === 'tf') {
        const vals = Object.values(tfSt);
        if (vals.some(function (v) { return v === null; })) return;
        let allOk = true;
        q.stmts.forEach(function (s, i) {
          const given = (tfSt[i] === true || tfSt[i] === 'true');
          const correct = s.ans;
          const rowOk = (given === correct);
          if (!rowOk) allOk = false;
          document.querySelectorAll('.tfb[data-si="' + i + '"]').forEach(function (el) {
            el.classList.add('lk');
            const elVal = (el.dataset.val === 'true');
            if (elVal === correct) el.classList.add('ok');
            else if (el.classList.contains('sel')) el.classList.add('bad');
          });
        });
        ok = allOk;
      }

      if (q.type === 'fill') {
        const inp = document.getElementById('blank');
        const given = inp.value.trim();
        ok = (given === q.ans);
        inp.classList.add(ok ? 'ok' : 'bad');
        inp.disabled = true;
      }

      if (q.type === 'drag') {
        let allOk = true;
        q.zones.forEach(function (z) {
          const placed = dragSt[z.lbl];
          const rowOk = (placed === z.ans);
          if (!rowOk) allOk = false;
          const zid = 'dz_' + z.lbl.replace(/[^a-z0-9]/gi, '_');
          const zone = document.getElementById(zid);
          if (zone) zone.classList.add(rowOk ? 'ok' : 'bad');
        });
        // check all zones have something
        const allFilled = q.zones.every(function (z) { return dragSt[z.lbl] !== null; });
        if (!allFilled) return;
        ok = allOk;
      }

      answered = true;
      ansHistory[qi] = ok ? 1 : -1;
      recalcScore();

      const fb = document.getElementById('fb');
      fb.style.background = '';
      fb.style.borderColor = '';
      fb.className = 'fb show ' + (ok ? 'fbok' : 'fbbad');
      fb.innerHTML = '<div class="fbh">' + (ok ? '✅ Doğru!' : '❌ Yanlış') + '</div><div class="fbb">' + q.exp + '</div>';

      const chk = document.getElementById('chk');
      chk.textContent = qi < QS.length - 1 ? 'Sonraki Soru →' : 'Sonuçları Gör 🏆';
      const greyBtn = document.getElementById('btn-next-gray');
      if (greyBtn) greyBtn.style.display = 'none';
    }

    /* ── NEXT & PREV ── */
    function nextQ() {
      if (!answered) saveCurrentState();
      qi++;
      if (qi >= QS.length) { showResults(); return; }
      render();
    }

    function prevQ() {
      if (qi > 0) {
        if (!answered) saveCurrentState();
        qi--;
        render();
      }
    }

    /* ── RESULTS ── */
    function showResults() {
      document.getElementById('game-screen').style.display = 'none';
      document.getElementById('results-screen').style.display = 'block';
      document.getElementById('pfill').style.width = '100%';
      const totalAnswered = okN + badN + empN;
      const pct = Math.round((okN / QS.length) * 100);
      document.getElementById('rpts').textContent = score;
      document.querySelector('.rof').textContent = '/ ' + (QS.length * 10) + ' PUAN';
      document.getElementById('rok').textContent = okN;
      document.getElementById('rbad').textContent = badN;
      document.getElementById('remp').textContent = empN;
      document.getElementById('rpct').textContent = pct + '%';
      const titles = [
        [90, '🏆 Mükemmel! Python ustasısın!'],
        [70, '⭐ Harika! Konuya hakimsin.'],
        [50, '💪 İyi iş! Biraz daha pratik yapman yeterli.'],
        [0, '📚 Notlara bir daha bak, başarabilirsin!']
      ];
      const t = titles.find(function (x) { return pct >= x[0]; });
      document.getElementById('rttl').textContent = t[1];
      document.getElementById('rsub').textContent = okN + ' doğru · ' + badN + ' yanlış · ' + empN + ' boş · ' + pct + '% başarı';
    }

    /* ── HELPERS ── */
    function esc(t) {
      return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function hl(raw) {
      const KWS = new Set(['True', 'False', 'None', 'if', 'else', 'elif', 'for', 'in', 'while', 'not', 'and', 'or', 'def', 'return', 'import', 'from', 'class', 'lambda', 'with', 'as', 'pass', 'break', 'continue']);
      const FNS = new Set(['print', 'len', 'type', 'int', 'float', 'str', 'list', 'dict', 'set', 'tuple', 'range', 'append', 'get', 'keys', 'values', 'items', 'pop', 'remove', 'copy', 'sort', 'reverse', 'extend', 'clear', 'add', 'update', 'count', 'index', 'input']);
      let out = '', i = 0, src = raw;
      while (i < src.length) {
        if (src[i] === '#') {
          let j = i; while (j < src.length && src[j] !== '\n') j++;
          out += '<span class="cm">' + esc(src.slice(i, j)) + '</span>'; i = j; continue;
        }
        if (src[i] === '"') {
          let j = i + 1; while (j < src.length && src[j] !== '"') j++;
          out += '<span class="st">' + esc(src.slice(i, j + 1)) + '</span>'; i = j + 1; continue;
        }
        if (src[i] === "'") {
          let j = i + 1; while (j < src.length && src[j] !== "'") j++;
          out += '<span class="st">' + esc(src.slice(i, j + 1)) + '</span>'; i = j + 1; continue;
        }
        if (src[i] >= '0' && src[i] <= '9') {
          let j = i; while (j < src.length && (src[j] >= '0' && src[j] <= '9' || src[j] === '.')) j++;
          out += '<span class="nm">' + esc(src.slice(i, j)) + '</span>'; i = j; continue;
        }
        if (/[a-zA-Z_]/.test(src[i])) {
          let j = i; while (j < src.length && /[a-zA-Z0-9_]/.test(src[j])) j++;
          const word = src.slice(i, j);
          if (KWS.has(word)) out += '<span class="kw">' + esc(word) + '</span>';
          else if (src[j] === '(' && FNS.has(word)) out += '<span class="fn">' + esc(word) + '</span>';
          else out += esc(word);
          i = j; continue;
        }
        out += esc(src[i]); i++;
      }
      return out;
    }