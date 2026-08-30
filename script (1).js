const URL_ORION = "https://script.google.com/macros/s/AKfycbzwXxBg9p_9sazSvaf5pOYYTpsRugzyqp0UtSOYD9b05wC0qhTJAxF9K-ytpvA0qLZa/exec";

let voiceEnabled = true;
let recognition = null;let historique = JSON.parse(
  localStorage.getItem("orionHistorique") || "[]"
);

const $ = (id) => document.getElementById(id);

/* MESSAGE EN BAS DE L'ÉCRAN */
function toast(message) {
  const box = $("toast");
  box.textContent = message;
  box.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    box.classList.remove("show");
  }, 2200);
}

/* VOIX D'ORION */
function speak(text) {
  if (!voiceEnabled || !text) return;
  if (!("speechSynthesis" in window)) return;

  speechSynthesis.cancel();

  const voice = new SpeechSynthesisUtterance(text);
  voice.lang = "fr-FR";
  voice.rate = 0.9;
  voice.pitch = 1;

  speechSynthesis.speak(voice);
}

/* MESSAGE DE L'UTILISATEUR */
function addUserMessage(text) {
  const chat = $("chat");

  const message = document.createElement("p");
  message.textContent = "👤 Toi : " + text;

  message.style.marginLeft = "auto";
  message.style.background =
    "linear-gradient(135deg, #1768ee, #315cff)";
  message.style.color = "white";

  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

/* MESSAGE D'ORION */
function addBotMessage(text) {
  const row = document.createElement("div");
  row.className = "message-row bot-row";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "✦";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble bot-bubble";
  bubble.textContent = text;

  row.appendChild(avatar);
  row.appendChild(bubble);

  $("chat").appendChild(row);
  $("chat").scrollTop = $("chat").scrollHeight;

  speak(text);
}

/* RÉPONSES DE SECOURS */
function localReply(message) {
  const m = message.toLowerCase();

  if (m.includes("bonjour") || m.includes("salut")) {
    return "Bonjour ! Ravi de discuter avec toi. 🤖";
  }

  if (m.includes("comment vas-tu") || m.includes("ça va")) {
    return "Je vais très bien ! Merci de me le demander. 🤖";
  }

  if (m.includes("qui es-tu") || m.includes("tu es qui")) {
    return "Je suis ORION AI, ton assistant intelligent. 🤖";
  }

  if (m.includes("merci")) {
    return "Avec plaisir ! 😊";
  }

  return "Je suis ORION AI 🤖. Mon intelligence avancée sera connectée dans une prochaine étape.";
}


/* ENVOYER UN MESSAGE */
window.envoyer = async function () {

  const input = $("message");
  const message = input.value.trim();

  if (message === "") return;

  addUserMessage(message);
  input.value = "";

  const thinking = document.createElement("p");
  thinking.id = "orionThinking";
  thinking.textContent = "🤖 ORION réfléchit…";
  $("chat").appendChild(thinking);

  try {

 historique.push({
  role: "user",
  text: message
});localStorage.setItem(
  "orionHistorique",
  JSON.stringify(historique)
);
    

const response = await fetch(
  URL_ORION +
  "?message=" +
  encodeURIComponent(JSON.stringify(historique))
);

  const data = await response.json(); 

    $("orionThinking")?.remove();

    if (data.reponse) {
  addBotMessage(data.reponse);

  historique.push({
    role: "model",
    text: data.reponse
  });

} else {
  addBotMessage("Je n'ai pas reçu de réponse.");
}

  } catch (error) {

    $("orionThinking")?.remove();

    addBotMessage("❌ Impossible de contacter ORION.");

    console.error(error);
  }
};


/* MENU GAUCHE */
function ouvrirMenu() {

  $("sidebar").classList.add("open");
  $("overlay").classList.add("show");
}

function fermerMenu() {
  $("sidebar").classList.remove("open");
  $("overlay").classList.remove("show");
}


/* MENU + */
function ouvrirActions() {
  $("actionSheet").classList.add("open");
}

function fermerActions() {
  $("actionSheet").classList.remove("open");
}


/* PARAMÈTRES */
function ouvrirParametres() {
  fermerMenu();
  $("settingsModal").classList.add("open");
}

function fermerParametres() {
  $("settingsModal").classList.remove("open");
}


/* COMPTE */
function ouvrirCompte() {
  fermerMenu();
  $("accountModal").classList.add("open");
}

function fermerCompte() {
  $("accountModal").classList.remove("open");
}


/* NOUVEAU CHAT */
function nouveauChat() {

  $("chat").innerHTML = `
    <div class="day-label">Nouveau chat</div>

    <div class="message-row bot-row">

      <div class="avatar">✦</div>

      <div class="message-bubble bot-bubble">
        Nouveau chat créé. Je suis prêt ! 🤖
      </div>

    </div>
  `;

  fermerActions();
  fermerMenu();

  toast("Nouveau chat créé");
}


/* DEVOIRS */
function ouvrirDevoirs() {

  fermerActions();
  fermerMenu();

  $("message").focus();

  toast("Mode devoirs activé 📚");

  addBotMessage(
    "Mode devoirs activé 📚. Écris ton exercice et je pourrai t'aider à le comprendre."
  );
}


/* IMAGE */
function choisirImage() {

  $("imageInput").click();

  fermerActions();
  fermerMenu();
}


/* THÈME */
function changerTheme() {

  document.body.classList.toggle("light");

  const clair =
    document.body.classList.contains("light");

  localStorage.setItem(
    "orionTheme",
    clair ? "light" : "dark"
  );

  $("themeBtn").textContent =
    clair ? "☀️" : "☾";

  toast(
    clair
      ? "Thème clair activé"
      : "Thème sombre activé"
  );
}


/* CHARGER LE THÈME */
function chargerTheme() {

  const clair =
    localStorage.getItem("orionTheme") === "light";

  document.body.classList.toggle("light", clair);

  $("themeBtn").textContent =
    clair ? "☀️" : "☾";
}


/* VOIX ON/OFF */
function changerVoix() {

  voiceEnabled = !voiceEnabled;

  $("voiceToggle").textContent =
    voiceEnabled ? "🔊" : "🔇";

  $("voiceStatus").textContent =
    voiceEnabled ? "Activée" : "Désactivée";

  if (!voiceEnabled && "speechSynthesis" in window) {
    speechSynthesis.cancel();
  }

  toast(
    voiceEnabled
      ? "Voix activée 🔊"
      : "Voix désactivée 🔇"
  );
}


/* EFFACER LA CONVERSATION */
function effacerChat() {

  nouveauChat();

  fermerParametres();

  toast("Conversation effacée");
}


/* MICRO */
function lancerMicro() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {

    toast(
      "La dictée vocale n'est pas disponible ici."
    );

    return;
  }

  if (recognition) {

    recognition.stop();
    recognition = null;

    toast("Dictée arrêtée");

    return;
  }

  recognition = new SpeechRecognition();

  recognition.lang = "fr-FR";
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = function () {

    $("micBtn").textContent = "🔴";

    toast("Je t'écoute…");
  };

  recognition.onresult = function (event) {

    let texte = "";

    for (
      let i = event.resultIndex;
      i < event.results.length;
      i++
    ) {
      texte +=
        event.results[i][0].transcript;
    }

    $("message").value = texte;
  };

  recognition.onerror = function () {

    toast("Impossible d'utiliser le micro.");
  };

  recognition.onend = function () {

    $("micBtn").textContent = "🎙️";

    recognition = null;
  };

  recognition.start();
}


/* IMAGE SÉLECTIONNÉE */
function imageChoisie(event) {

  const file = event.target.files[0];

  if (!file) return;if (!file.type.startsWith("image/")) {
  toast("Choisis une image.");
  return;
}const reader = new FileReader();

reader.onload = function () {
  const base64 = reader.result.split(",")[1];

  console.log("Image prête pour ORION :", base64.length);

  analyserImageAvecOrion(base64, file.type);
};
 
reader.readAsDataURL(file);

  toast("Image sélectionnée 🖼️");

  const url =
    URL.createObjectURL(file);

  const row =
    document.createElement("div");

  row.className =
    "message-row bot-row";

  const avatar =
    document.createElement("div");

  avatar.className =
    "avatar";

  avatar.textContent = "🖼️";

  const bubble =
    document.createElement("div");

  bubble.className =
    "message-bubble bot-bubble";

  const image =
    document.createElement("img");

  image.src = url;

  image.style.maxWidth = "100%";
  image.style.borderRadius = "12px";
  image.style.display = "block";

  const texte =
    document.createElement("div");

  texte.textContent =
    "Image ajoutée. L'analyse d'image sera connectée ensuite.";

  texte.style.marginTop = "8px";

  bubble.appendChild(image);
  bubble.appendChild(texte);

  row.appendChild(avatar);
  row.appendChild(bubble);

  $("chat").appendChild(row);

  $("chat").scrollTop =
    $("chat").scrollHeight;

  event.target.value = "";
}


/* DÉCONNEXION */
function deconnecter() {

  localStorage.removeItem("orionLoggedIn");

  fermerMenu();

  toast("Session ORION déconnectée");
}


/* GOOGLE */
function ouvrirGoogle() {

  window.open(
    "https://accounts.google.com/",
    "_blank"
  );

  toast("Page Google ouverte");
}


/* DÉMARRAGE */
document.addEventListener(
  "DOMContentLoaded",
  function () {    if (historique.length > 0) {
      historique.forEach(function (item) {
        if (item.role === "user") {
          addUserMessage(item.text);
        } else if (item.role === "model") {
          addBotMessage(item.text);
        }
      });
    }

    chargerTheme();


    /* MENU */

    $("menuBtn").addEventListener(
      "click",
      ouvrirMenu
    );

    $("closeMenuBtn").addEventListener(
      "click",
      fermerMenu
    );

    $("overlay").addEventListener(
      "click",
      fermerMenu
    );


    /* THÈME */

    $("themeBtn").addEventListener(
      "click",
      changerTheme
    );


    /* + */

    $("plusBtn").addEventListener(
      "click",
      ouvrirActions
    );

    $("closeActions").addEventListener(
      "click",
      fermerActions
    );


    /* NOUVEAU CHAT */

    $("newChatBtn").addEventListener(
      "click",
      nouveauChat
    );

    $("newChatAction").addEventListener(
      "click",
      nouveauChat
    );


    /* DEVOIRS */

    $("homeworkBtn").addEventListener(
      "click",
      ouvrirDevoirs
    );

    $("homeworkAction").addEventListener(
      "click",
      ouvrirDevoirs
    );


    /* IMAGES */

    $("imageBtn").addEventListener(
      "click",
      choisirImage
    );

    $("imageAction").addEventListener(
      "click",
      choisirImage
    );

    $("imageBtnBottom").addEventListener(
      "click",
      choisirImage
    );


    /* PARAMÈTRES */

    $("settingsBtn").addEventListener(
      "click",
      ouvrirParametres
    );

    $("closeSettings").addEventListener(
      "click",
      fermerParametres
    );


    /* COMPTE */

    $("accountBtn").addEventListener(
      "click",
      ouvrirCompte
    );

    $("closeAccount").addEventListener(
      "click",
      fermerCompte
    );

    $("googleLoginBtn").addEventListener(
      "click",
      ouvrirGoogle
    );


    /* DÉCONNEXION */

    $("disconnectBtn").addEventListener(
      "click",
      deconnecter
    );


    /* VOIX */

    $("voiceToggle").addEventListener(
      "click",
      changerVoix
    );


    /* EFFACER */

    $("clearChatBtn").addEventListener(
      "click",
    effacerMemoire
    );


    /* MICRO */

    $("micBtn").addEventListener(
      "click",
      lancerMicro
    );


    /* IMAGE */

    $("imageInput").addEventListener(
      "change",
      imageChoisie
    );


    /* ENVOYER */

    $("sendBtn").addEventListener(
      "click",
      window.envoyer
    );


    /* ENTRÉE DU CLAVIER */

    $("message").addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Enter") {

          event.preventDefault();

          window.envoyer();
        }
      }
    );


    /* NAVIGATION DU BAS */

    document.querySelectorAll(
      ".nav-item"
    ).forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          const section =
            button.dataset.section;

          document.querySelectorAll(
            ".nav-item"
          ).forEach(function (item) {

            item.classList.remove(
              "active"
            );
          });

          button.classList.add("active");


          if (section === "chat") {

            toast("Chat ouvert 💬");

          }

          else if (
            section === "homework"
          ) {

            ouvrirDevoirs();

          }

          else if (
            section === "images"
          ) {

            choisirImage();

          }

          else if (
            section === "account"
          ) {

            ouvrirCompte();

          }

        }
      );

    });

  }
);function effacerMemoire() {
  historique = [];
  localStorage.removeItem("orionHistorique");
  $("chat").innerHTML = "";
  toast("Mémoire d'ORION effacée 🧠");
}async function analyserImageAvecOrion(base64, mimeType) {

  try {

    const response = await fetch(URL_ORION, {
      method: "POST",
    
      boheaders: {
  "Content-Type": "text/plain"
},dy: JSON.stringify({
        type: "image",
        image: base64,
        mimeType: mimeType
      })
    });

    const data = await response.json();

    if (data.reponse) {
      addBotMessage(data.reponse);
    } else {
      addBotMessage("Je n'ai pas réussi à analyser cette image.");
    }

  } catch (error) {

    console.error(error);

    addBotMessage("❌ Impossible d'analyser l'image.");
  }
}