import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Groq } from "groq-sdk";

import { 
  createInitialDriver, 
  buildJSONResponse, 
  calculateRaceExecution 
} from "./src/utils/simulationEngine";

import { 
  DEFAULT_TEAMS_BY_CATEGORY, 
  SPONSORS_POOL, 
  CATEGORY_CIRCUITS, 
  GENERATED_COMPETITORS 
} from "./src/data/gameData";

import { 
  Categorie, 
  Driver, 
  GameResponseJSON, 
  Team, 
  Sponsor, 
  RaceStrategy 
} from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// ============================================================
// CONFIGURATION GROQ
// ============================================================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ============================================================
// ROUTE IA PRINCIPALE POUR F1 CAREER (COMPATIBLE aiEngine.ts)
// ============================================================

app.post("/api/ai/generate-event", async (req, res) => {
  try {
    const {
      type,
      gameState,
      systemPrompt,
      typeInstructions,
      cleanState,
    } = req.body;

    if (!type || !gameState) {
      return res.status(400).json({
        error: "Paramètres manquants : type ou gameState",
      });
    }

    const prompt = `
TYPE D'ÉVÉNEMENT DEMANDÉ :
${type}

INSTRUCTIONS SPÉCIFIQUES :
${typeInstructions}

ÉTAT ACTUEL DU JEU :
${cleanState}

Génère maintenant UN événement cohérent avec cet état.
Les choix doivent être réellement différents.
Ne donne aucune explication hors JSON.
`;

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const resultText = completion.choices[0]?.message?.content;

    if (!resultText) {
      return res.status(500).json({ error: "Réponse vide de Groq" });
    }

    return res.json({ result: resultText });

  } catch (error) {
    console.error("Erreur Groq :", error);
    const details = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      error: "Erreur interne IA",
      details,
    });
  }
});

// ============================================================
// ROUTES EXISTANTES (inchangées)
// ============================================================

// Santé du serveur
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok",
    game: "Pole Position X - Simulateur Motorsport",
    groqConfigured: !!process.env.GROQ_API_KEY
  });
});

// Commentaire TV
app.post("/api/gemini/commentary", async (req, res) => {
  const { driverName, circuitName, position, weather, category, incident } = req.body;

  const prompt = `Tu es un commentateur télé exalté type Canal+ / F1 TV pour le championnat de ${category}.
Rédige un flash de commentaire télévisé ultra-dynamique (2 phrases max) sur le pilote ${driverName} qui vient de terminer la course à ${circuitName} en P${position} (conditions: ${weather}). Incidents notables: ${incident || 'aucun'}.`;

  const completion = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [
      { role: "system", content: "Tu es un commentateur sportif professionnel." },
      { role: "user", content: prompt }
    ],
    temperature: 0.8
  });

  const text = completion.choices[0]?.message?.content;

  res.json({ commentary: text || "Commentaire indisponible." });
});

// ============================================================
// ROUTE PRINCIPALE DE SIMULATION (inchangée)
// ============================================================

app.post("/api/simular", async (req, res) => {
  try {
    const { 
      action,
      nom, 
      nationalite, 
      style, 
      origine,
      teamId,
      sponsorIds,
      categorieCurrent,
      driverState,
      circuitId,
      strategy
    } = req.body;

    const categorie: Categorie = categorieCurrent || 'Karting';

    // Création pilote
    if (action === 'creation_pilote' || (!action && nom && style && origine)) {
      const { driver, initialTeams, initialSponsors } = createInitialDriver(
        nom || 'Alexandre Moreau',
        nationalite || 'France',
        style || 'Équilibré',
        origine || 'Classe Moyenne Passionnée'
      );

      const systemMsg = `Bienvenue dans votre carrière Motorsport, ${driver.nom} ! Choisissez votre première écurie.`;

      const responseJSON: GameResponseJSON = buildJSONResponse(
        'choix_equipe',
        driver,
        'Karting',
        initialTeams,
        initialSponsors,
        systemMsg
      );

      return res.json(responseJSON);
    }

    // Choix écurie
    if (action === 'choix_equipe' && driverState && teamId) {
      const currentDriver: Driver = driverState;
      const categoryTeams = DEFAULT_TEAMS_BY_CATEGORY[categorie];
      const selectedTeam = categoryTeams.find(t => t.id === teamId) || categoryTeams[0];

      const updatedBudget = currentDriver.budget - selectedTeam.coutSaison;

      const updatedDriver: Driver = {
        ...currentDriver,
        budget: updatedBudget
      };

      const selectedSponsors = (sponsorIds && sponsorIds.length > 0)
        ? SPONSORS_POOL.filter(s => sponsorIds.includes(s.id))
        : SPONSORS_POOL.slice(0, 2);

      const systemMsg = `Contrat signé chez ${selectedTeam.nom} ! Solde restant : ${updatedBudget} €.`;

      const responseJSON = buildJSONResponse(
        'tableau_de_bord',
        updatedDriver,
        categorie,
        categoryTeams,
        selectedSponsors,
        systemMsg
      );

      return res.json(responseJSON);
    }

    // Course
    if (action === 'course' && driverState) {
      const currentDriver: Driver = driverState;
      const categoryTeams = DEFAULT_TEAMS_BY_CATEGORY[categorie];
      const team = categoryTeams.find(t => t.id === teamId) || categoryTeams[0];
      const circuits = CATEGORY_CIRCUITS[categorie];
      const circuit = circuits.find(c => c.id === circuitId) || circuits[0];
      const competitors = GENERATED_COMPETITORS[categorie];
      const sponsors = SPONSORS_POOL.slice(0, 2);

      const strat: RaceStrategy = strategy || {
        pneuDepart: 'Medium',
        aggressivite: 'Normal',
        tourPitonPrevu: Math.floor(circuit.tours / 2),
        pneuApresPit: 'Soft'
      };

      const raceResult = calculateRaceExecution(
        currentDriver,
        team,
        sponsors,
        circuit,
        strat,
        competitors
      );

      const updatedDriver: Driver = {
        ...currentDriver,
        budget: currentDriver.budget + raceResult.gainFinancier,
        reputation: Math.min(100, Math.max(0, currentDriver.reputation + raceResult.gainReputation)),
        pointsChampionnat: currentDriver.pointsChampionnat + raceResult.pointsGagnes,
        coursesTotales: currentDriver.coursesTotales + 1,
        victoires: raceResult.positionFinale === 1 ? currentDriver.victoires + 1 : currentDriver.victoires,
        podiums: raceResult.positionFinale <= 3 ? currentDriver.podiums + 1 : currentDriver.podiums,
        poles: raceResult.positionQualif === 1 ? currentDriver.poles + 1 : currentDriver.poles
      };

      const systemMsg = `Course terminée à ${circuit.nom} : P${raceResult.positionFinale}.`;

      const responseJSON = buildJSONResponse(
        'resultat_course',
        updatedDriver,
        categorie,
        categoryTeams,
        sponsors,
        systemMsg
      );

      (responseJSON as any).resultatDetaille = raceResult;

      return res.json(responseJSON);
    }

    // Fallback
    const { driver, initialTeams, initialSponsors } = createInitialDriver(
      'Alexandre Moreau', 'France', 'Équilibré', 'Classe Moyenne Passionnée'
    );

    return res.json(buildJSONResponse(
      'creation_pilote',
      driver,
      'Karting',
      initialTeams,
      initialSponsors,
      "Initialisation de la carrière."
    ));

  } catch (error) {
    console.error("Error in /api/simular:", error);
    res.status(500).json({ error: "Erreur lors du calcul de la simulation" });
  }
});

// ============================================================
// SERVEUR + VITE
// ============================================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur F1 CAREER démarré sur http://localhost:${PORT}`);
  });
}

startServer();
