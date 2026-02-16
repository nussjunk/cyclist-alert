// ==UserScript==
// @name         Torn City - Cyclist Sonar (Flash + Sound)
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Flashes screen and plays a sonar ping when "Cyclist" is found.
// @author       nussjunk.com
// @match        https://www.torn.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURATION ---
    const TARGET_WORD = "Cyclist";
    const FLASH_DURATION = 5000;
    const COOLDOWN_TIME = 10000;
    
    // This is a short "Sonar Ping" sound encoded in text so it loads instantly
    const SONAR_SOUND = "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AA0WAgAAAAAAabwAAAAABDw4AA47AAAAAAOgpOTPAAAAAB9FB4sAAAAAAtJvAAAAAAA0ZAAAABcAAAAAAAAAAADjyAAOBALeIAAGAQAJBIMWEgWDBSQxKJQKCgSCQDigUSgIGAmFQljoX3e7e3t7u3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t/7++t7/3/3//////4z///+Z";

    let isActive = false;
    let lastTriggerTime = 0;
    let audioObj = new Audio(SONAR_SOUND);

    // 1. Visual Indicator (Green Dot)
    function createStatusIndicator() {
        const dot = document.createElement('div');
        dot.style.cssText = `position: fixed; bottom: 5px; right: 5px; width: 8px; height: 8px; background-color: #00ff00; border-radius: 50%; z-index: 9999999; pointer-events: none; opacity: 0.5;`;
        document.body.appendChild(dot);
    }

    // 2. The Alert Logic (Sound + Flash)
    function triggerAlert() {
        const now = Date.now();
        if (isActive || (now - lastTriggerTime < COOLDOWN_TIME)) return;

        isActive = true;
        lastTriggerTime = now;

        // --- AUDIO PART ---
        // We try to play the sound. iOS might block it if you haven't tapped recently.
        audioObj.play().catch(e => console.log("Audio blocked by iOS autoplay rules:", e));

        // --- VISUAL PART ---
        const overlay = document.createElement('div');
        overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 2147483647; pointer-events: none; display: block;`;
        document.body.appendChild(overlay);

        const colors = ['rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(0, 0, 255, 0.5)'];
        let colorIndex = 0;

        const intervalId = setInterval(() => {
            overlay.style.backgroundColor = colors[colorIndex];
            colorIndex = (colorIndex + 1) % colors.length;
        }, 200);

        setTimeout(() => {
            clearInterval(intervalId);
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            isActive = false;
        }, FLASH_DURATION);
    }

    // 3. Scanner
    function scanPage() {
        if (document.body.innerText.includes(TARGET_WORD)) {
            triggerAlert();
        }
    }

    // 4. Observer
    const observer = new MutationObserver((mutations) => {
        if (!isActive) scanPage();
    });

    function init() {
        createStatusIndicator();
        scanPage();
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
