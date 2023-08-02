import NahwQuestion from "./modules/nahw.js";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, getDoc, doc } from "firebase/firestore";

function getSubDoc(db, textDoc) {
    if (!textDoc) return null;
    const id = new URL(document.location).searchParams.get("sub");
    if (!id) return null;
    return doc(db, textDoc.path, "subtexts", id);
}

function getMainDoc(db) {
    const id = new URL(document.location).searchParams.get("main");
    if (!id) return null;
    return doc(db, "texts", id);
}

function cardsView() {
    const cardsDiv = document.createElement("div");
    cardsDiv.classList.add("cards")
    document.body.appendChild(cardsDiv);
    return cardsDiv;
}

// TODO: Change cover image based on content type
// There are four content types: Nahw, qa'ida nahw, sarf, and qa'ida sarf
function generateCardHTML(text, subText) {
    let node;
    if (!subText) {
        node = new DOMParser().parseFromString(`\
<a class="card big primary-bg" href="index.html?main=${text.id}">
<img src="img/nahw.jpg" alt="Nahw Image">
<div class="card-container">
<div class="card-title-type-container">
<h1 class="card-title" lang="ar">${text.data().title}</h1>
<p class="card-type" lang="ar">${text.data().type}</p>
</div>
<p class="card-description">${text.data().description}</p>
</div>
</a>`, "text/html").body.firstElementChild;
    } else {
        node = new DOMParser().parseFromString(`\
<a class="card small secondary-bg" href="index.html?main=${text}&sub=${subText.id}">
<h1 class="card-title" lang="ar">${subText.data().title}</h1>
</a>`, "text/html").body.firstElementChild;                    
    }

    return node;
}

const main = async function() {
    const firebaseConfig = {
        apiKey: "AIzaSyBRaQLVukIzwZEpbqTqgVNlYW30obYcizs",
        authDomain: "nahwapp-f272f.firebaseapp.com",
        projectId: "nahwapp-f272f",
        storageBucket: "nahwapp-f272f.appspot.com",
        messagingSenderId: "877686164784",
        appId: "1:877686164784:web:857e86eaa876dd80230cf5"
    };
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    let selectedTextDoc = getMainDoc(db);
    let selectedSubDoc = getSubDoc(db, selectedTextDoc);
    let qs = null;
    
    // Rendering
    
    if (!selectedTextDoc && !selectedSubDoc) {
        const cardsElement = cardsView();
        const queryCards = await getDocs(collection(db, "texts"));
        queryCards.forEach((doc) => {
            cardsElement.appendChild(generateCardHTML(doc, null));
        });
    } else if (selectedTextDoc && !selectedSubDoc) {
        const cardsElement = cardsView();
        const queryCards = await getDocs(collection(db, selectedTextDoc.path, "subtexts"));
        queryCards.forEach( doc => {
            cardsElement.appendChild(generateCardHTML(selectedTextDoc.id, doc));
        });
    } else if (selectedTextDoc && selectedSubDoc) {
        const sentences = await getDoc(doc(db, selectedSubDoc.path, "sentences", "s"));
        qs = new NahwQuestion(sentences.data().sentences);
        const el = document.createElement("nahw-question");
        el.bindToState(qs);
        document.body.appendChild(el);
    } else {
        console.error(`No main is provided while a sub is`);
    }
}

main();
