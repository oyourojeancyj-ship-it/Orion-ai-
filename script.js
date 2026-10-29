/* =========================================================
   ORION AI — SCRIPT COMPLET
========================================================= */

const URL_ORION =
  "https://script.google.com/macros/s/AKfycby14FlatgnZG5E1Z6vgoSSbGzPkRcB-7Sv2h3qxq6t-sg9iaBUoSTnz2rl7IRL9VgkO/exec";

const STORAGE_KEY = "orion_conversations";

let conversations = [];
let currentConversationId = null;
let voiceEnabled = true;


/* =========================================================
   OUTILS
========================================================= */

function $(id) {
  return document.getElementById(id);
}


/* =========================================================
   STOCKAGE
========================================================= */

try {
  const saved = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  conversations =
    Array.isArray(saved) ? saved : [];

} catch (error) {
  console.error("Erreur stockage :", error);
  conversations = [];
}


function saveConversations() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(conversations)
  );
}


function makeId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}


function getCurrentConversation() {
  return conversations.find(
    conversation =>
      conversation.id === currentConversationId
  );
}


/* =========================================================
   TOAST
========================================================= */

function toast(message) {

  const element = $("toast");

  if (!element) return;

  element.textContent = message;

  element.classList.add("show");

  clearTimeout(window.orionToastTimer);

  window.orionToastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2200);
}


/* =========================================================
   MENU
========================================================= */

function ouvrirMenu() {

  $("sidebar")?.classList.add("open");
  $("overlay")?.classList.add("show");
}


function fermerMenu() {

  $("sidebar")?.classList.remove("open");
  $("overlay")?.classList.remove("show");
}


/* =========================================================
   ACTIONS
========================================================= */

function ouvrirActions() {

  $("actionSheet")?.classList.add("show");
}


function fermerActions() {

  $("actionSheet")?.classList.remove("show");
}


/* =========================================================
   MODALES
========================================================= */

function ouvrirModal(id) {

  $(id)?.classList.add("show");
}


function fermerModal(id) {

  $(id)?.classList.remove("show");
}


/* =========================================================
   CONVERSATIONS
========================================================= */

function creerConversation() {

  const conversation = {

    id: makeId(),

    title: "Nouvelle discussion",

    messages: []

  };

  conversations.unshift(conversation);

  currentConversationId =
    conversation.id;

  saveConversations();

  afficherConversations();

  return conversation;
}


function afficherConversations() {

  const list =
    $("conversationList");

  if (!list) return;

  list.innerHTML = "";

  if (!conversations.length) {

    const empty =
      document.createElement("div");

    empty.textContent =
      "Aucune discussion";

    empty.style.padding =
      "12px";

    empty.style.color =
      "var(--muted)";

    empty.style.fontSize =
      "13px";

    list.appendChild(empty);

    return;
  }

  conversations.forEach(
    conversation => {

      const item =
        document.createElement("div");

      item.className =
        "conversation-item";

      const title =
        document.createElement("span");

      title.textContent =
        "💬 " +
        (
          conversation.title ||
          "Nouvelle discussion"
        );

      const options =
        document.createElement("span");

      options.className =
        "conversation-options";

      options.textContent =
        "⋯";

      item.appendChild(title);

      item.appendChild(options);

      title.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          ouvrirConversation(
            conversation.id
          );

        }
      );

      options.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          afficherOptionsConversation(
            conversation.id
          );

        }
      );

      item.addEventListener(
        "click",
        () => {

          ouvrirConversation(
            conversation.id
          );

        }
      );

      list.appendChild(item);

    }
  );
}


function afficherOptionsConversation(id) {

  const conversation =
    conversations.find(
      item => item.id === id
    );

  if (!conversation) return;

  const choix =
    window.prompt(
      "1 = Renommer\n2 = Supprimer\n\nChoisis une option :"
    );

  if (choix === "1") {

    const nouveauNom =
      window.prompt(
        "Nouveau nom :",
        conversation.title ||
        "Nouvelle discussion"
      );

    if (
      nouveauNom &&
      nouveauNom.trim()
    ) {

      conversation.title =
        nouveauNom.trim();

      saveConversations();

      afficherConversations();

      toast(
        "Discussion renommée"
      );

    }
  }

  if (choix === "2") {

    const confirmation =
      window.confirm(
        "Supprimer cette discussion ?"
      );

    if (confirmation) {

      supprimerConversation(id);

    }
  }
}


function supprimerConversation(id) {

  conversations =
    conversations.filter(
      conversation =>
        conversation.id !== id
    );

  if (
    currentConversationId === id
  ) {

    currentConversationId =
      null;

    afficherAccueil();

  }

  saveConversations();

  afficherConversations();

  toast(
    "Discussion supprimée"
  );
}


/* =========================================================
   OUVRIR DISCUSSION
========================================================= */

function ouvrirConversation(id) {

  const conversation =
    conversations.find(
      item => item.id === id
    );

  if (!conversation) return;

  currentConversationId = id;

  fermerMenu();

  const chat = $("chat");

  if (!chat) return;

  chat.innerHTML =
    '<div class="day-label">Aujourd’hui</div>';

  if (
    !Array.isArray(
      conversation.messages
    ) ||
    conversation.messages.length === 0
  ) {

    afficherAccueil();

    return;
  }

  conversation.messages.forEach(
    message => {

      if (
        message.role === "user"
      ) {

        ajouterMessageUtilisateur(
          message.text,
          false
        );

      } else {

        ajouterMessageBot(
          message.text,
          false,
          false
        );

      }

    }
  );

  chat.scrollTop =
    chat.scrollHeight;
}


/* =========================================================
   ACCUEIL
========================================================= */

function afficherAccueil() {

  const chat = $("chat");

  if (!chat) return;

  chat.innerHTML = `
    <div class="day-label">
      Aujourd’hui
    </div>

    <div class="message-row bot-row">

      <div class="avatar">
        ✦
      </div>

      <div class="message-bubble bot-bubble">
        Bonjour ! Ravi de te retrouver. 🤖
      </div>

    </div>
  `;
}


/* =========================================================
   MESSAGE UTILISATEUR
========================================================= */

function ajouterMessageUtilisateur(
  text,
  save = true
) {

  const chat = $("chat");

  if (!chat) return;

  const row =
    document.createElement("div");

  row.className =
    "message-row user-row";

  const bubble =
    document.createElement("div");

  bubble.className =
    "message-bubble user-bubble";

  bubble.textContent = text;

  row.appendChild(bubble);

  chat.appendChild(row);

  if (save) {

    const conversation =
      getCurrentConversation();

    if (conversation) {

      if (
        !Array.isArray(
          conversation.messages
        )
      ) {

        conversation.messages = [];

      }

      conversation.messages.push({

        role: "user",

        text: text

      });

      if (
        conversation.title ===
        "Nouvelle discussion"
      ) {

        conversation.title =
          text.slice(0, 35) ||
          "Nouvelle discussion";

      }

      saveConversations();

      afficherConversations();

    }
  }

  chat.scrollTop =
    chat.scrollHeight;
}


/* =========================================================
   MESSAGE ORION
========================================================= */

function ajouterMessageBot(
  text,
  save = true,
  speak = true
) {

  const chat = $("chat");

  if (!chat) return;

  const row =
    document.createElement("div");

  row.className =
    "message-row bot-row";

  const avatar =
    document.createElement("div");

  avatar.className =
    "avatar";

  avatar.textContent =
    "✦";

  const bubble =
    document.createElement("div");

  bubble.className =
    "message-bubble bot-bubble";

  bubble.textContent = text;

  row.appendChild(avatar);

  row.appendChild(bubble);

  chat.appendChild(row);

  if (save) {

    const conversation =
      getCurrentConversation();

    if (conversation) {

      if (
        !Array.isArray(
          conversation.messages
        )
      ) {

        conversation.messages = [];

      }

      conversation.messages.push({

        role: "model",

        text: text

      });

      saveConversations();

    }
  }

  chat.scrollTop =
    chat.scrollHeight;

  if (
    speak &&
    voiceEnabled
  ) {

    parler(text);

  }
}


/* =========================================================
   RÉFLEXION
========================================================= */

function afficherReflexion() {

  const chat = $("chat");

  if (!chat) return null;

  const row =
    document.createElement("div");

  row.className =
    "message-row bot-row";

  const avatar =
    document.createElement("div");

  avatar.className =
    "avatar";

  avatar.textContent =
    "✦";

  const bubble =
    document.createElement("div");

  bubble.className =
    "message-bubble bot-bubble";

  bubble.innerHTML = `
    <span class="thinking-text">
      ORION réfléchit
    </span>

    <span class="thinking-dots">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </span>
  `;

  row.appendChild(avatar);

  row.appendChild(bubble);

  chat.appendChild(row);

  chat.scrollTop =
    chat.scrollHeight;

  return row;
}


/* =========================================================
   CRÉATEUR
========================================================= */

function questionSurLeCreateur(text) {

  const t =
    String(text).toLowerCase();

  return (
    t.includes("qui t'a créé") ||
    t.includes("qui t'a cree") ||
    t.includes("qui t'as créé") ||
    t.includes("qui t'as cree") ||
    t.includes("ton créateur") ||
    t.includes("ton createur") ||
    t.includes("qui est ton créateur") ||
    t.includes("qui est ton createur")
  );
}


/* =========================================================
   ENVOYER À GEMINI
========================================================= */

async function envoyer() {

  const input =
    $("message");

  if (!input) return;

  const text =
    input.value.trim();

  if (!text) return;


  if (
    questionSurLeCreateur(text)
  ) {

    if (!currentConversationId) {

      creerConversation();

    }

    input.value = "";

    ajouterMessageUtilisateur(
      text
    );

    ajouterMessageBot(
      "Je suis ORION AI, et mon créateur est Jeancy Oyouro, un jeune créateur de 15 ans. 🤖✨"
    );

    return;
  }


  if (!currentConversationId) {

    creerConversation();

  }

  input.value = "";

  ajouterMessageUtilisateur(
    text
  );

  const thinking =
    afficherReflexion();


  try {

    const conversation =
      getCurrentConversation();

    const historique =
      conversation?.messages || [];

    const url =
      URL_ORION +
      "?message=" +
      encodeURIComponent(
        JSON.stringify(
          historique
        )
      );

    let response = null;

    let data = null;


    for (
      let tentative = 1;
      tentative <= 3;
      tentative++
    ) {

      try {

        const controller =
          new AbortController();

        const timeout =
          setTimeout(
            () => {
              controller.abort();
            },
            20000
          );

        response =
          await fetch(
            url,
            {
              method: "GET",
              signal:
                controller.signal,
              cache:
                "no-store"
            }
          );

        clearTimeout(timeout);

        if (
          response.ok
        ) {

          data =
            await response.json();

          break;
        }

        console.warn(
          "ORION tentative",
          tentative,
          "HTTP",
          response.status
        );

      } catch (error) {

        console.warn(
          "ORION tentative",
          tentative,
          "échouée",
          error
        );
      }

      if (
        tentative < 3
      ) {

        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              tentative * 1200
            )
        );

      }
    }


    thinking?.remove();


    if (
      !response ||
      !response.ok ||
      !data
    ) {

      throw new Error(
        "Serveur ORION indisponible"
      );

    }


    const answer =
      data.reponse ||
      data.response ||
      data.text;


    if (!answer) {

      throw new Error(
        "Réponse vide"
      );

    }


    ajouterMessageBot(
      answer
    );


  } catch (error) {

    thinking?.remove();

    console.error(
      "Erreur ORION :",
      error
    );

    ajouterMessageBot(
      "Désolé, ORION n'arrive pas à contacter Gemini pour le moment. 🤖 Réessaie dans quelques instants."
    );
  }
}


window.envoyer =
  envoyer;


/* =========================================================
   VOIX
========================================================= */

function parler(text) {

  if (
    !voiceEnabled ||
    !("speechSynthesis" in window)
  ) {

    return;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(
      text
    );

  utterance.lang =
    "fr-FR";

  utterance.rate =
    1;

  utterance.pitch =
    1;

  window.speechSynthesis.speak(
    utterance
  );
}


function changerVoix() {

  voiceEnabled =
    !voiceEnabled;

  const button =
    $("voiceToggle");

  const status =
    $("voiceStatus");

  if (button) {

    button.textContent =
      voiceEnabled
        ? "🔊"
        : "🔇";
  }

  if (status) {

    status.textContent =
      voiceEnabled
        ? "Activée"
        : "Désactivée";
  }

  if (
    !voiceEnabled &&
    "speechSynthesis" in window
  ) {

    window.speechSynthesis.cancel();

  }

  toast(
    voiceEnabled
      ? "Voix activée"
      : "Voix désactivée"
  );
}


/* =========================================================
   NOUVEAU CHAT
========================================================= */

function nouveauChat() {

  fermerMenu();

  fermerActions();

  creerConversation();

  afficherAccueil();

  toast(
    "Nouveau chat créé"
  );
}


/* =========================================================
   DEVOIRS
========================================================= */

function devoirs() {

  fermerMenu();

  fermerActions();

  const input =
    $("message");

  if (input) {

    input.value =
      "Aide-moi à faire mon devoir :";

    input.focus();

  }

  toast(
    "Mode devoirs prêt 📚"
  );
}


/* =========================================================
   IMAGE
========================================================= */

function choisirImage() {

  fermerMenu();

  fermerActions();

  $("imageInput")?.click();
}


/* =========================================================
   ANALYSER IMAGE
========================================================= */

async function analyserImage(file) {

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload =
    async () => {

      try {

        const result =
          String(
            reader.result
          );

        const base64 =
          result.split(",")[1];

        if (!currentConversationId) {
          creerConversation();
        }

        ajouterMessageUtilisateur(
          "🖼️ J’ai envoyé une image pour analyse."
        );

        const thinking =
          afficherReflexion();

        const response =
          await fetch(
            URL_ORION,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "text/plain;charset=utf-8"
              },

              body:
                JSON.stringify({

                  type: "image",

                  image: base64,

                  mimeType:
                    file.type

                })
            }
          );

        if (!response.ok) {

          throw new Error(
            "Serveur HTTP " +
            response.status
          );

        }

        const data =
          await response.json();

        thinking?.remove();

        const answer =
          data.reponse ||
          data.response ||
          data.text ||
          "Je n’ai pas pu analyser cette image.";

        ajouterMessageBot(
          answer
        );

      } catch (error) {

        console.error(
          "Erreur image :",
          error
        );

        toast(
          "Erreur pendant l’analyse de l’image."
        );

        ajouterMessageBot(
          "Impossible d’analyser cette image pour le moment."
        );

      }

    };

  reader.readAsDataURL(file);
}


/* =========================================================
   THÈME
========================================================= */

function changerTheme() {

  document.body.classList.toggle(
    "light"
  );

  const light =
    document.body.classList.contains(
      "light"
    );

  localStorage.setItem(
    "orion_theme",
    light
      ? "light"
      : "dark"
  );

  const button =
    $("themeBtn");

  if (button) {

    button.textContent =
      light
        ? "☀️"
        : "☾";
  }
}


function restaurerTheme() {

  const theme =
    localStorage.getItem(
      "orion_theme"
    );

  const button =
    $("themeBtn");

  if (
    theme === "light"
  ) {

    document.body.classList.add(
      "light"
    );

    if (button) {
      button.textContent =
        "☀️";
    }

  } else {

    document.body.classList.remove(
      "light"
    );

    if (button) {
      button.textContent =
        "☾";
    }
  }
}


/* =========================================================
   PARAMÈTRES
========================================================= */

function ouvrirParametres() {

  fermerMenu();

  ouvrirModal(
    "settingsModal"
  );
}


/* =========================================================
   COMPTE
========================================================= */

function ouvrirCompte() {

  fermerMenu();

  ouvrirModal(
    "accountModal"
  );
}


function ouvrirGoogle() {

  toast(
    "La connexion Google sera ajoutée avec Google Identity Services."
  );
}


/* =========================================================
   DÉCONNEXION
========================================================= */

function deconnecter() {

  fermerMenu();

  const confirmation =
    window.confirm(
      "Se déconnecter d’ORION sur cet appareil ?"
    );

  if (!confirmation) return;

  currentConversationId =
    null;

  afficherAccueil();

  toast(
    "Déconnexion locale effectuée"
  );
}


/* ======================================================   EFFACER CHAT
========================================================= */

function effacerChat() {

  const conversation =
    getCurrentConversation();

  if (!conversation) return;

  const confirmation =
    window.confirm(
      "Effacer tous les messages de cette discussion ?"
    );

  if (!confirmation) return;

  conversation.messages = [];

  conversation.title =
    "Nouvelle discussion";

  saveConversations();

  afficherConversations();

  afficherAccueil();

  toast(
    "Conversation effacée"
  );
}


/* =========================================================
   MICRO
========================================================= */

function lancerMicro() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {

    toast(
      "La reconnaissance vocale n’est pas disponible sur ce navigateur."
    );

    return;
  }

  const recognition =
    new SpeechRecognition();

  recognition.lang = "fr-FR";

  recognition.interimResults = false;

  recognition.maxAlternatives = 1;

  recognition.onstart = () => {

    toast("Je t’écoute… 🎙️");

  };

  recognition.onresult = event => {

    const text =
      event.results[0][0].transcript;

    const input =
      $("message");

    if (input) {

      input.value = text;

      input.focus();

    }

  };

  recognition.onerror = () => {

    toast(
      "Je n’ai pas réussi à utiliser le microphone."
    );

  };

  recognition.start();
}


/* =========================================================
   DÉMARRAGE ORION
========================================================= */

function demarrerORION() {

  currentConversationId = null;

  afficherConversations();

  afficherAccueil();

  restaurerTheme();
}


/* =========================================================
   BOUTONS
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    $("menuBtn")?.addEventListener(
      "click",
      ouvrirMenu
    );

    $("closeMenuBtn")?.addEventListener(
      "click",
      fermerMenu
    );

    $("overlay")?.addEventListener(
      "click",
      fermerMenu
    );

    $("newChatBtn")?.addEventListener(
      "click",
      nouveauChat
    );

    $("homeworkBtn")?.addEventListener(
      "click",
      devoirs
    );

    $("imageBtn")?.addEventListener(
      "click",
      choisirImage
    );

    $("settingsBtn")?.addEventListener(
      "click",
      ouvrirParametres
    );

    $("accountBtn")?.addEventListener(
      "click",
      ouvrirCompte
    );

    $("disconnectBtn")?.addEventListener(
      "click",
      deconnecter
    );

    $("themeBtn")?.addEventListener(
      "click",
      changerTheme
    );

    $("voiceToggle")?.addEventListener(
      "click",
      changerVoix
    );

    $("microBtn")?.addEventListener(
      "click",
      lancerMicro
    );

    $("sendBtn")?.addEventListener(
      "click",
      envoyer
    );

    $("imageInput")?.addEventListener(
      "change",
      event => {

        const file =
          event.target.files?.[0];

        if (file) {

          analyserImage(file);

        }

        event.target.value = "";

      }
    );

    $("message")?.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();

          envoyer();

        }

      }
    );

    demarrerORION();

  }
);window.addEventListener("load", function () {
  const splash = document.getElementById("splash");

  if (splash) {
    setTimeout(function () {
      splash.classList.add("hide");
    }, 1500);
  }
});