const mapConfig = {
  past: {
    backgroundUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg",
    pins: [
      {
        label: "You should message me if:",
        lat: 37.7,
        lng: -122.4,
        memory: "You can recite the Ezekiel 25:17 speech from Pulp Fiction from memory."
      },
      {
        label: "Day One",
        lat: 31.2,
        lng: 121.4,
        memory: "An accidental registration. An unexpected message. The start of everything."
      },
      {
        label: "You should message me if:",
        lat: 12.8,
        lng: 121.7,
        memory: "You're a philosophy geek!"
      },
      {
        label: "City Lights",
        lat: 46,
        lng: 2.2,
        memory: "Paris or the Bookstore?"
      },
      {
        label: "Poland",
        lat: 51,
        lng: 19,
        memory: "💝 Platinum & Lithium = PL = Poland 💝"
      },
      {
        label: "Who Knowes ...",
        lat: 40,
        lng: -75,
        memory: "N = & = New = Know (Knew) "
      },
      {
        label: "Every week ...",
        lat: 23.6,
        lng: 102.5,
        memory: "the moment I anticipate most eagerly is checking my LinkedIn search appearances"
      },
      {
        label: "4 daily pings...",
        lat: 20,
        lng: -100,
        memory: "4 times = 4 x = 4 kisses 😘"
      },
      {
        label: "AWS",
        lat: 25,
        lng: -80,
        memory: "❤️ A chronix, I always know it's you all the time :) "
      },
      {
        label: "^^",
        lat: 46,
        lng: 30,
        memory: "As you wish"
      },
            {
        label: "4 daily pings...",
        lat: 20,
        lng: -100,
        memory: "4 times = 4 x = 4 kisses 😘"
      }

    ]
  },
  future: {
    backgroundUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg",
    pins: [
      {
        label: "Sakura trip",
        lat: 35.01,
        lng: 135.76,
        meaning: "A spring where we finally walk together under real cherry blossoms."
      },
      {
        label: "Paris cinema date",
        lat: 48.85,
        lng: 2.35,
        meaning: "A dreamy film-night in Paris where we celebrate how far we've come."
      }
    ]
  }
};

const mapState = {
  past: mapConfig.past.pins.map((pin) => ({ ...pin })),
  future: mapConfig.future.pins.map((pin) => ({ ...pin }))
};

setupCoverGate();
setupMap("past");
setupMap("future");
setupFutureExperience();
setupImmersiveScene();
setupRomanticHoverEffects();


function setupRomanticHoverEffects() {
  const isPresent = document.body.classList.contains("present-page");
  const isPast = document.body.classList.contains("past-page");
  if (!isPresent && !isPast) {
    return;
  }

  const layer = document.createElement("div");
  layer.className = `hover-hearts ${isPresent ? "present-hover-hearts" : "past-hover-hearts"}`;
  document.body.appendChild(layer);

  const symbols = isPresent ? ["❤", "♡", "💗", "💕"] : ["♥", "❣", "❥", "❤"];
  let lastSpawn = 0;

  const spawnHeart = (x, y) => {
    const heart = document.createElement("span");
    heart.className = "hover-heart";
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty("--drift-x", `${Math.random() * 50 - 25}px`);
    heart.style.setProperty("--drift-y", `${Math.random() * -40 - 24}px`);
    heart.style.animationDelay = `${Math.random() * 0.08}s`;
    layer.appendChild(heart);
    setTimeout(() => heart.remove(), 1400);
  };

  document.addEventListener("mousemove", (event) => {
    const now = Date.now();
    if (now - lastSpawn < 95) {
      return;
    }
    lastSpawn = now;
    spawnHeart(event.clientX, event.clientY);
  });
}


function setupCoverGate() {
  const passwordInput = document.getElementById("cover-password");
  const enterButton = document.getElementById("cover-enter");
  const feedback = document.getElementById("cover-feedback");

  if (!passwordInput || !enterButton) {
    return;
  }

  const tryEnter = () => {
    const value = passwordInput.value.trim().toLowerCase();
    if (value === "love") {
      window.location.href = "present.html";
      return;
    }
    if (feedback) {
      feedback.textContent = "Wrong password. Hint is still 'love'.";
    }
  };

  enterButton.addEventListener("click", tryEnter);
  passwordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      tryEnter();
    }
  });
}

function setupMap(mapKey) {
  const canvas = document.querySelector(`.map-canvas[data-map='${mapKey}']`);
  if (!canvas) {
    return;
  }

  // If this is the "past" map and we are on the past page, use Leaflet instead of the custom image map
  if (mapKey === "past" && document.querySelector(".past-page")) {
    setupLeafletMap(mapKey, canvas);
    return;
  }

  const list = document.getElementById(`${mapKey}-list`);
  const latInput = document.querySelector(`[data-lat='${mapKey}']`);
  const lngInput = document.querySelector(`[data-lng='${mapKey}']`);
  const labelInput = document.querySelector(`[data-label='${mapKey}']`);
  const addBtn = document.querySelector(`[data-add-pin='${mapKey}']`);
  const mapUrlInput = document.querySelector(`[data-map-url='${mapKey}']`);
  const jsonBox = document.querySelector(`[data-pin-json='${mapKey}']`);
  const applyJsonBtn = document.querySelector(`[data-apply-json='${mapKey}']`);

  canvas.style.backgroundImage = `url('${mapConfig[mapKey].backgroundUrl}')`;
  if (mapUrlInput) {
    mapUrlInput.value = mapConfig[mapKey].backgroundUrl;
    mapUrlInput.addEventListener("change", () => {
      if (mapUrlInput.value.trim()) {
        canvas.style.backgroundImage = `url('${mapUrlInput.value.trim()}')`;
      }
    });
  }

  const refresh = () => {
    renderMapPins(mapKey, canvas, list);
    if (jsonBox) {
      jsonBox.value = JSON.stringify(mapState[mapKey], null, 2);
    }
  };

  if (addBtn && latInput && lngInput && labelInput) {
    addBtn.addEventListener("click", () => {
      const lat = Number(latInput.value);
      const lng = Number(lngInput.value);
      const label = labelInput.value.trim();

      if (!Number.isFinite(lat) || !Number.isFinite(lng) || !label) {
        alert("Please provide valid latitude, longitude, and label.");
        return;
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        alert("Latitude must be between -90 and 90, longitude between -180 and 180.");
        return;
      }

      mapState[mapKey].push({ label, lat, lng });
      latInput.value = "";
      lngInput.value = "";
      labelInput.value = "";
      refresh();
    });
  }

  if (applyJsonBtn && jsonBox) {
    applyJsonBtn.addEventListener("click", () => {
      try {
        const parsed = JSON.parse(jsonBox.value);
        if (!Array.isArray(parsed)) {
          throw new Error("JSON must be an array");
        }

        const cleaned = parsed
          .map((item) => ({
            label: String(item.label ?? "").trim(),
            lat: Number(item.lat),
            lng: Number(item.lng)
          }))
          .filter(
            (item) =>
              item.label &&
              Number.isFinite(item.lat) &&
              Number.isFinite(item.lng) &&
              item.lat >= -90 &&
              item.lat <= 90 &&
              item.lng >= -180 &&
              item.lng <= 180
          );

        mapState[mapKey] = cleaned;
        refresh();
      } catch (error) {
        alert(`Invalid JSON: ${error.message}`);
      }
    });
  }

  refresh();
}

function setupLeafletMap(mapKey, container) {
  // Ensure the container has an ID for Leaflet
  if (!container.id) {
    container.id = `leaflet-map-${mapKey}`;
  }

  // Initialize Leaflet Map with romantic settings
  const map = L.map(container.id, {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxBounds: [[-90, -220], [90, 220]], // Allow some panning but keep world in view
    scrollWheelZoom: false,
    zoomControl: false,
    attributionControl: false
  });

  // Add Zoom Control
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Add Tile Layer (Light theme + romantic filter)
  // We use CartoDB Light as a base because it's clean and easy to tint
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // Custom Heart Icon using Leaflet DivIcon
  const heartIcon = L.divIcon({
    className: 'custom-heart-pin',
    html: '❤',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });

  const markers = [];

  // Add Markers from state
  mapState[mapKey].forEach((pin) => {
    const marker = L.marker([pin.lat, pin.lng], { icon: heartIcon }).addTo(map);

    // Popup Content
    const popupContent = `
      <div class="popup-content-inner">
        <div class="popup-body">
          <span class="popup-date">${pin.date || "Memory"}</span>
          <strong class="popup-title">${pin.label}</strong>
          <div class="popup-text">${pin.memory || "A beautiful moment frozen in time."}</div>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      className: 'custom-romantic-popup',
      closeButton: false,
      autoPan: true,
      autoPanPadding: [50, 50] // Ensure popup doesn't get cut off at edges
    });

    markers.push(marker);
  });

  // Fit bounds to show all memories with generous padding so markers aren't on the edge
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds(), { padding: [80, 80], maxZoom: 3 });
  }
}


function latLngToPercent(lat, lng) {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

function renderMapPins(mapKey, canvas, list) {
  canvas.querySelectorAll(".map-pin").forEach((pin) => pin.remove());
  if (list) {
    list.innerHTML = "";
  }

  mapState[mapKey].forEach((pin, index) => {
    const { x, y } = latLngToPercent(pin.lat, pin.lng);
    const pinEl = document.createElement("button");
    pinEl.className = `map-pin ${mapKey === "past" ? "heart-pin" : ""} ${mapKey === "future" ? "future-pin" : ""}`;
    pinEl.textContent = mapKey === "past" ? "❤" : mapKey === "future" ? "✦" : "📍";
    pinEl.style.left = `${x}%`;
    pinEl.style.top = `${y}%`;
    pinEl.title = `${pin.label} (${pin.lat.toFixed(2)}, ${pin.lng.toFixed(2)})`;
    pinEl.type = "button";
    if (mapKey === "past") {
      pinEl.addEventListener("click", () => showPastMemoryPopup(canvas, x, y, pin));
    }
    if (mapKey === "future") {
      pinEl.addEventListener("click", () => showFutureVisionPopup(canvas, x, y, pin));
    }
    canvas.appendChild(pinEl);

    if (list) {
      const item = document.createElement("li");
      item.textContent = `${pin.label} — lat ${pin.lat}, lng ${pin.lng}`;
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "mini-btn";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        mapState[mapKey].splice(index, 1);
        renderMapPins(mapKey, canvas, list);
        const jsonBox = document.querySelector(`[data-pin-json='${mapKey}']`);
        if (jsonBox) {
          jsonBox.value = JSON.stringify(mapState[mapKey], null, 2);
        }
      });
      item.appendChild(removeBtn);
      list.appendChild(item);
    }
  });
}

function showPastMemoryPopup(canvas, x, y, pin) {
  canvas.querySelectorAll(".past-memory-popup").forEach((el) => el.remove());
  const popup = document.createElement("div");
  popup.className = "past-memory-popup";
  popup.style.left = `${x}%`;
  popup.style.top = `${y}%`;
  popup.innerHTML = `
    <button type="button" class="past-memory-close" aria-label="Close">×</button>
    <div class="past-memory-media" style="background-image:url('${pin.image || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80"}')"></div>
    <div class="past-memory-body">
      <span class="past-memory-date">${pin.date || "August 2024"}</span>
      <h4>${pin.label}</h4>
      <p>${pin.memory || "Our memory here is waiting to be edited in app.js."}</p>
      <blockquote>${pin.note || "From that moment, every coffee reminds me of you."}</blockquote>
    </div>
  `;
  const closeBtn = popup.querySelector('.past-memory-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => popup.remove());
  }
  canvas.appendChild(popup);
  setTimeout(() => popup.remove(), 3200);
}

function showFutureVisionPopup(canvas, x, y, pin) {
  canvas.querySelectorAll(".future-vision-popup").forEach((el) => el.remove());
  const popup = document.createElement("div");
  popup.className = "future-vision-popup";
  popup.style.left = `${x}%`;
  popup.style.top = `${y}%`;
  popup.innerHTML = `<strong>${pin.label}</strong><p>${pin.meaning || "Future meaning can be edited in app.js (mapConfig.future.pins)."}</p>`;
  canvas.appendChild(popup);
  setTimeout(() => popup.remove(), 3500);
}

function setupFutureExperience() {
  const capsuleMessage = document.getElementById("capsule-message");
  const capsuleButtons = document.querySelectorAll(".capsule-btn");
  const ritualList = document.getElementById("ritual-list");
  const ritualInput = document.getElementById("ritual-input");
  const addRitual = document.getElementById("add-ritual");
  const futureSyncHold = document.getElementById("future-sync-hold");
  const futureSyncStatus = document.getElementById("future-sync-status");
  const futureSyncTitle = document.getElementById("future-sync-title");
  const futureSyncCopy = document.getElementById("future-sync-copy");
  const futureSyncIcon = document.getElementById("future-sync-icon");
  const futureSyncProgressFill = document.getElementById("future-sync-progress-fill");
  const futureSyncProgressLabel = document.getElementById("future-sync-progress-label");

  if (!capsuleMessage && !ritualList && !futureSyncHold) {
    return;
  }

  /* const storageKey = "future-ritual-list";
  const defaultRituals = [
    "🌸 Spring photo letter to each other",
    "🌍 One new city every year",
    "💫 Monthly dream-night planning"
  ];

  const capsuleIdeas = [
    "🛶 Rent a quiet lake boat at sunset and read your old messages out loud.",
    "🎞️ Create a tiny film festival of your relationship milestones.",
    "🧭 Pick one random place on the map and design a mini-adventure there."
  ];

  let rituals = []
  try {
    rituals = JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    rituals = [];
  }
  if (!Array.isArray(rituals) || rituals.length === 0) {
    rituals = [...defaultRituals];
  }

  const saveRituals = () => {
    localStorage.setItem(storageKey, JSON.stringify(rituals));
  };

  const renderRituals = () => {
    if (!ritualList) {
      return;
    }
    ritualList.innerHTML = "";
    rituals.forEach((ritual, index) => {
      const item = document.createElement("li");
      item.className = "ritual-item";
      const text = document.createElement("span");
      text.textContent = ritual;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "mini-btn";
      remove.textContent = "Done";
      remove.addEventListener("click", () => {
        rituals.splice(index, 1);
        renderRituals();
        saveRituals();
      });
      item.appendChild(text);
      item.appendChild(remove);
      ritualList.appendChild(item);
    });
  };

  if (capsuleButtons.length && capsuleMessage) {
    capsuleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.capsule);
        capsuleMessage.textContent = capsuleIdeas[index] || capsuleIdeas[0];
      });
    });
  }

  if (addRitual && ritualInput) {
    addRitual.addEventListener("click", () => {
      const value = ritualInput.value.trim();
      if (!value) {
        return;
      }
      rituals.push(`✨ ${value}`);
      ritualInput.value = "";
      renderRituals();
      saveRituals();
    });
  } */

  if (futureSyncHold && futureSyncStatus) {
    let holdTimer = null;
    let progressTimer = null;
    let locked = false;
    const holdDuration = 1600;
    let holdStart = 0;

    const setProgress = (value) => {
      const percent = Math.max(0, Math.min(100, value));
      if (futureSyncProgressFill) {
        futureSyncProgressFill.style.width = `${percent}%`;
      }
      if (futureSyncProgressLabel && !locked) {
        futureSyncProgressLabel.textContent = percent > 0
          ? `Synchronizing... ${Math.round(percent)}%`
          : "Hold to sync...";
      }
    };

    const beginHold = () => {
      if (locked || holdTimer) {
        return;
      }
      holdStart = Date.now();
      futureSyncHold.classList.add("holding");
      setProgress(0);
      progressTimer = setInterval(() => {
        const elapsed = Date.now() - holdStart;
        setProgress((elapsed / holdDuration) * 100);
      }, 50);
      holdTimer = setTimeout(() => {
        locked = true;
        futureSyncHold.classList.remove("holding");
        futureSyncHold.classList.add("locked");
        futureSyncStatus.classList.add("active");
        setProgress(100);
        if (futureSyncProgressLabel) {
          futureSyncProgressLabel.textContent = "Synchronized ✓";
        }
        if (futureSyncTitle) {
          futureSyncTitle.textContent = "FUTURE SYNC";
        }
        if (futureSyncCopy) {
          futureSyncCopy.textContent = "Our future timelines are synchronized.";
        }
        if (futureSyncIcon) {
          futureSyncIcon.textContent = "✓";
        }
        if (progressTimer) {
          clearInterval(progressTimer);
          progressTimer = null;
        }
        holdTimer = null;
      }, holdDuration);
    };

    const cancelHold = () => {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
      if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
      }
      if (!locked) {
        futureSyncHold.classList.remove("holding");
        setProgress(0);
      }
    };

    futureSyncHold.addEventListener("mousedown", beginHold);
    futureSyncHold.addEventListener("touchstart", beginHold, { passive: true });
    futureSyncHold.addEventListener("mouseup", cancelHold);
    futureSyncHold.addEventListener("mouseleave", cancelHold);
    futureSyncHold.addEventListener("touchend", cancelHold);
    futureSyncHold.addEventListener("touchcancel", cancelHold);
  }

  if (ritualList) {
    renderRituals();
  }
}

function setupImmersiveScene() {
  const stage = document.querySelector(".immersive-stage");
  if (!stage) {
    return;
  }

  const selectorButtons = document.querySelectorAll("[data-scene-select]");
  const cards = document.querySelectorAll(".scene-card");
  const stageTitle = document.getElementById("stage-title");
  const stageSubtitle = document.getElementById("stage-subtitle");
  const stageImage = document.getElementById("stage-image");
  const stageLog = document.getElementById("stage-log");
  const rainLayer = document.getElementById("rain-layer");
  const londonStatus = document.getElementById("london-status");
  const stageHotspots = document.getElementById("stage-hotspots");
  const lanternDock = document.getElementById("lantern-dock");
  const playerNowPlaying = document.getElementById("player-now-playing");
  const playerToggle = document.getElementById("player-toggle");
  const playerStop = document.getElementById("player-stop");
  const playerNext = document.getElementById("player-next");
  const musicDock = document.querySelector(".music-dock");
  const musicFab = document.getElementById("music-fab");
  const musicPanel = document.getElementById("music-panel");
  const exitImmersive = document.getElementById("exit-immersive");
  const starsHeartMessage = document.getElementById("stars-heart-message");
  const parisCinematic = document.getElementById("paris-cinematic");
  const parisPlay = document.getElementById("paris-play");
  const parisReturn = document.getElementById("paris-return");
  const parisDialogue = document.getElementById("paris-dialogue");

  const sceneData = {
    sakura: {
      title: "Japan · Sakura Rain",
      subtitle: "Romantic petals are pouring down — pick one for a sweet message. (Do you know: how to count number from 100 to 1 in French?)",
      image:
        "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=2200&q=80",
      sweetMessages: [
        "#1: System Initialized: Found you.",
        "#2: Time freezes when the petals fall, just like when we met.",
        "#3: Input detected: Your smile.",
        "#4: You make ordinary moments feel magical.",
        "#5: You're my favorite Linkedin Notification.",
        "#6: Your terrible puns (that I secretly adore).",
        "#10: System Status: Maximum affection detected.",
        "#20: You are the only outlier I never want to normalize.",
        "#30: My neural network is overfitted on your smile.",
        "#40: My model predicts a 100% chance of me missing you right now.",
        "#50: Optimization: 50% Complete. Happiness at 100%.",
        "#60: Every petal brings me closer to you.",
        "#70: Everything. I like everything.",
        "#80: You are my favorite place in every season.",
        "#90: Growing old together.",
        "#99+1: As You Wish",
        "#1,000,000 lucky - A Thousand Years ♫⋆♪ ♡♬✩ ❤️",
        "#∞: Buffer Overflow: Too much love to count."
      ]
    },
    stars: {
      title: "Stars · Wish Night",
      subtitle: "Hover the sky and the stars will gather into a heart with a message.(Do you remember: that awkward star certificate? 🙈 I promise this version is better)",
      image:
        "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=2200&q=80",
      heartMessages: [
        "You are my forever wish.",
        "We are just two particles entangled across the universe.",
        "Even light takes time to travel, but my thoughts of you are instant.",
        "The light hitting your eyes is the same light hitting mine.",
        "Close your eyes... I’m making the same wish as you."
      ],
      shapeLabels: {
        heartBloom: "💗 Heart bloom mode",
        twinHearts: "💕 Twin hearts mode",
        infinityLoop: "♾️ Infinity love mode",
        butterfly: "🦋 Butterfly dream mode"
      }
    },
    shanghai: {
      title: "Shanghai · Cuisine Discovery",
      subtitle: "Tap the icons of local Shanghai foods to discover flavors, uncover fun facts, and enjoy the skyline - a blend of modern cityscape and traditional Li Nong charm. (Can you guess which one is my ultimate favorite?)",
      image:
        "image/shanghai05.png",
      facts: [
        "Xiaolongbao - A delicate steamed soup dumpling filled with juicy pork and rich, flavorful broth inside a thin, tender wrapper. Dip it in vinegar, place it on a spoon, sip the soup, and enjoy!",
        "Spring Rolls - Crispy golden rolls filled with vegetables and meat - one of my favorite in Spring Festival!",
        "Red Braised Pork (Hong Shao Rou in Chinese) - A classic Shanghai-style home cuisine dish - Tender braised pork belly cooked in soy sauce and sugar, rich and savory with a melt-in-your-mouth texture.",
        "Shengjian Bao - Pan-fried soup dumplings with a crispy bottom and juicy pork filling, a beloved Shanghai breakfast option, one of my childhood favorites.",
        "Shanghai Hairy Crab (Da Zha Xie in Chinese) - Seasonal Shanghai delicacy for autumn feasts — the best and original way is to steam them and enjoy with black vinegar and julienned ginger."
      ],
      dialogues: [
        'Cuisine line: ',
        'Cuisine line: ',
        'Cuisine line: '
      ],
      hotspots: [
        { left: 10, top: 70, label: "🥟", type: "fact", index: 0 },
        { left: 30, top: 70, label: "🥢", type: "fact", index: 1 },
        { left: 50, top: 70, label: "🍖", type: "fact", index: 2 },
        { left: 70, top: 70, label: "🥠", type: "fact", index: 3 },
        { left: 90, top: 70, label: "🦀", type: "fact", index: 4 }
      ]
    },
    "late-night-sync": {
      title: "Late Night · Timeline Sync",
      subtitle: "Drag the middle line until our timelines eclipse and sync in one moment. (Do you know that I've become a math genius? Because I can now calculate exactly what time it is for you in less than a second.)",
      image:
        "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=2200&q=80",
      myTimeLabel: "My Time Zone (GMT+8) ",
      yourTimeLabel: "Your Time Zone (GMT-8) ",
      idleMessage: "Drag the middle line to align our timelines.",
      syncMessage: "🌙 Eclipse sync: your time and my time finally met as one heartbeat.",
/*       facts: [
        "Most cities are quietest around 2:00–4:00 AM, perfect for reflective moments.",
        "Late-night chronotype fact dummy A — edit me later.",
        "Timeline sync fact dummy B — edit me later."
      ], */
      dialogues: [
        'Timeline line: "No matter the timezone, our hearts keep the same clock."',
        'Timeline line: "Insert your own sync dialogue here."',
        'Timeline line: "Even at midnight, I still choose you first."'
      ]
    },
    "london-rain": {
      title: "London · Rain Walk",
      subtitle: "Rain starts falling, and a cinematic message slowly types on screen.",
      image:
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=2200&q=80",
      /* facts: [
        "London's rain is often light drizzle rather than heavy storms.",
        "Rainy London fact dummy A — edit this line later.",
        "Rainy London fact dummy B — edit this line later."
      ], */
      dialogues: [
        'Rain line: "Do you know what causes latency ..."',
        'Rain line: "Two cities, one rhythm, and a heartbeat that sounds like home."',
        'Rain line: "Connected by the rain, aligned by the heart."'
      ],
      analysisLines: [
        "ANALYSIS: Rainy days used to be gloomy.",
        "Now, the model associates them with you.",
        "Status: Missing you."
      ],
      hotspots: [
        // { left: 24, top: 62, label: "☔", type: "fact", index: 0 },
        { left: 47, top: 48, label: "☕", type: "dialogue", index: 0 },
        { left: 72, top: 56, label: "🌧️", type: "dialogue", index: 2 }
      ]
    },
    "central-park": {
      title: "Central Park · Boat & Fireflies",
      subtitle: "Fireflies move naturally around the lake — click one and it sings your familiar songs.",
      image:
        "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2200&q=80",
      songs: [
        { title: "You Are My Sunshine - JimmieDavis", url: "music/You_Are_My_Sunshine_JimmieDavis.mp3" },
        { title: "Top Of The World - The Carpenters", url: "music/Top_Of_The_World_The_Carpenters.mp3" },
        { title: "San Francisco - Scott McKenzie", url: "music/San_Francisco_Scott_McKenzie.mp3" },
        { title: "Day 1 - HONNE", url: "music/Day_1_by_HONNE.mp3" },
        { title: "Perfect - Ed Sheeran", url: "music/Perfect_Ed_Sheeran.mp3" },
        { title: "Fireflies - Owl City", url: "music/Fireflies_owl_city.mp3" },
        // { title: "Mr Blue Sky - Guardians of the Galaxy", url: "music/Mr_Blue_Sky_Guardians_of_the_Galaxy.mp3" },
        // { title: "Lights - Journey", url: "music/Lights_journey.mp3" },
        { title: "Me and You - Honne", url: "music/Me_and_You_by_Honne.mp3" },
        { title: "We will rock you - Queen", url: "music/We_will_rock_you_queen.mp3" },
        // { title: "Imagine - John Lennon", url: "music/Imagine_John_Lennon.mp3" },
        { title: "I Hate Myself For Loving You - Joan Jett", url: "music/IHateMyselfForLovingYou_JoanJett.mp3" },
        // { title: "Duke of Earl - Gene Chandler", url: "music/Duke_of_Earl_Gene_Chandler.mp3" },
        { title: "Come and get your love - GuardiansoftheGalaxy", url: "music/Come_And_Get_Your_Love_GuardiansoftheGalaxy.mp3" }
/*         { title: "All of Me - John Legend", url: "music/All_of_Me_John_Legend.mp3" },
        { title: "Les Champs Elysees - Joe Dassin", url: "music/Les_Champs_Elysees_joe_dassin.mp3" },
        { title: "What A Wonderful World - Louis Armstrong", url: "music/What_A_Wonderful_World_Louis_Armstrong.mp3" },
        { title: "Everything - Michael Buble", url: "music/Everything_Michael_Buble.mp3" },
        { title: "Feeling Good - Michael Buble", url: "music/Feeling_Good_Michael_Buble.mp3" },
        { title: "Colourful Clouds Chasing The Moon - Yundi Li", url: "music/Colourful_Clouds_Chasing_The_Moon_Yundi_Li.mp3" } */
      ]
    },
    "animal-kingdom": {
      title: "Animal Kingdom · Parrot Dance",
      subtitle: "Your parrot dancers can use GIF/image links edited in code (sceneData[\"animal-kingdom\"].parrots).",
      image:
        "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=2200&q=80",
      parrots: [
        {
          label: "Lovebird BBB",
          src: "image/parrot01.gif",
          left: 28,
          top: 66,
          scale: 1
        },
        {
          label: "Lovebird BBB",
          src: "image/parrot03.gif",
          left: 52,
          top: 61,
          scale: 1.15
        },
        {
          label: "Lovebird BBB",
          src: "image/parrot02.jpg",
          left: 74,
          top: 64,
          scale: 1
        }
      ]
    },
    paris: {
      title: "Paris · Film Set",
      subtitle: "No people animation. Background + talk audio hooks are editable in code.",
      image:
        "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=2200&q=80",
      talkTracks: [
        { title: "Philosophy Dialog about Existentialism and Absurdism on Valentine's Day", url: "audio/philosophy talk existentialism on valentine day.wav" }
      ],
      hotspots: [
        {
          left: 30,
          top: 62,
          label: "🎬",
          kind: "paris-note",
          message: "Director whispers: this love scene is your story."
        },
        {
          left: 64,
          top: 40,
          label: "🎬",
          kind: "paris-note",
          message: "The set lights glow like a warm Paris sunset."
        }
      ],
      dialogues: [
        '... Cupid meets Camus: exploring existentialism and absurdism in the season of love...',
        '',
        ''
      ]
    }
  };

  let active = null;
  let currentAudio = null;
  let ambientTimer = null;
  let lastFireflySongIndex = -1;
  let starsHeartMessageIndex = -1;
  let rainTimer = null;
  let londonTypingTimer = null;

  const updateNowPlaying = (text) => {
    if (playerNowPlaying) {
      playerNowPlaying.textContent = text;
    }
  };

  const closeParisCinematic = () => {
    if (parisCinematic) {
      parisCinematic.classList.remove("active");
    }
  };

  const openParisCinematic = () => {
    if (parisCinematic) {
      parisCinematic.classList.add("active");
    }
  };


  const startLondonRainExperience = () => {
    if (!rainLayer || !londonStatus) {
      return;
    }

    rainLayer.classList.add("active");
    londonStatus.classList.add("active");

    const spawnDrop = () => {
      const drop = document.createElement("span");
      drop.className = `rain-drop ${Math.random() > 0.82 ? "romantic" : ""}`;
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${0.9 + Math.random() * 1.1}s`;
      rainLayer.appendChild(drop);
      setTimeout(() => drop.remove(), 1600);
    };

    for (let i = 0; i < 65; i += 1) {
      setTimeout(spawnDrop, i * 22);
    }
    rainTimer = setInterval(spawnDrop, 90);

    const lines = sceneData["london-rain"].analysisLines || [];
    let text = "";
    const target = `${lines[0] || ""}
${lines[1] || ""}

${lines[2] || ""}`;
    let index = 0;
    const typeNext = () => {
      londonStatus.textContent = `${text}▌`;
      if (index >= target.length) {
        londonStatus.textContent = text;
        return;
      }
      text += target[index];
      index += 1;
      londonTypingTimer = setTimeout(typeNext, target[index - 1] === "\n" ? 230 : 34);
    };
    typeNext();
  };

  const clearAmbient = () => {
    if (ambientTimer) {
      clearInterval(ambientTimer);
      ambientTimer = null;
    }
    stageHotspots.innerHTML = "";
    stageHotspots.classList.remove("stars-heart-mode");
    stageHotspots.onmouseenter = null;
    stageHotspots.onmouseleave = null;
    if (starsHeartMessage) {
      starsHeartMessage.classList.remove("active");
    }
    if (rainTimer) {
      clearInterval(rainTimer);
      rainTimer = null;
    }
    if (londonTypingTimer) {
      clearTimeout(londonTypingTimer);
      londonTypingTimer = null;
    }
    if (rainLayer) {
      rainLayer.classList.remove("active");
      rainLayer.innerHTML = "";
    }
    if (londonStatus) {
      londonStatus.classList.remove("active");
      londonStatus.textContent = "";
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    if (playerToggle) {
      playerToggle.textContent = "▶";
    }
    updateNowPlaying("Romantic Piano Melody · Background Music");
  };

  const showScenePopup = (xPercent, yPercent, text) => {
    const bubble = document.createElement("div");
    bubble.className = `scene-popup ${active === "sakura" ? "sakura-popup" : ""}`;
    bubble.style.left = `${xPercent}%`;
    bubble.style.top = `${yPercent}%`;
    bubble.textContent = text;
    stageHotspots.appendChild(bubble);
    setTimeout(() => bubble.remove(), active === "sakura" ? 3600 : 2400);
  };

  const spawnSakuraPetal = () => {
    const petal = document.createElement("button");
    petal.type = "button";
    petal.className = "magic-hit petal-hit dynamic-item petal-fall";
    petal.style.left = `${Math.random() * 92 + 4}%`;
    petal.style.top = "-8%";
    petal.style.animationDuration = `${7 + Math.random() * 6}s`;
    petal.style.animationDelay = `${Math.random() * 2}s`;
    petal.style.setProperty("--drift", `${Math.random() * 160 - 80}px`);
    petal.textContent = "✿";

    petal.addEventListener("click", () => {
      const picks = sceneData.sakura.sweetMessages;
      const sweet = picks[Math.floor(Math.random() * picks.length)];
      stageLog.innerHTML = `🌸 ${sweet}`;
      const x = Number.parseFloat(petal.style.left);
      const y = 24 + Math.random() * 14;
      showScenePopup(x, y, sweet);
      dropSparkle(stage, "rgba(255,192,214,0.9)");
      petal.remove();
    });

    petal.addEventListener("animationend", () => petal.remove());
    stageHotspots.appendChild(petal);
  };

  const renderStarsHeartField = () => {
    const starShapes = [
      {
        name: "heartBloom",
        points: [
          [50, 28], [46, 24], [41, 22], [35, 24], [30, 28], [27, 33], [26, 39], [28, 45],
          [33, 53], [38, 60], [44, 68], [50, 76], [56, 68], [62, 60], [67, 53], [72, 45],
          [74, 39], [73, 33], [70, 28], [65, 24], [59, 22], [54, 24]
        ]
      },
      {
        name: "twinHearts",
        points: [
          [38, 32], [35, 28], [31, 27], [28, 29], [26, 33], [27, 38], [30, 43], [34, 49], [38, 54], [42, 49], [45, 43], [47, 38],
          [62, 32], [59, 28], [55, 27], [52, 29], [50, 33], [51, 38], [54, 43], [58, 49], [62, 54], [66, 49], [69, 43], [71, 38],
          [50, 70], [46, 64], [54, 64]
        ]
      },
      {
        name: "infinityLoop",
        points: [
          [28, 45], [32, 40], [38, 37], [44, 39], [48, 45], [44, 51], [38, 53], [32, 50],
          [50, 45], [56, 39], [62, 37], [68, 40], [72, 45], [68, 50], [62, 53], [56, 51],
          [50, 45], [46, 45], [54, 45], [40, 45], [60, 45]
        ]
      },
      {
        name: "butterfly",
        points: [
          [33, 36], [28, 31], [23, 34], [24, 41], [30, 45], [35, 42],
          [43, 39], [39, 32], [45, 30], [50, 38],
          [57, 39], [61, 32], [55, 30], [50, 38],
          [67, 36], [72, 31], [77, 34], [76, 41], [70, 45], [65, 42],
          [50, 47], [49, 55], [50, 63], [51, 55]
        ]
      }
    ];

    const maxPoints = Math.max(...starShapes.map((shape) => shape.points.length));
    let shapeIndex = -1;

    stageHotspots.classList.add("stars-heart-mode");
    const stars = Array.from({ length: maxPoints }, () => {
      const star = document.createElement("span");
      star.className = "star-heart-star";
      star.textContent = "★";
      star.style.setProperty("--start-left", `${Math.random() * 92 + 4}%`);
      star.style.setProperty("--start-top", `${Math.random() * 38 + 6}%`);
      stageHotspots.appendChild(star);
      return star;
    });

    const heartMessages = sceneData.stars.heartMessages || [];
    const shapeLabels = sceneData.stars.shapeLabels || {};

    const applyNextShape = () => {
      shapeIndex = (shapeIndex + 1) % starShapes.length;
      const shape = starShapes[shapeIndex];
      stageHotspots.dataset.starsShape = shape.name;

      stars.forEach((star, index) => {
        const point = shape.points[index % shape.points.length];
        star.style.setProperty("--target-left", `${point[0]}%`);
        star.style.setProperty("--target-top", `${point[1]}%`);
      });

      if (starsHeartMessage) {
        if (heartMessages.length) {
          starsHeartMessageIndex = (starsHeartMessageIndex + 1 + heartMessages.length) % heartMessages.length;
        }
        const line = heartMessages[starsHeartMessageIndex] || "You are my forever wish.";
        const label = shapeLabels[shape.name] || "✨ Star shape mode";
        starsHeartMessage.textContent = `${label} · ${line}`;
      }
    };

    stageHotspots.onmouseenter = () => {
      if (active === "stars" && starsHeartMessage) {
        applyNextShape();
        starsHeartMessage.classList.add("active");
      }
    };

    stageHotspots.onmouseleave = () => {
      if (starsHeartMessage) {
        starsHeartMessage.classList.remove("active");
      }
    };
  };

  const spawnFirefly = () => {
    const firefly = document.createElement("button");
    firefly.type = "button";
    firefly.className = "magic-hit dynamic-item firefly-float firefly-item";
    firefly.style.left = `${Math.random() * 88 + 6}%`;
    firefly.style.top = `${Math.random() * 52 + 36}%`;
    firefly.style.animationDuration = `${6 + Math.random() * 5}s`;
    firefly.style.animationDelay = `${Math.random() * 2}s`;
    firefly.style.setProperty("--x-wobble", `${Math.random() * 120 - 60}px`);
    firefly.style.setProperty("--y-wobble", `${Math.random() * 70 - 35}px`);
    firefly.innerHTML = "<span class='firefly-body'></span><span class='firefly-wing left'></span><span class='firefly-wing right'></span>";

    firefly.addEventListener("click", () => {
      const songs = sceneData["central-park"].songs;
      const randomIndex = Math.floor(Math.random() * songs.length);
      const song = songs[randomIndex];
      lastFireflySongIndex = randomIndex;
      playAudio(song.url, song.title);
      stageLog.innerHTML = `🎵 Firefly sings: ${song.title} `;
      dropSparkle(stage, "rgba(255,255,153,0.9)");
    });

    firefly.addEventListener("animationend", () => firefly.remove());
    stageHotspots.appendChild(firefly);
  };

  const renderInteractiveFactSceneHotspots = (sceneKey, iconFallback) => {
    const scene = sceneData[sceneKey];
    const hotspots = scene?.hotspots || [];
    hotspots.forEach((spot) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "magic-hit paris-hit";
      btn.style.left = `${spot.left}%`;
      btn.style.top = `${spot.top}%`;
      btn.textContent = spot.label || iconFallback;
      btn.addEventListener("click", () => {
        if (spot.type === "dialogue") {
          const lines = scene.dialogues || [];
          const line = lines[spot.index] || lines[Math.floor(Math.random() * lines.length)] || "Dialogue goes here.";
          stageLog.innerHTML = `💬 ${line}`;
          showScenePopup(spot.left, Math.max(12, spot.top - 12), `💬 ${line}`);
          return;
        }
        const facts = scene.facts || [];
        const fact = facts[spot.index] || facts[Math.floor(Math.random() * facts.length)] || "Fact goes here.";
        stageLog.innerHTML = `🏙️ ${fact}`;
        showScenePopup(spot.left, Math.max(12, spot.top - 12), `🏙️ ${fact}`);
      });
      stageHotspots.appendChild(btn);
    });
  };

  const renderShanghaiHotspots = () => {
    renderInteractiveFactSceneHotspots("shanghai", "🍽️");
  };

  const renderLateNightSyncHotspots = () => {
    const scene = sceneData["late-night-sync"];
    const wrap = document.createElement("div");
    wrap.className = "timeline-sync-board";
    wrap.style.setProperty("--sync-split", "50%");

    wrap.innerHTML = `
      <div class="timeline-pane mine">
        <small>${scene.myTimeLabel || "My Time"}</small>
      </div>
      <div class="timeline-pane yours">
        <small>${scene.yourTimeLabel || "Your Time"}</small>
      </div>
      <div class="timeline-eclipse" aria-hidden="true"></div>
      <button type="button" class="timeline-divider" aria-label="Drag to synchronize timelines"></button>
      <div class="timeline-sync-copy">${scene.idleMessage || "Drag to sync"}</div>
    `;

    const divider = wrap.querySelector(".timeline-divider");
    const syncCopy = wrap.querySelector(".timeline-sync-copy");
    let dragging = false;
    let hasMoved = false;

    const updateSplit = (clientX) => {
      const rect = wrap.getBoundingClientRect();
      const raw = ((clientX - rect.left) / rect.width) * 100;
      const split = Math.max(15, Math.min(85, raw));
      wrap.style.setProperty("--sync-split", `${split}%`);

      hasMoved = true;
      const synced = hasMoved;
      wrap.classList.toggle("synced", synced);
      if (syncCopy) {
        syncCopy.textContent = synced
          ? (scene.syncMessage || "Timelines synchronized.")
          : (scene.idleMessage || "Drag to sync");
      }
      if (synced) {
        stageLog.innerHTML = scene.syncMessage || "🌙 Timelines synchronized.";
      }
    };

    divider.addEventListener("pointerdown", (event) => {
      dragging = true;
      divider.setPointerCapture(event.pointerId);
      updateSplit(event.clientX);
    });

    divider.addEventListener("pointermove", (event) => {
      if (!dragging) {
        return;
      }
      updateSplit(event.clientX);
    });

    const stopDrag = () => {
      dragging = false;
    };

    divider.addEventListener("pointerup", stopDrag);
    divider.addEventListener("pointercancel", stopDrag);

    stageHotspots.appendChild(wrap);
  };

  const renderLondonRainHotspots = () => {
    renderInteractiveFactSceneHotspots("london-rain", "☔");
  };

  const renderAnimalKingdom = () => {
    const scene = sceneData["animal-kingdom"];
    (scene.parrots || []).forEach((parrot, idx) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "magic-hit parrot-dancer";
      item.style.left = `${parrot.left ?? 50}%`;
      item.style.top = `${parrot.top ?? 64}%`;
      item.style.setProperty("--parrot-scale", `${parrot.scale ?? 1}`);
      item.style.animationDelay = `${idx * 0.18}s`;

      if (parrot.src) {
        item.innerHTML = `<img src="${parrot.src}" alt="${parrot.label || "parrot"}" />`;
      } else {
        item.innerHTML = `<span>🦜</span>`;
      }

      item.addEventListener("click", () => {
        const label = parrot.label || `Parrot ${idx + 1}`;
        stageLog.innerHTML = `🦜 ${label} is dancing! `;
        dropSparkle(stage, "rgba(128,255,193,0.85)");
      });

      stageHotspots.appendChild(item);
    });
  };

  const renderParisHotspots = () => {
    const hotspots = sceneData.paris.hotspots;
    hotspots.forEach((spot) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "magic-hit paris-hit";
      btn.style.left = `${spot.left}%`;
      btn.style.top = `${spot.top}%`;
      btn.textContent = spot.label;
      btn.addEventListener("click", () => {
        stageLog.innerHTML = `🎬 ${spot.message}`;
        dropSparkle(stage, "rgba(255,218,185,0.9)");
      });
      stageHotspots.appendChild(btn);
    });
  };

  const startAmbientForScene = () => {
    clearAmbient();

    if (active === "sakura") {
      for (let i = 0; i < 14; i += 1) {
        setTimeout(spawnSakuraPetal, i * 180);
      }
      ambientTimer = setInterval(spawnSakuraPetal, 520);
      return;
    }

    if (active === "stars") {
      renderStarsHeartField();
      stageLog.innerHTML = "✨ Hover over the sky to gather stars into a heart.";
      return;
    }

    if (active === "shanghai") {
      renderShanghaiHotspots();
      return;
    }

    if (active === "late-night-sync") {
      renderLateNightSyncHotspots();
      stageLog.innerHTML = sceneData["late-night-sync"].idleMessage;
      return;
    }

    if (active === "london-rain") {
      renderLondonRainHotspots();
      startLondonRainExperience();
      return;
    }

    if (active === "animal-kingdom") {
      renderAnimalKingdom();
      stageLog.innerHTML = "🦜 Tap a parrot dancer. ";
      return;
    }

    if (active === "central-park") {
      for (let i = 0; i < 12; i += 1) {
        setTimeout(spawnFirefly, i * 130);
      }
      ambientTimer = setInterval(spawnFirefly, 900);
      return;
    }

    if (active === "paris") {
      renderParisHotspots();
    }
  };

  const syncScene = () => {
    if (!active) {
      stage.classList.remove("sakura-mode");
      stageImage.style.backgroundImage = "none";
      stageTitle.textContent = "";
      stageSubtitle.textContent = "";
      stageLog.innerHTML = "Choose a destination from the left, then enter the scene.";
      cards.forEach((card) => card.classList.remove("active"));
      selectorButtons.forEach((btn) => btn.setAttribute("aria-pressed", "false"));
      clearAmbient();
      return;
    }

    const data = sceneData[active];
    stage.classList.toggle("sakura-mode", active === "sakura");
    stageTitle.textContent = data.title;
    stageSubtitle.textContent = data.subtitle;

    stageLog.innerHTML = "Step into our world and feel the connection in every detail."
    lanternDock.innerHTML = "";
    if (active !== "paris") {
      closeParisCinematic();
    }
    stageImage.style.backgroundImage = `url('${data.image}')`;
    startAmbientForScene();

    cards.forEach((card) => card.classList.toggle("active", card.dataset.scene === active));
    selectorButtons.forEach((btn) =>
      btn.setAttribute("aria-pressed", btn.dataset.sceneSelect === active ? "true" : "false")
    );
  };

  const addLantern = (wishText) => {
    const lantern = document.createElement("div");
    lantern.className = "lantern-item";
    lantern.innerHTML = `<span>🏮</span><small>${wishText}</small>`;
    lanternDock.prepend(lantern);
  };

  const playAudio = (url, trackName) => {
    if (currentAudio) {
      currentAudio.pause();
    }
    currentAudio = new Audio(url);
    if (playerToggle) {
      playerToggle.textContent = "⏸";
    }
    currentAudio.onended = () => {
      if (playerToggle) {
        playerToggle.textContent = "▶";
      }
      updateNowPlaying("Romantic Piano Melody · Background Music");
    };
    currentAudio.play().catch(() => {
      stageLog.innerHTML = `⚠️ Could not play audio file: ${url}. Add your file to this path.`;
      updateNowPlaying(`🎵 Firefly music: failed to play (${url})`);
    });
    if (trackName) {
      updateNowPlaying(`${trackName}`);
    } else {
      updateNowPlaying(`${url}`);
    }
  };

  if (playerToggle) {
    playerToggle.addEventListener("click", () => {
      if (!currentAudio) {
        updateNowPlaying("Tap a Central Park firefly first to load a song.");
        return;
      }
      if (currentAudio.paused) {
        currentAudio.play().then(() => {
          playerToggle.textContent = "⏸";
        }).catch(() => {
          updateNowPlaying("Could not resume playback.");
        });
      } else {
        currentAudio.pause();
        playerToggle.textContent = "▶";
        updateNowPlaying("Paused · tap play to continue");
      }
    });
  }

  if (playerStop) {
    playerStop.addEventListener("click", stopAudio);
  }

  if (playerNext) {
    playerNext.addEventListener("click", () => {
      if (active !== "central-park") {
        updateNowPlaying("Next song works in Central Park scene.");
        return;
      }
      const songs = sceneData["central-park"].songs;
      if (!songs.length) {
        updateNowPlaying("No songs configured yet.");
        return;
      }
      lastFireflySongIndex = (lastFireflySongIndex + 1 + songs.length) % songs.length;
      const song = songs[lastFireflySongIndex];
      playAudio(song.url, song.title);
      stageLog.innerHTML = `🎵 Next firefly song: ${song.title}`;
    });
  }

  if (musicFab && musicDock && musicPanel) {
    musicFab.addEventListener("click", () => {
      const isOpen = musicDock.classList.toggle("open");
      musicFab.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.addEventListener("click", (event) => {
      if (!musicDock.classList.contains("open")) {
        return;
      }
      if (!musicDock.contains(event.target)) {
        musicDock.classList.remove("open");
        musicFab.setAttribute("aria-expanded", "false");
      }
    });
  }

  selectorButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextScene = btn.dataset.sceneSelect;
      const data = sceneData[nextScene];

      // Simple loading state
      if (stageImage) {
        stageImage.style.transition = "opacity 0.4s ease";
        stageImage.style.opacity = "0";
      }

      const img = new Image();
      img.src = data.image;

      const finishEnter = () => {
        active = nextScene;
        syncScene();
        enterFullscreenScene();
        if (stageImage) {
          // Delay slightly to allow background to set
          setTimeout(() => {
            stageImage.style.opacity = "1";
            // Add a subtle zoom effect class
            stageImage.classList.add("scene-enter-effect");
            setTimeout(() => stageImage.classList.remove("scene-enter-effect"), 2000);
          }, 50);
        }
      };

      if (img.complete) {
        finishEnter();
      } else {
        img.onload = finishEnter;
        img.onerror = finishEnter; // Fallback
      }
    });
  });

  document.querySelectorAll("[data-stage-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.stageAction;
      if (type === "note") {
        const note = prompt("Write a note for this scene:");
        if (note && note.trim()) {
          const line = document.createElement("div");
          line.textContent = `💬 ${note.trim()}`;
          stageLog.appendChild(line);
        }
      }
      if (type === "heart") {
        dropSparkle(stage, "rgba(255,105,180,0.9)");
      }
      if (type === "play-talk") {
        if (active !== "paris") {
          stageLog.innerHTML = "🎙️ Talk tracks are configured for Paris scene. Switch to Paris first.";
          return;
        }
        const track = sceneData.paris.talkTracks?.[0];
        if (track) {
          playAudio(track.url, track.title);
          stageLog.innerHTML = `🎙️ Playing talk track: ${track.title} (${track.url})`;
        }
      }
    });
  });


  function enterFullscreenScene() {
    stage.classList.add("fullscreen");
    document.body.style.overflow = "hidden";
    document.body.classList.add("scene-active");
    if (active === "paris") {
      openParisCinematic();
    }
  }

  if (exitImmersive) {
    exitImmersive.addEventListener("click", () => {
      stage.classList.remove("fullscreen");
      document.body.style.overflow = "";
      document.body.classList.remove("scene-active");
      closeParisCinematic();
      active = null;
      syncScene();
    });
  }

  if (parisPlay) {
    parisPlay.addEventListener("click", () => {
      const dialogues = sceneData.paris.dialogues || [];
      const line = dialogues[Math.floor(Math.random() * dialogues.length)] ||
        'Please Listen ... to catch every word of the conversation';
      if (parisDialogue) {
        parisDialogue.textContent = line;
      }
      const track = sceneData.paris.talkTracks?.[0];
      if (track) {
        playAudio(track.url, track.title);
      }
    });
  }

  if (parisReturn) {
    parisReturn.addEventListener("click", () => {
      closeParisCinematic();
      stage.classList.remove("fullscreen");
      document.body.style.overflow = "";
      document.body.classList.remove("scene-active");
      active = null;
      syncScene();
    });
  }

  syncScene();
}

function dropSparkle(target, color) {
  const sparkle = document.createElement("span");
  sparkle.className = "floating";
  sparkle.style.left = `${Math.random() * 80 + 10}%`;
  sparkle.style.background = color;
  sparkle.style.top = "80%";
  target.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 6000);
}
