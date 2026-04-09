function addSaveButtons() {
    const url = window.location.href;

    if (url.includes("linkedin.com")) {
        addLinkedInButtons();
    } else if (url.includes("medium.com")) {
        addMediumButtons();
    } else if (url.includes("substack.com")) {
        addSubstackButtons();
    }
}

// ---------- LINKEDIN -------------------------------
function addLinkedInButtons() {
    document.querySelectorAll(".feed-shared-update-v2").forEach(post => {
        if (post.querySelector(".save-btn")) return;

        let btn = createBtn();

        function getPostLink(post) {
            let shareLink = post.querySelector("a[data-control-name='share_link']")?.href;
            if (shareLink) return shareLink;
            let urn = post.getAttribute("data-urn") || post.getAttribute("data-id");
            if (urn) return `https://www.linkedin.com/feed/update/${urn}`;
            return window.location.href;
        }

        btn.onclick = () => {
            let title = post.querySelector(".feed-shared-update-v2__description, .feed-shared-text")?.innerText || post.innerText;
            let author = post.querySelector(".feed-shared-actor__name")?.innerText || "Unknown";
            let link = getPostLink(post);
            sendToNotion({ title, author, link, source: "LinkedIn" });
            btn.innerText = "Saved ✅";
        };

        post.appendChild(btn);
    });
}

// ---------- MEDIUM -----------------------------------------
function addMediumButtons() {
    // Target the title element from your DOM
    document.querySelectorAll("[data-testid='storyTitle']").forEach(title => {
        if (document.querySelector(".save-btn")) return;

        let btn = createBtn();
        btn.style.display = "block";
        btn.style.marginBottom = "10px";

        btn.onclick = () => {
            let titleText = title?.innerText || document.title;
            let author = document.querySelector("[rel='noopener follow']")?.innerText || "Unknown";
            let link = window.location.href;
            sendToNotion({ title: titleText, author, link, source: "Medium" });
            btn.innerText = "Saved ✅";
        };

        title.parentNode.insertBefore(btn, title);
    });
}

// ---------- SUBSTACK -----------------------------------------
function addSubstackButtons() {
    document.querySelectorAll("a[href*='/p/']").forEach(titleEl => {
        if (titleEl.dataset.btnAdded) return; // skip if already has button
        if (!titleEl.innerText.trim()) return;

        let btn = createBtn();
        titleEl.dataset.btnAdded = "true"; 

        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            let title = titleEl.innerText || document.title;
            let author = document.querySelector(
                "a[href*='substack.com']:not([href*='/p/'])"
            )?.innerText || "Unknown";
            let link = titleEl.href || window.location.href;
            sendToNotion({ title, author, link, source: "Substack" });
            btn.innerText = "Saved ✅";
        };

        titleEl.parentNode.insertBefore(btn, titleEl.nextSibling);
    });
}

// ---------- SHARED HELPERS -------------------------------
function createBtn() {
    let btn = document.createElement("button");
    btn.innerText = "🔖 Save to Notion";
    btn.className = "save-btn";
    btn.style.marginTop = "8px";
    btn.style.background = "#0a66c2";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "20px";
    btn.style.padding = "5px 10px";
    btn.style.cursor = "pointer";
    return btn;
}

function sendToNotion(data) {
    // get title from web
    fetch("http://localhost:5678/webhook/save-linkedin", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => console.log("Saved:", res.status))
    .catch(err => console.error("Error:", err));
}

setInterval(addSaveButtons, 1000);