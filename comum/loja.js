/* Loja da prévia Suunto: ficha do produto, carrinho e fechamento pelo WhatsApp.
   Sem pagamento de verdade: o pedido sai como mensagem para o WhatsApp da loja. */
(function () {
  var WHATS = '5537998057484';
  var CHAVE = 'suunto-previa-carrinho';
  var lista = window.SUUNTO_CATALOGO || [];
  var porId = {};
  lista.forEach(function (p) { porId[p.id] = p; });

  function img(u, w) { return u + '?width=' + (w || 800); }
  function brl(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function precoTexto(p) { return p.preco ? brl(p.preco) : 'Preço sob consulta'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var itens = [];
  try { itens = JSON.parse(localStorage.getItem(CHAVE) || '[]').filter(function (i) { return porId[i.id]; }); } catch (e) { itens = []; }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(itens)); } catch (e) {} contar(); }
  function contar() {
    var n = itens.reduce(function (a, i) { return a + i.q; }, 0);
    document.querySelectorAll('[data-carrinho-n]').forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
  }

  /* ---------- ficha do produto ---------- */
  var ficha = document.createElement('dialog');
  ficha.className = 'lj-ficha';
  ficha.setAttribute('aria-label', 'Produto');
  document.body.appendChild(ficha);

  function abrirFicha(id) {
    var p = porId[id]; if (!p) return;
    var q = 1;
    ficha.innerHTML =
      '<div class="lj-ficha-in">' +
      '<div class="lj-galeria"><div class="lj-foto"><img src="' + img(p.img[0], 1200) + '" alt="' + esc(p.nome) + '" width="1000" height="1000"></div>' +
      (p.img.length > 1 ? '<div class="lj-miniaturas">' + p.img.map(function (u, i) {
        return '<button type="button" aria-label="Foto ' + (i + 1) + ' de ' + esc(p.nome) + '"' + (i === 0 ? ' aria-current="true"' : '') + ' data-src="' + img(u, 1200) + '"><img src="' + img(u, 200) + '" alt="" width="80" height="80" loading="lazy"></button>';
      }).join('') + '</div>' : '') + '</div>' +
      '<div class="lj-info">' +
      '<button type="button" class="lj-fechar" aria-label="Fechar">Fechar</button>' +
      '<p class="lj-cat">' + esc(p.cat) + '</p>' +
      '<h2 class="lj-nome">' + esc(p.nome) + '</h2>' +
      '<p class="lj-preco">' + precoTexto(p) + '</p>' +
      '<p class="lj-txt">Feito sob encomenda para você. Escolha as cores e os acabamentos que mais combinam com o seu espaço e nós ajustamos a peça com o fabricante.</p>' +
      '<ul class="lj-fatos"><li>Sob encomenda</li><li>3 anos de garantia</li><li>Bloco 3D para o seu arquiteto</li></ul>' +
      '<div class="lj-qtd" role="group" aria-label="Quantidade"><button type="button" data-q="-1" aria-label="Menos uma">−</button><output>1</output><button type="button" data-q="1" aria-label="Mais uma">+</button></div>' +
      '<button type="button" class="lj-btn lj-add">' + (p.preco ? 'Adicionar ao carrinho' : 'Adicionar ao orçamento') + '</button>' +
      '<a class="lj-link" target="_blank" rel="noopener" href="https://wa.me/' + WHATS + '?text=' + encodeURIComponent('Olá! Vi a ' + p.nome + ' no site e quero saber mais.') + '">Conversar sobre esta peça no WhatsApp</a>' +
      '</div></div>';
    ficha.querySelector('.lj-fechar').onclick = function () { ficha.close(); };
    ficha.querySelectorAll('.lj-miniaturas button').forEach(function (b) {
      b.onclick = function () {
        ficha.querySelector('.lj-foto img').src = b.dataset.src;
        ficha.querySelectorAll('.lj-miniaturas button').forEach(function (o) { o.removeAttribute('aria-current'); });
        b.setAttribute('aria-current', 'true');
      };
    });
    var out = ficha.querySelector('.lj-qtd output');
    ficha.querySelectorAll('[data-q]').forEach(function (b) {
      b.onclick = function () { q = Math.max(1, q + Number(b.dataset.q)); out.textContent = q; };
    });
    ficha.querySelector('.lj-add').onclick = function () { adicionar(p.id, q); ficha.close(); abrirCarrinho(); };
    ficha.showModal();
  }
  ficha.addEventListener('click', function (e) { if (e.target === ficha) ficha.close(); });

  /* ---------- carrinho ---------- */
  var gaveta = document.createElement('dialog');
  gaveta.className = 'lj-gaveta';
  gaveta.setAttribute('aria-label', 'Carrinho');
  document.body.appendChild(gaveta);
  gaveta.addEventListener('click', function (e) { if (e.target === gaveta) gaveta.close(); });

  function adicionar(id, q) {
    var i = itens.find(function (x) { return x.id === id; });
    if (i) i.q += q; else itens.push({ id: id, q: q });
    salvar();
  }
  function desenharCarrinho() {
    var total = 0, consulta = 0;
    var linhas = itens.map(function (i) {
      var p = porId[i.id];
      if (p.preco) total += p.preco * i.q; else consulta += i.q;
      return '<li class="lj-item"><img src="' + img(p.img[0], 200) + '" alt="" width="72" height="72">' +
        '<div><p class="lj-item-nome">' + esc(p.nome) + '</p><p class="lj-item-preco">' + (p.preco ? brl(p.preco * i.q) : 'Sob consulta') + '</p>' +
        '<div class="lj-qtd lj-qtd-p" role="group" aria-label="Quantidade de ' + esc(p.nome) + '"><button type="button" data-id="' + p.id + '" data-q="-1" aria-label="Menos uma">−</button><output>' + i.q + '</output><button type="button" data-id="' + p.id + '" data-q="1" aria-label="Mais uma">+</button></div></div></li>';
    }).join('');
    gaveta.innerHTML =
      '<div class="lj-gaveta-in"><div class="lj-gaveta-topo"><h2>Seu carrinho</h2><button type="button" class="lj-fechar" aria-label="Fechar carrinho">Fechar</button></div>' +
      (itens.length ? '<ul class="lj-itens">' + linhas + '</ul>' +
        '<div class="lj-resumo"><p><span>Subtotal</span><strong>' + brl(total) + '</strong></p>' +
        (consulta ? '<p class="lj-obs">Mais ' + consulta + (consulta > 1 ? ' peças' : ' peça') + ' com preço sob consulta. Enviamos o valor pelo WhatsApp.</p>' : '') +
        '<p class="lj-obs">Frete e prazo de fabricação combinados na finalização.</p>' +
        '<a class="lj-btn" target="_blank" rel="noopener" href="' + linkPedido(total) + '">Finalizar pedido</a></div>'
        : '<p class="lj-vazio">Seu carrinho está vazio. Escolha uma peça da coleção para começar.</p>') +
      '</div>';
    gaveta.querySelector('.lj-fechar').onclick = function () { gaveta.close(); };
    gaveta.querySelectorAll('[data-q]').forEach(function (b) {
      b.onclick = function () {
        var i = itens.find(function (x) { return x.id === b.dataset.id; });
        i.q += Number(b.dataset.q);
        if (i.q < 1) itens = itens.filter(function (x) { return x !== i; });
        salvar(); desenharCarrinho();
      };
    });
  }
  function linkPedido(total) {
    var t = 'Olá! Quero fechar este pedido pelo site:\n' + itens.map(function (i) {
      var p = porId[i.id]; return '- ' + i.q + 'x ' + p.nome + (p.preco ? ' (' + brl(p.preco * i.q) + ')' : ' (sob consulta)');
    }).join('\n') + (total ? '\nSubtotal: ' + brl(total) : '');
    return 'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(t);
  }
  function abrirCarrinho() { desenharCarrinho(); gaveta.showModal(); }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-produto]');
    if (a) { e.preventDefault(); abrirFicha(a.dataset.produto); return; }
    var c = e.target.closest('[data-abrir-carrinho]');
    if (c) { e.preventDefault(); abrirCarrinho(); }
  });
  contar();

  window.Loja = { lista: lista, porId: porId, img: img, brl: brl, precoTexto: precoTexto, esc: esc, abrirFicha: abrirFicha, abrirCarrinho: abrirCarrinho, WHATS: WHATS };
})();
