const player1 = {
  NOME: "Mario",
  VELOCIDADE: 4,
  MANOBRABILIDADE: 3,
  PODER: 3,
  PONTOS: 0,
};

const player2 = {
  NOME: "Luigi",
  VELOCIDADE: 3,
  MANOBRABILIDADE: 4,
  PODER: 4,
  PONTOS: 0,
};

const player3 = {
  NOME: "Peach",
  VELOCIDADE: 5,
  MANOBRABILIDADE: 3,
  PODER: 3,
  PONTOS: 0,
};

const player4 = {
  NOME: "Bowser",
  VELOCIDADE: 3,
  MANOBRABILIDADE: 3,
  PODER: 5,
  PONTOS: 0,
};

const player5 = {
  NOME: "Toad",
  VELOCIDADE: 5,
  MANOBRABILIDADE: 2,
  PODER: 5,
  PONTOS: 0,
};

const player6 = {
  NOME: "Donkey Kong",
  VELOCIDADE: 2,
  MANOBRABILIDADE: 5,
  PODER: 5,
  PONTOS: 0,
};

async function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

async function getRandomBlock() {
  let random = Math.random();
  if (random < 0.33) return "RETA";
  if (random < 0.66) return "CURVA";
  return "CONFRONTO";
}

async function logRollResult(characterName, block, diceResult, attribute) {
  console.log(
    `${characterName} 🎲 rolou um dado de ${block}: ${diceResult} + ${attribute} = ${diceResult + attribute}`
  );
}

async function playRaceEngine(c1, c2, c3, c4, c5, c6) {
  const characters = [c1, c2, c3, c4, c5, c6];

  for (let round = 1; round <= 5; round++) {
    console.log(`\n🏁 Rodada ${round}`);

    let block = await getRandomBlock();
    console.log(`Bloco: ${block}`);

  
    const diceResults = [];
    for (let i = 0; i < 6; i++) {
      diceResults.push(await rollDice());
    }

    if (block === "RETA") {
      const scores = characters.map((c, i) => ({
        char: c,
        total: diceResults[i] + c.VELOCIDADE,
      }));

      for (const s of scores) {
        await logRollResult(s.char.NOME, "velocidade", diceResults[characters.indexOf(s.char)], s.char.VELOCIDADE);
      }

     
      const maxScore = Math.max(...scores.map((s) => s.total));
      const winners = scores.filter((s) => s.total === maxScore);

      if (winners.length === 1) {
        winners[0].char.PONTOS++;
        console.log(`⭐ ${winners[0].char.NOME} marcou um ponto!`);
      } else {
        console.log(`🤝 Empate na reta! Nenhum ponto foi marcado.`);
      }
    }

    if (block === "CURVA") {
      const scores = characters.map((c, i) => ({
        char: c,
        total: diceResults[i] + c.MANOBRABILIDADE,
      }));

      for (const s of scores) {
        await logRollResult(s.char.NOME, "manobrabilidade", diceResults[characters.indexOf(s.char)], s.char.MANOBRABILIDADE);
      }

      const maxScore = Math.max(...scores.map((s) => s.total));
      const winners = scores.filter((s) => s.total === maxScore);

      if (winners.length === 1) {
        winners[0].char.PONTOS++;
        console.log(`⭐ ${winners[0].char.NOME} marcou um ponto!`);
      } else {
        console.log(`🤝 Empate na curva! Nenhum ponto foi marcado.`);
      }
    }

    if (block === "CONFRONTO") {
      const powerResults = characters.map((c, i) => ({
        char: c,
        total: diceResults[i] + c.PODER,
      }));

      console.log(`\n💥 CONFRONTO GERAL! 🥊`);
      for (const s of powerResults) {
        await logRollResult(s.char.NOME, "poder", diceResults[characters.indexOf(s.char)], s.char.PODER);
      }

      
      for (let i = 0; i < powerResults.length; i++) {
        for (let j = i + 1; j < powerResults.length; j++) {
          const a = powerResults[i];
          const b = powerResults[j];

          if (a.total > b.total) {
            console.log(`${a.char.NOME} venceu o confronto contra ${b.char.NOME}!`);
            if (b.char.PONTOS > 0) {
              b.char.PONTOS--;
              console.log(`  ${b.char.NOME} perdeu 1 ponto 🐢`);
            }
          } else if (b.total > a.total) {
            console.log(`${b.char.NOME} venceu o confronto contra ${a.char.NOME}!`);
            if (a.char.PONTOS > 0) {
              a.char.PONTOS--;
              console.log(`  ${a.char.NOME} perdeu 1 ponto 🐢`);
            }
          } else {
            console.log(`🤝 ${a.char.NOME} e ${b.char.NOME} empataram no confronto!`);
          }
        }
      }
    }

    console.log("\n📊 Placar atual:");
    for (const c of characters) {
      console.log(`  ${c.NOME}: ${c.PONTOS} ponto(s)`);
    }
    console.log("-----------------------------");
  }
}

async function declareWinner(c1, c2, c3, c4, c5, c6) {
  const characters = [c1, c2, c3, c4, c5, c6];

  console.log("\n🏆 RESULTADO FINAL:");
  for (const c of characters) {
    console.log(`  ${c.NOME}: ${c.PONTOS} ponto(s)`);
  }

  const maxPoints = Math.max(...characters.map((c) => c.PONTOS));
  const winners = characters.filter((c) => c.PONTOS === maxPoints);

  if (winners.length === 1) {
    console.log(`\n🥇 ${winners[0].NOME} venceu a corrida! Parabéns! 🏆`);
  } else {
    const names = winners.map((c) => c.NOME).join(", ");
    console.log(`\n🤝 A corrida terminou em empate entre: ${names}!`);
  }
}

(async function main() {
  console.log(
    `🏁🚨 Corrida entre ${player1.NOME}, ${player2.NOME}, ${player3.NOME}, ${player4.NOME}, ${player5.NOME} e ${player6.NOME} começando...\n`
  );

  await playRaceEngine(player1, player2, player3, player4, player5, player6);
  await declareWinner(player1, player2, player3, player4, player5, player6);
})();
