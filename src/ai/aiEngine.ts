/**
 * ============================================================
 * F1 CAREER - AI ENGINE (VERSION GROQ)
 * ============================================================
 *
 * Ce fichier ne contient PLUS AUCUN appel direct à Gemini.
 * Il envoie maintenant les demandes IA au serveur :
 *
 *   POST /api/ai/generate-event
 *
 * Le serveur appelle Groq et renvoie un JSON valide.
 *
 * ============================================================
 */

// ------------------------------------------------------------
// TYPES
// ------------------------------------------------------------

export type AIEventType =
  | "MEDIA"
  | "PADDOCK"
  | "SPONSOR"
  | "RACE";

export interface GameState {
  season?: number;
  race?: string;
  circuit?: string;

  lap?: number;
  totalLaps?: number;

  player?: {
    driver?: string;
    team?: string;
    position?: number;

    tyre?: string;
    tyreWear?: number;

    fuel?: number;
    damage?: number;

    fastestLap?: boolean;
  };

  weather?: {
    condition?: string;
    rainProbability?: number;
    trackTemperature?: number;
  };

  raceControl?: {
    safetyCar?: boolean;
    virtualSafetyCar?: boolean;
    yellowFlag?: boolean;
    redFlag?: boolean;
    blueFlag?: boolean;
  };

  nearbyCars?: {
    ahead?: {
      driver?: string;
      team?: string;
      gap?: number;
      tyre?: string;
    };

    behind?: {
      driver?: string;
      team?: string;
      gap?: number;
      tyre?: string;
    };
  };

  championship?: {
    playerPoints?: number;
    playerPosition?: number;
  };

  relationships?: Record<string, number>;

  careerHistory?: string[];
}

export interface AIChoice {
  id: string;
  label: string;

  description?: string;

  effects?: Record<string, number>;

  action?: string;
}

export interface AIEvent {
  type: AIEventType;

  title: string;

  description: string;

  urgency?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

  choices: AIChoice[];

  tags?: string[];

  duration?: number;
}

// ------------------------------------------------------------
// SYSTEM PROMPT
// ------------------------------------------------------------

const SYSTEM_PROMPT = `
Tu es l'intelligence artificielle principale du jeu vidéo
"F1 CAREER".

Tu simules l'univers d'une carrière de pilote de Formule 1.

Ton rôle est de créer des situations réalistes, cohérentes
et dynamiques autour du joueur.

============================================================
RÈGLES PRINCIPALES
============================================================

1. Tu dois TOUJOURS respecter l'état actuel de la partie.
2. Tu ne dois jamais inventer une situation impossible.
3. Tu ne dois jamais modifier directement le GameState.
4. Tu dois uniquement proposer un événement et des choix.
5. Le moteur du jeu décidera ensuite si les conséquences
   sont réellement appliquées.
6. Les choix doivent être différents et avoir des risques
   ou avantages différents.
7. Les situations doivent être crédibles dans le contexte
   d'une saison de Formule 1.
8. Évite de générer constamment des accidents ou des drapeaux.
9. Les événements doivent être variés.
10. Ne génère jamais une situation contradictoire avec
    la météo, la position du joueur, le tour ou les voitures
    présentes autour de lui.

============================================================
COURSE
============================================================

Pendant une course, tu peux générer :

- dépassement
- opportunité de dépassement
- défense
- attaque
- erreur d'un concurrent
- accident
- débris
- crevaison
- problème mécanique
- problème de température
- problème de freins
- problème moteur
- track limits
- avertissement
- pénalité
- drapeau jaune
- double drapeau jaune
- drapeau bleu
- drapeau rouge
- Virtual Safety Car
- Safety Car
- météo changeante
- pluie
- piste séchante
- changement de stratégie
- arrêt aux stands
- voiture lente
- incident avec un concurrent

============================================================
MÉDIAS / PADDOCK / SPONSORS
============================================================

Respecte les règles déjà définies dans le jeu.

============================================================
SORTIE
============================================================

Tu dois répondre UNIQUEMENT avec un objet JSON valide.
Aucun markdown.
Aucun texte avant ou après le JSON.
`;

// ------------------------------------------------------------
// JSON SCHEMA
// ------------------------------------------------------------

const AI_EVENT_SCHEMA = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["MEDIA", "PADDOCK", "SPONSOR", "RACE"] },
    title: { type: "string" },
    description: { type: "string" },
    urgency: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
    choices: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          description: { type: "string" },
          action: { type: "string" },
          effects: {
            type: "object",
            additionalProperties: { type: "number" },
          },
        },
        required: ["id", "label"],
      },
    },
    tags: { type: "array", items: { type: "string" } },
    duration: { type: "number" },
  },
  required: ["type", "title", "description", "choices"],
};

// ------------------------------------------------------------
// UTILS
// ------------------------------------------------------------

function cleanGameState(gameState: GameState): string {
  return JSON.stringify(gameState, null, 2);
}

function validateEvent(event: AIEvent): AIEvent {
  if (!event.type) throw new Error("L'IA n'a pas retourné de type.");
  if (!event.title) throw new Error("L'IA n'a pas retourné de titre.");
  if (!event.description) throw new Error("L'IA n'a pas retourné de description.");
  if (!Array.isArray(event.choices)) throw new Error("L'IA n'a pas retourné de choix.");
  if (event.choices.length < 2) throw new Error("Il faut au moins 2 choix.");
  return event;
}

// ------------------------------------------------------------
// APPEL AU SERVEUR (GROQ)
// ------------------------------------------------------------

async function callServerAI(
  type: AIEventType,
  gameState: GameState,
  typeInstructions: string
): Promise<string> {
  const response = await fetch("/api/ai/generate-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      gameState,
      systemPrompt: SYSTEM_PROMPT,
      typeInstructions,
      cleanState: cleanGameState(gameState),
      schema: AI_EVENT_SCHEMA,
    }),
  });

  if (!response.ok) {
    throw new Error("Erreur IA serveur : " + response.statusText);
  }

  const data = await response.json();
  return data.result;
}

// ------------------------------------------------------------
// GENERATE EVENT
// ------------------------------------------------------------

export async function generateAIEvent(
  type: AIEventType,
  gameState: GameState
): Promise<AIEvent> {
  const typeInstructions = getTypeInstructions(type);

  const result = await callServerAI(type, gameState, typeInstructions);

  const parsed = JSON.parse(result);

  return validateEvent(parsed);
}

// ------------------------------------------------------------
// INSTRUCTIONS PAR TYPE
// ------------------------------------------------------------

function getTypeInstructions(type: AIEventType): string {
  switch (type) {
    case "MEDIA":
      return `
Génère une question réaliste d'un journaliste.
Les choix doivent représenter différentes façons de répondre.
`;
    case "PADDOCK":
      return `
Génère une situation dans le paddock avec une décision importante.
`;
    case "SPONSOR":
      return `
Génère une situation impliquant un sponsor avec plusieurs choix.
`;
    case "RACE":
      return `
Génère une situation pendant la course en respectant l'état actuel.
`;
    default:
      return "";
  }
}

// ------------------------------------------------------------
// RACCOURCIS
// ------------------------------------------------------------

export async function generateMediaEvent(gameState: GameState) {
  return generateAIEvent("MEDIA", gameState);
}

export async function generatePaddockEvent(gameState: GameState) {
  return generateAIEvent("PADDOCK", gameState);
}

export async function generateSponsorEvent(gameState: GameState) {
  return generateAIEvent("SPONSOR", gameState);
}

export async function generateRaceEvent(gameState: GameState) {
  return generateAIEvent("RACE", gameState);
}
