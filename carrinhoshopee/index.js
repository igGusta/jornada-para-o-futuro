const readline = require("readline");

// ─── Dados iniciais da loja ───────────────────────────────────────────────────
const PRODUTOS_DISPONIVEIS = [
  { id: 1,  nome: "Fone Bluetooth JBL",          preco: 159.90, estoque: 10, categoria: "Eletrônicos",  emoji: "🎧" },
  { id: 2,  nome: "Carregador USB-C 65W",         preco:  89.90, estoque: 25, categoria: "Eletrônicos",  emoji: "🔌" },
  { id: 3,  nome: "Camiseta Oversized",            preco:  49.90, estoque: 50, categoria: "Moda",         emoji: "👕" },
  { id: 4,  nome: "Tênis Running Pro",             preco: 219.90, estoque:  8, categoria: "Calçados",     emoji: "👟" },
  { id: 5,  nome: "Mochila Impermeável 30L",       preco: 129.90, estoque: 15, categoria: "Acessórios",   emoji: "🎒" },
  { id: 6,  nome: "Mouse Gamer RGB",               preco:  99.90, estoque: 20, categoria: "Eletrônicos",  emoji: "🖱️" },
  { id: 7,  nome: "Livro: Clean Code",             preco:  74.90, estoque: 30, categoria: "Livros",       emoji: "📘" },
  { id: 8,  nome: "Garrafa Térmica 500ml",         preco:  39.90, estoque: 40, categoria: "Casa",         emoji: "🍶" },
  { id: 9,  nome: "Smartwatch Fitness",            preco: 299.90, estoque:  5, categoria: "Eletrônicos",  emoji: "⌚" },
  { id: 10, nome: "Cabo HDMI 2m",                  preco:  24.90, estoque: 60, categoria: "Eletrônicos",  emoji: "🔗" },
];

// ─── Estado do carrinho ───────────────────────────────────────────────────────
let carrinho = [];
let codigoCupom = null;
const CUPONS = {
  "SHOPEE10": 0.10,
  "DESCONTO20": 0.20,
  "FRETE": "frete_gratis",
};

// ─── Interface readline ───────────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const pergunta = (texto) => new Promise((res) => rl.question(texto, res));

// ─── Utilitários de exibição ──────────────────────────────────────────────────
const CORES = {
  reset:    "\x1b[0m",
  laranja:  "\x1b[38;5;208m",
  amarelo:  "\x1b[33m",
  verde:    "\x1b[32m",
  vermelho: "\x1b[31m",
  cinza:    "\x1b[90m",
  branco:   "\x1b[97m",
  negrito:  "\x1b[1m",
  bgLaranja:"\x1b[48;5;208m\x1b[30m",
  bgVerde:  "\x1b[42m\x1b[30m",
  bgVermelho:"\x1b[41m\x1b[97m",
  ciano:    "\x1b[36m",
};

const c = (cor, texto) => `${CORES[cor]}${texto}${CORES.reset}`;
const formatarPreco = (valor) => `R$ ${valor.toFixed(2).replace(".", ",")}`;
const linha = (char = "─", tamanho = 55) => char.repeat(tamanho);

function limparTela() {
  process.stdout.write("\x1Bc");
}

function cabecalho() {
  console.log();
  console.log(c("laranja", c("negrito", "  ╔═══════════════════════════════════════════════════╗")));
  console.log(c("laranja", c("negrito", "  ║") + c("branco", c("negrito", "       🛒  SHOPEE CART  —  Sistema de Compras       ")) + c("laranja", c("negrito", "║"))));
  console.log(c("laranja", c("negrito", "  ╚═══════════════════════════════════════════════════╝")));
  console.log();
}

// ─── Cálculos do carrinho ─────────────────────────────────────────────────────
function calcularSubtotal() {
  return carrinho.reduce((total, item) => total + item.preco * item.quantidade, 0);
}

function calcularFrete() {
  const subtotal = calcularSubtotal();
  if (codigoCupom && CUPONS[codigoCupom] === "frete_gratis") return 0;
  if (subtotal >= 200) return 0;
  return 15.90;
}

function calcularDesconto() {
  const subtotal = calcularSubtotal();
  if (!codigoCupom) return 0;
  const desconto = CUPONS[codigoCupom];
  if (typeof desconto === "number") return subtotal * desconto;
  return 0;
}

function calcularTotal() {
  return calcularSubtotal() - calcularDesconto() + calcularFrete();
}

function totalItens() {
  return carrinho.reduce((acc, item) => acc + item.quantidade, 0);
}

// ─── TELA 1: Menu principal ───────────────────────────────────────────────────
async function menuPrincipal() {
  limparTela();
  cabecalho();

  const qtd = totalItens();
  const badgeCarrinho = qtd > 0
    ? c("bgLaranja", ` ${qtd} `) + " " + c("laranja", formatarPreco(calcularTotal()))
    : c("cinza", "vazio");

  console.log(`  Carrinho: ${badgeCarrinho}`);
  console.log();
  console.log(c("negrito", "  O que você quer fazer?"));
  console.log();
  console.log(c("laranja", "  [1]") + "  🔍 Ver produtos disponíveis");
  console.log(c("laranja", "  [2]") + "  🛒 Ver carrinho");
  console.log(c("laranja", "  [3]") + "  ➕ Adicionar produto");
  console.log(c("laranja", "  [4]") + "  ✏️  Alterar quantidade");
  console.log(c("laranja", "  [5]") + "  ❌ Remover produto");
  console.log(c("laranja", "  [6]") + "  🎫 Aplicar cupom");
  console.log(c("laranja", "  [7]") + "  💳 Finalizar compra");
  console.log(c("vermelho", "  [0]") + "  🚪 Sair");
  console.log();

  const opcao = await pergunta(c("laranja", "  ▶ Escolha: "));
  return opcao.trim();
}

// ─── TELA 2: Lista de produtos ────────────────────────────────────────────────
async function verProdutos() {
  limparTela();
  cabecalho();
  console.log(c("negrito", "  📦 PRODUTOS DISPONÍVEIS"));
  console.log(c("cinza", "  " + linha()));
  console.log();

  const categorias = [...new Set(PRODUTOS_DISPONIVEIS.map((p) => p.categoria))];

  for (const cat of categorias) {
    const prods = PRODUTOS_DISPONIVEIS.filter((p) => p.categoria === cat);
    console.log(c("amarelo", `  ${cat}`));
    for (const p of prods) {
      const noCarrinho = carrinho.find((c) => c.id === p.id);
      const badge = noCarrinho ? c("bgVerde", ` ✓ ${noCarrinho.quantidade}x no carrinho `) : "";
      const estoqueBaixo = p.estoque <= 5 ? c("vermelho", ` ⚠ só ${p.estoque} restantes`) : "";
      console.log(
        `  ${c("cinza", `[${String(p.id).padStart(2, "0")}]`)}  ${p.emoji}  ${c("branco", p.nome.padEnd(28))}  ${c("laranja", formatarPreco(p.preco))}${estoqueBaixo}  ${badge}`
      );
    }
    console.log();
  }

  console.log(c("cinza", "  " + linha()));
  console.log(c("verde", "  ✅ Frete grátis para compras acima de R$ 200,00"));
  console.log();
  await pergunta(c("cinza", "  Pressione Enter para voltar..."));
}

// ─── TELA 3: Carrinho ─────────────────────────────────────────────────────────
async function verCarrinho() {
  limparTela();
  cabecalho();
  console.log(c("negrito", "  🛒 SEU CARRINHO"));
  console.log(c("cinza", "  " + linha()));
  console.log();

  if (carrinho.length === 0) {
    console.log(c("cinza", "  Seu carrinho está vazio 😔"));
    console.log(c("cinza", "  Use a opção [3] para adicionar produtos!"));
    console.log();
    await pergunta(c("cinza", "  Pressione Enter para voltar..."));
    return;
  }

  // Itens
  carrinho.forEach((item, i) => {
    const subtotalItem = item.preco * item.quantidade;
    console.log(
      `  ${c("cinza", `${i + 1}.`)} ${item.emoji}  ${c("branco", item.nome)}`
    );
    console.log(
      `      ${c("cinza", formatarPreco(item.preco))} × ${c("laranja", item.quantidade)} un = ${c("negrito", c("laranja", formatarPreco(subtotalItem)))}`
    );
    console.log();
  });

  // Resumo financeiro
  const subtotal  = calcularSubtotal();
  const desconto  = calcularDesconto();
  const frete     = calcularFrete();
  const total     = calcularTotal();

  console.log(c("cinza", "  " + linha()));
  console.log(`  Subtotal (${totalItens()} itens):   ${c("branco", formatarPreco(subtotal).padStart(12))}`);

  if (desconto > 0) {
    console.log(`  ${c("verde", `Desconto (${codigoCupom}):`).padEnd(30)}  ${c("verde", `- ${formatarPreco(desconto)}`)}`);
  }

  if (codigoCupom && CUPONS[codigoCupom] === "frete_gratis") {
    console.log(`  Frete: ${c("verde", "GRÁTIS 🎉")}`);
  } else if (frete === 0) {
    console.log(`  Frete: ${c("verde", "GRÁTIS (acima de R$200) 🎉")}`);
  } else {
    console.log(`  Frete:                     ${c("amarelo", formatarPreco(frete).padStart(12))}`);
  }

  console.log(c("cinza", "  " + linha()));
  console.log(c("negrito", `  TOTAL:                    ${c("laranja", c("negrito", formatarPreco(total).padStart(12)))}`));
  console.log();
  await pergunta(c("cinza", "  Pressione Enter para voltar..."));
}

// ─── TELA 4: Adicionar produto ────────────────────────────────────────────────
async function adicionarProduto() {
  limparTela();
  cabecalho();
  console.log(c("negrito", "  ➕ ADICIONAR PRODUTO AO CARRINHO"));
  console.log(c("cinza", "  " + linha()));
  console.log();

  // Lista rápida com IDs
  PRODUTOS_DISPONIVEIS.forEach((p) => {
    const noCarrinho = carrinho.find((c) => c.id === p.id);
    const badge = noCarrinho ? c("verde", ` (já no carrinho: ${noCarrinho.quantidade}x)`) : "";
    console.log(
      `  ${c("laranja", `[${String(p.id).padStart(2, "0")}]`)} ${p.emoji} ${p.nome.padEnd(28)} ${c("cinza", formatarPreco(p.preco))}${badge}`
    );
  });

  console.log();
  const idInput = await pergunta(c("laranja", "  ID do produto (0 para cancelar): "));
  const id = parseInt(idInput);

  if (id === 0) return;

  const produto = PRODUTOS_DISPONIVEIS.find((p) => p.id === id);
  if (!produto) {
    console.log(c("vermelho", "\n  ❌ Produto não encontrado!"));
    await pergunta(c("cinza", "  Pressione Enter para continuar..."));
    return;
  }

  const itemExistente = carrinho.find((i) => i.id === id);
  const qtdAtual = itemExistente ? itemExistente.quantidade : 0;
  const disponivelAdicionar = produto.estoque - qtdAtual;

  if (disponivelAdicionar <= 0) {
    console.log(c("vermelho", `\n  ❌ Estoque insuficiente! Você já tem ${qtdAtual} no carrinho.`));
    await pergunta(c("cinza", "  Pressione Enter para continuar..."));
    return;
  }

  console.log();
  console.log(`  ${c("negrito", produto.emoji + " " + produto.nome)}`);
  console.log(`  Preço: ${c("laranja", formatarPreco(produto.preco))}`);
  console.log(`  Disponível para adicionar: ${c("verde", disponivelAdicionar)} unidades`);
  console.log();

  const qtdInput = await pergunta(c("laranja", "  Quantidade (padrão 1): "));
  const quantidade = parseInt(qtdInput) || 1;

  if (quantidade <= 0) {
    console.log(c("vermelho", "\n  ❌ Quantidade inválida!"));
    await pergunta(c("cinza", "  Pressione Enter para continuar..."));
    return;
  }

  if (quantidade > disponivelAdicionar) {
    console.log(c("vermelho", `\n  ❌ Quantidade excede o estoque disponível (${disponivelAdicionar})!`));
    await pergunta(c("cinza", "  Pressione Enter para continuar..."));
    return;
  }

  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    carrinho.push({ ...produto, quantidade });
  }

  console.log(c("verde", `\n  ✅ ${quantidade}x "${produto.nome}" adicionado ao carrinho!`));
  console.log(c("cinza", `  Subtotal agora: ${formatarPreco(calcularSubtotal())}`));
  await pergunta(c("cinza", "\n  Pressione Enter para continuar..."));
}

// ─── TELA 5: Alterar quantidade ───────────────────────────────────────────────
async function alterarQuantidade() {
  limparTela();
  cabecalho();
  console.log(c("negrito", "  ✏️  ALTERAR QUANTIDADE"));
  console.log(c("cinza", "  " + linha()));
  console.log();

  if (carrinho.length === 0) {
    console.log(c("cinza", "  Carrinho vazio."));
    await pergunta(c("cinza", "\n  Pressione Enter para voltar..."));
    return;
  }

  carrinho.forEach((item, i) => {
    console.log(
      `  ${c("laranja", `[${i + 1}]`)} ${item.emoji} ${item.nome.padEnd(30)} ${c("cinza", `${item.quantidade}x`)}`
    );
  });

  console.log();
  const numInput = await pergunta(c("laranja", "  Número do item (0 para cancelar): "));
  const num = parseInt(numInput);

  if (num === 0) return;
  if (num < 1 || num > carrinho.length) {
    console.log(c("vermelho", "\n  ❌ Item inválido!"));
    await pergunta(c("cinza", "  Pressione Enter para continuar..."));
    return;
  }

  const item = carrinho[num - 1];
  const prodOriginal = PRODUTOS_DISPONIVEIS.find((p) => p.id === item.id);
  console.log();
  console.log(`  Produto: ${c("negrito", item.nome)}`);
  console.log(`  Quantidade atual: ${c("laranja", item.quantidade)}`);
  console.log(`  Estoque disponível: ${c("verde", prodOriginal.estoque)}`);
  console.log();

  const novaQtdInput = await pergunta(c("laranja", "  Nova quantidade (0 para remover): "));
  const novaQtd = parseInt(novaQtdInput);

  if (isNaN(novaQtd) || novaQtd < 0) {
    console.log(c("vermelho", "\n  ❌ Quantidade inválida!"));
    await pergunta(c("cinza", "  Pressione Enter para continuar..."));
    return;
  }

  if (novaQtd === 0) {
    carrinho.splice(num - 1, 1);
    console.log(c("verde", `\n  ✅ "${item.nome}" removido do carrinho.`));
  } else if (novaQtd > prodOriginal.estoque) {
    console.log(c("vermelho", `\n  ❌ Estoque máximo: ${prodOriginal.estoque} unidades!`));
  } else {
    item.quantidade = novaQtd;
    console.log(c("verde", `\n  ✅ Quantidade atualizada para ${novaQtd}x!`));
  }

  await pergunta(c("cinza", "\n  Pressione Enter para continuar..."));
}

// ─── TELA 6: Remover produto ──────────────────────────────────────────────────
async function removerProduto() {
  limparTela();
  cabecalho();
  console.log(c("negrito", "  ❌ REMOVER PRODUTO"));
  console.log(c("cinza", "  " + linha()));
  console.log();

  if (carrinho.length === 0) {
    console.log(c("cinza", "  Carrinho vazio."));
    await pergunta(c("cinza", "\n  Pressione Enter para voltar..."));
    return;
  }

  carrinho.forEach((item, i) => {
    console.log(
      `  ${c("vermelho", `[${i + 1}]`)} ${item.emoji} ${item.nome.padEnd(30)} ${c("laranja", `${item.quantidade}x  ${formatarPreco(item.preco * item.quantidade)}`)}`
    );
  });

  console.log();
  const numInput = await pergunta(c("vermelho", "  Número do item para remover (0 para cancelar): "));
  const num = parseInt(numInput);

  if (num === 0) return;
  if (num < 1 || num > carrinho.length) {
    console.log(c("vermelho", "\n  ❌ Item inválido!"));
    await pergunta(c("cinza", "  Pressione Enter para continuar..."));
    return;
  }

  const item = carrinho[num - 1];
  const confirmacao = await pergunta(
    c("amarelo", `\n  Remover "${item.nome}"? (s/N): `)
  );

  if (confirmacao.toLowerCase() === "s") {
    carrinho.splice(num - 1, 1);
    console.log(c("verde", `\n  ✅ "${item.nome}" removido!`));
  } else {
    console.log(c("cinza", "\n  Cancelado."));
  }

  await pergunta(c("cinza", "\n  Pressione Enter para continuar..."));
}

// ─── TELA 7: Cupom ───────────────────────────────────────────────────────────
async function aplicarCupom() {
  limparTela();
  cabecalho();
  console.log(c("negrito", "  🎫 APLICAR CUPOM DE DESCONTO"));
  console.log(c("cinza", "  " + linha()));
  console.log();
  console.log(c("cinza", "  Cupons disponíveis (para teste):"));
  console.log(c("cinza", "   • SHOPEE10   → 10% de desconto"));
  console.log(c("cinza", "   • DESCONTO20 → 20% de desconto"));
  console.log(c("cinza", "   • FRETE      → Frete grátis"));
  console.log();

  if (codigoCupom) {
    console.log(c("amarelo", `  Cupom ativo: ${codigoCupom}`));
    const remover = await pergunta(c("amarelo", "  Deseja remover o cupom atual? (s/N): "));
    if (remover.toLowerCase() === "s") {
      codigoCupom = null;
      console.log(c("verde", "\n  ✅ Cupom removido!"));
      await pergunta(c("cinza", "  Pressione Enter para continuar..."));
      return;
    }
  }

  const cupom = await pergunta(c("laranja", "  Digite o código do cupom (0 para cancelar): "));
  const cupomUpper = cupom.toUpperCase().trim();

  if (cupomUpper === "0") return;

  if (CUPONS[cupomUpper] !== undefined) {
    codigoCupom = cupomUpper;
    const tipo = CUPONS[cupomUpper];
    const msg = tipo === "frete_gratis"
      ? "Frete grátis aplicado! 🚚"
      : `${tipo * 100}% de desconto aplicado! 🎉`;
    console.log(c("verde", `\n  ✅ Cupom válido! ${msg}`));
  } else {
    console.log(c("vermelho", "\n  ❌ Cupom inválido ou expirado!"));
  }

  await pergunta(c("cinza", "\n  Pressione Enter para continuar..."));
}

// ─── TELA 8: Finalizar compra ─────────────────────────────────────────────────
async function finalizarCompra() {
  limparTela();
  cabecalho();

  if (carrinho.length === 0) {
    console.log(c("vermelho", "  ❌ Seu carrinho está vazio!"));
    await pergunta(c("cinza", "\n  Pressione Enter para voltar..."));
    return;
  }

  const subtotal = calcularSubtotal();
  const desconto = calcularDesconto();
  const frete    = calcularFrete();
  const total    = calcularTotal();

  console.log(c("negrito", "  💳 RESUMO DO PEDIDO"));
  console.log(c("cinza", "  " + linha()));
  console.log();

  carrinho.forEach((item) => {
    console.log(`  ${item.emoji} ${item.nome} × ${item.quantidade} = ${c("laranja", formatarPreco(item.preco * item.quantidade))}`);
  });

  console.log();
  console.log(c("cinza", "  " + linha()));
  console.log(`  Subtotal:  ${formatarPreco(subtotal)}`);
  if (desconto > 0)   console.log(c("verde", `  Desconto:  - ${formatarPreco(desconto)}`));
  if (frete === 0)    console.log(c("verde", "  Frete:     GRÁTIS"));
  else                console.log(`  Frete:     ${formatarPreco(frete)}`);
  console.log(c("cinza", "  " + linha()));
  console.log(c("negrito", c("laranja", `  TOTAL:     ${formatarPreco(total)}`)));
  console.log();

  const confirmar = await pergunta(c("laranja", "  Confirmar pedido? (s/N): "));

  if (confirmar.toLowerCase() !== "s") {
    console.log(c("cinza", "\n  Pedido cancelado."));
    await pergunta(c("cinza", "  Pressione Enter para voltar..."));
    return;
  }

  // Simulação de pagamento
  console.log();
  console.log(c("cinza", "  Processando pagamento"));
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r, 500));
    process.stdout.write(c("laranja", " ."));
  }

  // Número de pedido aleatório
  const numeroPedido = `SHP${Date.now().toString().slice(-8)}`;

  // Zera carrinho
  carrinho = [];
  codigoCupom = null;

  console.log();
  console.log();
  console.log(c("bgVerde", "  ✅  PEDIDO CONFIRMADO!  "));
  console.log();
  console.log(c("negrito", `  Número do pedido: ${c("laranja", numeroPedido)}`));
  console.log(c("cinza",   "  Você receberá a confirmação em breve."));
  console.log(c("cinza",   "  Prazo estimado: 3 a 7 dias úteis 📦"));
  console.log();
  console.log(c("laranja", "  Obrigado por comprar na Shopee! 🧡"));
  console.log();

  await pergunta(c("cinza", "  Pressione Enter para continuar..."));
}

// ─── Loop principal ───────────────────────────────────────────────────────────
async function main() {
  while (true) {
    const opcao = await menuPrincipal();

    switch (opcao) {
      case "1": await verProdutos();       break;
      case "2": await verCarrinho();       break;
      case "3": await adicionarProduto();  break;
      case "4": await alterarQuantidade(); break;
      case "5": await removerProduto();    break;
      case "6": await aplicarCupom();      break;
      case "7": await finalizarCompra();   break;
      case "0":
        limparTela();
        console.log(c("laranja", "\n  Até logo! 🧡 Volte sempre à Shopee!\n"));
        rl.close();
        process.exit(0);
      default:
        // Opção inválida: apenas remostra o menu
        break;
    }
  }
}

main().catch((err) => {
  console.error("Erro:", err);
  rl.close();
  process.exit(1);
});
