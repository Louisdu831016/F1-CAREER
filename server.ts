import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
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
import { Categorie, Driver, GameResponseJSON, Team, Sponsor, RaceStrategy } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper Gemini client
function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (err) {
    console.error("Gemini init error:", err);
    return null;
  }
}

// Clean and parse JSON helper from AI response
function cleanAndParseJSON<T = any>(text: string): T | null {
  if (!text) return null;
  try {
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.warn("Error parsing AI JSON output:", err);
    return null;
  }
}

// Universal AI query helper (Gemini SDK primary + OpenRouter fallback)
async function queryAI(prompt: string, systemPrompt?: string): Promise<string | null> {
  // 1. Try native Gemini SDK first
  const ai = getGeminiClient();
  if (ai) {
    const geminiModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    for (const gModel of geminiModels) {
      try {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
        const response = await ai.models.generateContent({
          model: gModel,
          contents: fullPrompt
        });
        if (response.text) return response.text.trim();
      } catch (e) {
        // Try next model silently
      }
    }
  }

  // 2. Try OpenRouter if key exists
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey && openRouterKey.trim().length > 0) {
    const openRouterModels = [
      "google/gemini-2.5-flash",
      "google/gemini-2.0-flash",
      "meta-llama/llama-3.3-70b-instruct:free",
      "qwen/qwen-2.5-coder-32b-instruct:free"
    ];

    for (const modelName of openRouterModels) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey.trim()}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ai.studio",
            "X-Title": "Pole Position X"
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
              { role: "user", content: prompt }
            ],
            temperature: 0.8
          })
        });
        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return content.trim();
        }
      } catch (e) {
        // Try next model silently
      }
    }
  }

  return null;
}

// API Health & AI Status Check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    game: "Pole Position X - Simulateur Motorsport",
    openRouterConfigured: !!process.env.OPENROUTER_API_KEY,
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

app.get("/api/ai/status", (req, res) => {
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim().length > 0;
  const hasGemini = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0;
  res.json({
    activeProvider: hasOpenRouter ? 'openrouter' : (hasGemini ? 'gemini' : 'none'),
    hasOpenRouter,
    hasGemini
  });
});

// Route d'événement dynamique généré par IA
app.post("/api/ai/generate-event", async (req, res) => {
  const { driver, category, team, context } = req.body;
  const systemPrompt = `Tu es le maître de jeu d'une simulation de carrière automobile hyper-réaliste (Karting à F1). 
RÈGLES STRICTES DE DIVERSIFICATION ET RÉALISME :
1. Génère un dilemme de carrière ou d'écurie cornélien, imprévisible et réaliste.
2. Ne révèle JAMAIS dans la description qu'un choix est un piège ou un mauvais choix. Les mauvais choix doivent sembler attrayants, ambitieux ou stratégiques mais présenter des contreparties réelles.
3. Aucun miracle n'est possible : les résultats doivent être stricts et proportionnés aux performances de la voiture et au niveau du pilote.
4. Réponds STRICTEMENT au format JSON valide avec la structure :
{
  "titre": "Titre du dilemme",
  "situation": "Description immersive de la situation (2-3 phrases)",
  "optionA": { "texte": "Choix A", "description": "Ce que fait le pilote" },
  "optionB": { "texte": "Choix B", "description": "Ce que fait le pilote" }
}`;

  const prompt = `Pilote: ${driver?.nom || 'Inconnu'}, Catégorie: ${category}, Écurie: ${team?.nom || 'Inconnue'}, Réputation: ${driver?.reputation || 50}/100, Budget: ${driver?.budget || 0}€. Contexte: ${context || 'Au milieu du championnat'}. Génère un dilemme cornélien.`;

  const aiText = await queryAI(prompt, systemPrompt);
  if (aiText) {
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json({ success: true, event: parsed });
      }
    } catch (e) {
      console.warn("Failed to parse JSON from AI event:", e);
    }
  }

  res.json({ success: false, fallback: true });
});

// Route de dilemme de course dynamique IA (OpenRouter + Gemini)
app.post("/api/ai/generate-race-dilemma", async (req, res) => {
  const { 
    driverName, 
    category, 
    circuitName, 
    lap, 
    totalLaps, 
    userPosition, 
    carAhead, 
    carBehind, 
    teammate, 
    rival, 
    tireWear, 
    weather,
    strategy
  } = req.body;

  const stratAggro = strategy?.aggressivite || 'Normal';
  const stratPneu = strategy?.pneuDepart || 'Medium';
  const stratPit = strategy?.tourPitonPrevu ? `Tour ${strategy.tourPitonPrevu}` : 'Aucun arrêt immédiat';

  const systemPrompt = `Tu es l'ingénieur de piste radio et le maître du jeu d'un simulateur de course F1 / Motorsport hyper-réaliste.
RÈGLES IMPÉRATIVES DE RÉALISME ET COHÉRENCE EN COURSE :
1. La situation DOIT refléter la position RÉELLE du pilote (${driverName || 'Pilote'}) qui est actuellement P${userPosition || 10} au tour ${lap || 1}/${totalLaps || 20}.
2. COHÉRENCE STRICTE AVEC LA STRATÉGIE SÉLECTIONNÉE PAR LE PILOTE :
   - Mode d'agressivité de la stratégie : "${stratAggro}"
   - Pneus utilisés : "${stratPneu}"
   - Arrêt aux stands planifié : "${stratPit}"
   Les consignes radio de l'ingénieur et les options de réponse DOIVENT ÊTRE 100% LOGIQUES avec cette stratégie !
   Par exemple, si le pilote est en mode "Économe", l'ingénieur ne doit JAMAIS lui reprocher d'économiser du pneu, mais lui donner un statut sur la gestion de son plan de course.
2b. COHÉRENCE ABSOLUE DE LA SANTÉ DES PNEUS :
   - La valeur "Santé des pneus" transmise est le POURCENTAGE DE VIE RESTANTE (100% = pneu neuf, 0% = pneu totalement détruit).
   - Si la santé des pneus est > 50% (ex: 87%, 75%), les pneus sont en EXCELLENT ÉTAT / FRAIS.
   - Il est STRICTEMENT INTERDIT de dire que les pneus surchauffent ou manquent de gomme si la santé restante est supérieure à 50% !
   - Ne déclenche une alerte de surchauffe ou de dégradation que si la santé des pneus est INFÉRIEURE À 35% !
3. Si le pilote est P${userPosition}, NE PARLE JAMAIS de la 1ère place ou d'un pilote en P1 à moins que le pilote soit lui-même P1 ou P2 !
4. Si le pilote est en fin de peloton (ex: P18 ou P19 sur 20), la bataille concerne la P17 ou P18, JAMAIS le podium !
5. Si une voiture est juste devant (ex: ${carAhead ? `P${carAhead.position} ${carAhead.name}` : 'voiture devant'}), le dilemme peut concerner une attaque sur CETTE voiture spécifique.
6. Si une voiture est juste derrière (ex: ${carBehind ? `P${carBehind.position} ${carBehind.name}` : 'poursuivant'}), le dilemme peut concerner la défense contre CETTE voiture.
7. Tu dois répondre STRICTEMENT en JSON valide avec cette structure exacte :
{
  "id": "dilemma-ai-${lap || 1}",
  "tour": ${lap || 1},
  "titre": "Titre percutant (max 6 mots)",
  "situation": "Description immersive de la situation en piste pour la P${userPosition} en rythme ${stratAggro} (2 phrases)",
  "consigneIngenieur": "Radio Ingénieur : 'Message radio réaliste en lien direct avec la stratégie ${stratAggro}'",
  "options": [
    {
      "id": "opt-audacieux",
      "texte": "Intitulé court du choix audacieux",
      "description": "Ce que fait le pilote en piste",
      "type": "audacieux",
      "impactCourseResumee": "⚡ Effet sur la course (ex: Tente de doubler, +10% usure)",
      "impactPiloteResumee": "👤 Impact stats (ex: +0.3 Dépassement, +5 Confiance Écurie)",
      "impacts": {
        "positionDelta": -1,
        "gapSecDelta": -0.8,
        "tireWearPenalty": 4,
        "statChanges": { "depassement": 0.3, "vitesse": 0.2 },
        "confianceDirecteurDelta": 5,
        "relationCoequipierDelta": 0,
        "tensionRivalDelta": 10
      }
    },
    {
      "id": "opt-prudent",
      "texte": "Intitulé court du choix prudent",
      "description": "Ce que fait le pilote en piste",
      "type": "prudent",
      "impactCourseResumee": "🛡️ Effet sur la course (ex: Conserve la P${userPosition}, préserve les pneus)",
      "impactPiloteResumee": "👤 Impact stats (ex: +0.3 Régularité, +10 Confiance Écurie)",
      "impacts": {
        "positionDelta": 0,
        "gapSecDelta": 0.2,
        "tireWearPenalty": 0,
        "statChanges": { "regularite": 0.3 },
        "confianceDirecteurDelta": 10,
        "relationCoequipierDelta": 0,
        "tensionRivalDelta": -5
      }
    },
    {
      "id": "opt-strategique",
      "texte": "Intitulé court du choix stratégique",
      "description": "Ce que fait le pilote en piste",
      "type": "strategique",
      "impactCourseResumee": "🎯 Effet sur la course (ex: Optimise la réaccélération / la ligne)",
      "impactPiloteResumee": "👤 Impact stats (ex: +0.3 Talent, +0.2 Vitesse)",
      "impacts": {
        "positionDelta": 0,
        "gapSecDelta": -0.4,
        "tireWearPenalty": 2,
        "statChanges": { "talent": 0.3, "vitesse": 0.2 },
        "confianceDirecteurDelta": 5,
        "relationCoequipierDelta": 0,
        "tensionRivalDelta": 0
      }
    }
  ]
}`;

  const prompt = `Circuit: ${circuitName || 'Circuit'}, Catégorie: ${category || 'Motorsport'}, Tour: ${lap}/${totalLaps}, Météo: ${weather}.
Pilote: ${driverName}, Position Actuelle en piste: P${userPosition}/20.
Stratégie de course du pilote : Agressivité=${stratAggro}, Pneus=${stratPneu}, Arrêt=${stratPit}.
Voiture devant: ${carAhead ? `P${carAhead.position} ${carAhead.name} (${carAhead.team}, à ${carAhead.gapSec || 0.5}s)` : 'Aucune (Déjà P1)'}.
Voiture derrière: ${carBehind ? `P${carBehind.position} ${carBehind.name} (${carBehind.team}, à ${carBehind.gapSec || 0.5}s)` : 'Aucune (Dernier)'}.
Coéquipier: ${teammate ? `P${teammate.position} ${teammate.name}` : 'Non présent à proximité'}.
Rival direct: ${rival ? `P${rival.position} ${rival.name}` : 'Non présent à proximité'}.
Santé des pneus (vie restante) : ${tireWear !== undefined ? tireWear : 85}% (Note: 100% = neuf, 0% = détruit). ${tireWear > 50 ? 'Pneus en EXCELLENT ÉTAT / FRAIS : AUCUNE surchauffe !' : tireWear <= 35 ? 'Pneus TRÈS USÉS : Alerte dégradation requise.' : 'Usure modérée.'}
Génère un dilemme radio/piste hyper-réaliste et 100% cohérent avec P${userPosition}, la santé des pneus (${tireWear}%) et la stratégie ${stratAggro}.`;

  const aiText = await queryAI(prompt, systemPrompt);
  if (aiText) {
    const parsed = cleanAndParseJSON(aiText);
    if (parsed) {
      if (parsed.title) parsed.titre = parsed.title; // normalisation
      if (parsed.options && Array.isArray(parsed.options)) {
        return res.json({ success: true, dilemma: parsed });
      }
    }
  }

  res.json({ success: false, fallback: true });
});

// Route de dilemmes hors-piste / médias / paddock / sponsors générés par IA (Strictement 3 choix par course)
app.post("/api/ai/generate-offtrack-dilemma", async (req, res) => {
  const {
    driverName,
    driverAge,
    category,
    teamName,
    currentRaceIndex,
    totalRaces,
    nextCircuitName,
    lastRacePosition,
    championshipRank,
    championshipPoints,
    budget,
    reputation,
    rivalName,
    teammateName
  } = req.body;

  const systemPrompt = `Tu es le responsable presse, le directeur d'écurie et l'agent commercial du simulateur Pole Position X.
Tes questions et dilemmes DOIVENT ÊTRE 100% COHÉRENTS avec la saison du pilote ${driverName} (${driverAge} ans) chez ${teamName} en ${category}.

CONTRAT DE COHÉRENCE ET LIMITATION À 3 CHOIX :
1. Si le pilote vient de faire P${lastRacePosition || 'N/A'}, les journalistes (Canal+, L'Équipe, Eurosport) doivent EXPLICITEMENT faire référence à sa P${lastRacePosition} et à sa position au classement (P${championshipRank || 5} avec ${championshipPoints || 0} pts) !
2. Ne dis JAMAIS qu'il a gagné s'il a terminé P10 ou P15 !
3. Génère STRICTEMENT 3 dilemmes complets (1 Media, 1 Paddock, 1 Sponsor) :
   - Dilemme 1 (Media): Question de presse sur le dernier résultat (P${lastRacePosition}) et le prochain GP à ${nextCircuitName}.
   - Dilemme 2 (Paddock): Un choix technique/humain dans le stand avec ${teamName} (setup, débriefing, gestion du matériel).
   - Dilemme 3 (Sponsor): Un choix commercial ou sponsor (événement RP, prime de résultat, tournage pub).

4. Chaque dilemme DOIT comporter EXACTEMENT 4 ou 5 options de réponse variées avec des impacts réalistes (statsBoost, moneyChange, reputationChange, motivationChange, confianceDirecteurDelta, relationCoequipierDelta, tensionRivalDelta).

Réponds STRICTEMENT sous la forme d'un objet JSON avec cette clé "dilemmas" :
{
  "dilemmas": [
    {
      "id": "media-ai-1",
      "titre": "Presse : Débriefing après la P${lastRacePosition || 5} à la course précédente",
      "categorie": "Media",
      "interlocuteur": "Canal+ & L'Équipe",
      "description": "Question d'interview détaillée...",
      "options": [
        {
          "id": "m1-o1",
          "texte": "Intitulé court de la réponse",
          "description": "Description détaillée de l'attitude",
          "impacts": {
            "confianceDirecteurDelta": 10,
            "reputationChange": 5,
            "moneyChange": 2000,
            "motivationChange": 0.3,
            "statsBoost": { "regularite": 0.3 }
          }
        }
      ]
    },
    {
      "id": "paddock-ai-1",
      "titre": "Paddock : Configuration de la monoplace pour ${nextCircuitName}",
      "categorie": "Paddock",
      "interlocuteur": "Ingénieur de Piste",
      "description": "Choix technique dans le garage...",
      "options": [
        {
          "id": "p1-o1",
          "texte": "Intitulé court du choix",
          "description": "Description détaillée...",
          "impacts": {
            "confianceDirecteurDelta": 10,
            "statsBoost": { "vitesse": 0.3 }
          }
        }
      ]
    },
    {
      "id": "sponsor-ai-1",
      "titre": "Sponsor : Événement RP avant ${nextCircuitName}",
      "categorie": "Sponsor",
      "interlocuteur": "Directeur Marketing",
      "description": "Choix commercial...",
      "options": [
        {
          "id": "s1-o1",
          "texte": "Intitulé court du choix",
          "description": "Description détaillée...",
          "impacts": {
            "moneyChange": 15000,
            "reputationChange": 5
          }
        }
      ]
    }
  ]
}`;

  const prompt = `Génère STRICTEMENT 3 dilemmes hors-piste ultra-réalistes (1 Media, 1 Paddock, 1 Sponsor) pour ${driverName} (${teamName}, ${category}).
Dernière course : ${lastRacePosition ? `P${lastRacePosition}` : 'Toute première course de la saison'}.
Classement actuel : P${championshipRank || 10} (${championshipPoints || 0} pts).
Prochain GP : manche ${currentRaceIndex}/${totalRaces} à ${nextCircuitName}.
Budget pilote : ${budget || 10000} €, Réputation : ${reputation || 50}/100.
Rival : ${rivalName || 'Matteo Rossi'}, Coéquipier : ${teammateName || 'Lucas Moreau'}.`;

  const aiText = await queryAI(prompt, systemPrompt);
  if (aiText) {
    const parsed = cleanAndParseJSON(aiText);
    if (parsed) {
      if (parsed.dilemmas && Array.isArray(parsed.dilemmas) && parsed.dilemmas.length > 0) {
        return res.json({ success: true, dilemmas: parsed.dilemmas });
      }
    }
  }

  res.json({ success: false, fallback: true });
});

/**
 * Route principale /api/simular
 * Reçoit la requête utilisateur et retourne l'objet JSON strict demandé par les règles de jeu
 */
app.post("/api/simular", async (req, res) => {
  try {
    const { 
      action, // 'creation_pilote' | 'choix_equipe' | 'course' | 'fin_saison'
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

    // 1. Première interaction : Création de pilote
    if (action === 'creation_pilote' || (!action && nom && style && origine)) {
      const { driver, initialTeams, initialSponsors } = createInitialDriver(
        nom || 'Alexandre Moreau',
        nationalite || 'France',
        style || 'Équilibré',
        origine || 'Classe Moyenne Passionnée'
      );

      const systemMsg = `Bienvenue dans votre carrière Motorsport, ${driver.nom} ! En tant que pilote ${driver.style.toLowerCase()} issu d'une ${driver.origine.toLowerCase()}, vous commencez au niveau Karting avec un budget de ${driver.budget.toLocaleString()} €. Choisissez votre première écurie pour lancer votre saison.`;

      const responseJSON: GameResponseJSON = buildJSONResponse(
        'choix_equipe',
        driver,
        'Karting',
        initialTeams,
        initialSponsors,
        systemMsg
      );

      // Si l'IA (OpenRouter / Gemini) est disponible, enrichir le message système
      const aiPrompt = `Tu es le moteur logique backend d'une simulation de carrière motorsport. Un nouveau pilote est créé : ${driver.nom} (${driver.nationalite}), style: ${driver.style}, origine: ${driver.origine}, budget: ${driver.budget}€. Rédige un message système immersif et passionnant (2 phrases max en français) pour l'accueillir et introduire le choix de son écurie de karting.`;
      const aiResponseText = await queryAI(aiPrompt);
      if (aiResponseText) {
        responseJSON.messageSystème = aiResponseText;
      }

      return res.json(responseJSON);
    }

    // 2. Action choix d'écurie
    if (action === 'choix_equipe' && driverState && teamId) {
      const currentDriver: Driver = driverState;
      const categoryTeams = DEFAULT_TEAMS_BY_CATEGORY[categorie] || DEFAULT_TEAMS_BY_CATEGORY['Karting'];
      const selectedTeam = categoryTeams.find(t => t.id === teamId) || categoryTeams[0];

      // Déduire coût de la saison
      const updatedBudget = currentDriver.budget - selectedTeam.coutSaison;
      const updatedDriver: Driver = {
        ...currentDriver,
        budget: updatedBudget
      };

      const selectedSponsors = (sponsorIds && sponsorIds.length > 0)
        ? SPONSORS_POOL.filter(s => sponsorIds.includes(s.id))
        : [SPONSORS_POOL[0], SPONSORS_POOL[1]];

      const systemMsg = `Contrat signé avec succès chez ${selectedTeam.nom} ! Solde restant : ${updatedBudget.toLocaleString()} €. Objectif fixé par le team : "${selectedTeam.objectifSaison}". Rendez-vous sur le tableau de bord pour préparer la première course.`;

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

    // 3. Action de course
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

      // Mettre à jour le pilote
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

      const systemMsg = `Drapeau à damier à ${circuit.nom} ! Qualifications P${raceResult.positionQualif} -> Fin de course P${raceResult.positionFinale}. Points marqués : +${raceResult.pointsGagnes}. Gains : +${raceResult.gainFinancier.toLocaleString()} €. Réputation : ${updatedDriver.reputation}/100.`;

      const responseJSON = buildJSONResponse(
        'resultat_course',
        updatedDriver,
        categorie,
        categoryTeams,
        sponsors,
        systemMsg
      );

      // Inserer le détail de course dans la réponse
      (responseJSON as any).resultatDetaille = raceResult;

      return res.json(responseJSON);
    }

    // Default fallback initial
    const { driver, initialTeams, initialSponsors } = createInitialDriver('Alexandre Moreau', 'France', 'Équilibré', 'Classe Moyenne Passionnée');
    return res.json(buildJSONResponse('creation_pilote', driver, 'Karting', initialTeams, initialSponsors, "Initialisation de la carrière motorsport. Veuillez renseigner le nom, la nationalité, le style de pilotage et l'origine familiale."));

  } catch (error) {
    console.error("Error in /api/simular:", error);
    res.status(500).json({ error: "Erreur lors du calcul de la simulation" });
  }
});

/**
 * Route /api/gemini/commentary
 * Génère un commentaire en direct ou un compte-rendu de presse immersif
 */
app.post("/api/gemini/commentary", async (req, res) => {
  const { driverName, circuitName, position, weather, category, incident } = req.body;

  const prompt = `Tu es un commentateur télé exalté type Canal+ / F1 TV pour le championnat de ${category}.
Rédige un flash de commentaire télévisé ultra-dynamique (2 phrases grand max) sur le pilote ${driverName} qui vient de terminer la course à ${circuitName} en P${position} (conditions: ${weather}). Incidents notables: ${incident || 'aucun'}.
Ton ton doit être captivant, professionnel et réaliste !`;

  const commentary = await queryAI(prompt);
  if (commentary) {
    return res.json({ commentary });
  }

  res.json({ 
    commentary: `Flash info Paddock ${category} : ${driverName} franchit la ligne à ${circuitName} en P${position} sous des conditions ${weather}.`
  });
});

async function startServer() {
  // Vite middleware pour l'environnement de dev
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
    console.log(`Serveur Pole Position X démarré sur http://localhost:${PORT}`);
  });
}

startServer();
