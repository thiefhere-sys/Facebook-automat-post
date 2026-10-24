// ==UserScript==
// @name         Facebook Fully Automated Auto Scroll, Post Opener and Auto-Posting Jokes
// @namespace    http://tampermonkey.net/
// @version      10.0
// @description  Fully automated Facebook mobile joke poster with robust post submit finder
// @match        https://m.facebook.com/*
// @match        https://m.facebook.com/composer/*
// @updateURL    https://raw.githubusercontent.com/thiefhere-sys/Facebook-automat-post/main/facebook-jokes.user.js
// @downloadURL  https://raw.githubusercontent.com/thiefhere-sys/Facebook-automat-post/main/facebook-jokes.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const scrollHeight = 3;
    const scrollInterval = 50;

    let scrollTimer = null;
    let isScrolling = false;

    // 🔥 Hinglish jokes ki list (Array)
    const jokesList = [
        "😂 Santosh: Yaar, biwi se jhagdne ke baad mujhe ek baat samajh aa gayi...\n\nPappu: Kya?\n\nSantosh: Ki jeet chahe kisi ki bhi ho, aakhir mein bartan humein hi saaf karne padte hain! 😜 ROFL",
        "🔥 Husband: Suno, agar main kho jaun toh tum kya karogi?\n\nWife: Main police mein report kar dungi aur kya!\n\nHusband (khush hokar): Aur agar main kisi doosri aurat ke sath mila toh?\n\nWife: Toh main police ko bolungi ki purana wala wapas nahi chahiye, naya hi theek hai! 🤣",
        "😜 Santa aur Banta:\n\nSanta: Yaar, kal raat mere ghar chor aaya aur saari tijori khali karke chala gaya...\n\nBanta: Arre bhai, police mein report ki?\n\nSanta: Nahi yaar, khushi ke maare so gaya ki kam se kam kisi ne toh maana ki meri tijori mein kuch tha toh sahi! 😭😂",
        "😎 Teacher: Kal school kyun nahi aaye the?\n\nPappu: Sir, raste mein ek board laga tha jispe likha tha 'Aage School hai, Kripya dheere chalein'. Isiliye main poora din dheere-dheere hi chalta raha! 🐢😂",
        "📱 Aaj ka gyaan:\n\nJo ladkiyan subah jaldi uth kar ghar ki safai karti hain...\n\nUnke pati WhatsApp par sabse zyada 'Good Morning' ke GIF bhejte hain! 😜😂",
        "💥 Doctor: Agar jeena hai toh cigarette aur alcohol dono chhod do!\n\nPatient: Doctor sahab, iske baad kitne saal aur jiyunga?\n\nDoctor: Pata nahi, par jitne bhi din jiyoge, bahut lambe aur boring lagenge! 🤣",
        "🐒 Santa: Pata hai, meri biwi mujhe bhagwan manti hai...\n\nBanta: Wow, kaise?\n\nSanta: Kyunki wo na toh mujhe dekhti hai aur na hi kabhi mandir mein milti hai, bas andhon ki tarah pooja karti rehti hai! 🙈😂",
        "🎯 Pappu ki English class:\n\nTeacher: 'He is running' ko past tense mein badlo.\n\nPappu: 'Woh bhaag raha tha, par ab pakda gaya!' 🏃‍♂️💨😂",
        "💡 Santa: Yaar, bijli ka bill dekh kar dil dahad utha hai!\n\nBanta: Arre bhai, AC chalaya hoga na?\n\nSanta: Nahi yaar, AC toh band tha, bas phone ka charger socket mein laga chhod diya tha! 🔌💸😂"
    ];

    let currentJokeText = jokesList[0];

    // Container UI
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    document.body.appendChild(container);

    // Helper function for click simulation
    function triggerClick(element) {
        ['mouseover', 'mousedown', 'mouseup', 'click'].forEach(eventType => {
            const event = new MouseEvent(eventType, {
                bubbles: true,
                cancelable: true,
                view: window
            });
            element.dispatchEvent(event);
        });
    }

    // Function to pick a random fresh joke from the list
    function getFreshJoke() {
        const randomIndex = Math.floor(Math.random() * jokesList.length);
        currentJokeText = jokesList[randomIndex] + "\n\n#Funny #Jokes #DesiComedy";
    }

    // Function to fill joke into the text box properly
    function fillJoke() {
        let inputField = document.querySelector('div[contenteditable="true"][role="textbox"], div[contenteditable="true"], textarea');
        
        if (!inputField) {
            const allDivs = document.querySelectorAll('div, span');
            for (let el of allDivs) {
                if (el.innerText && (el.innerText.includes('यहाँ कुछ लिखें') || el.innerText.includes("What's on your mind"))) {
                    inputField = el;
                    break;
                }
            }
        }

        if (inputField) {
            inputField.focus();
            triggerClick(inputField);

            setTimeout(() => {
                if (inputField.tagName === 'TEXTAREA') {
                    inputField.value = currentJokeText;
                    inputField.dispatchEvent(new Event('input', { bubbles: true }));
                    inputField.dispatchEvent(new Event('change', { bubbles: true }));
                } else {
                    document.execCommand('selectAll', false, null);
                    document.execCommand('insertText', false, currentJokeText);
                    
                    if (!inputField.innerText.includes('Santosh') && !inputField.innerText.includes('Husband')) {
                        inputField.innerText = currentJokeText;
                        inputField.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: currentJokeText }));
                    }
                }
            }, 300);
        }
    }

    // Ultra-reliable Function to click "पोस्ट करें" / "Post" Button anywhere on DOM
    function clickPostSubmit() {
        let submitBtn = null;
        
        const elements = document.querySelectorAll('button, span, div, a, input');
        for (let el of elements) {
            const text = el.innerText ? el.innerText.trim() : (el.value ? el.value.trim() : '');
            if (text === 'पोस्ट करें' || text === 'Post') {
                submitBtn = el;
                break;
            }
        }

        if (submitBtn) {
            submitBtn.scrollIntoView({ block: 'center' });
            setTimeout(() => {
                triggerClick(submitBtn);
                if (submitBtn.parentElement) {
                    triggerClick(submitBtn.parentElement);
                }
            }, 200);
            console.log('Post submit button clicked successfully!');
            return true;
        } else {
            console.log('Post submit button nahi mila!');
            return false;
        }
    }

    // Fully Automated Routine Function with optimized delays
    function runFullAutomation() {
        if (!window.location.href.includes('/composer/')) {
            window.location.href = "https://m.facebook.com/composer/";
            return;
        }

        getFreshJoke();
        
        setTimeout(() => {
            fillJoke();
            
            setTimeout(() => {
                clickPostSubmit();
            }, 3000);

        }, 1500);
    }

    // 1. Fully Automated Start/Stop Toggle Button
    const autoButton = document.createElement('button');
    autoButton.innerHTML = '🤖 Start Full Auto';
    autoButton.style.padding = '10px 15px';
    autoButton.style.backgroundColor = '#9c27b0';
    autoButton.style.color = '#fff';
    autoButton.style.border = 'none';
    autoButton.style.borderRadius = '5px';
    autoButton.style.fontSize = '14px';
    autoButton.style.fontWeight = 'bold';
    autoButton.style.cursor = 'pointer';
    autoButton.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';

    let autoTimer = null;
    autoButton.addEventListener('click', () => {
        if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
            autoButton.innerHTML = '🤖 Start Full Auto';
            autoButton.style.backgroundColor = '#9c27b0';
        } else {
            autoButton.innerHTML = '🛑 Stop Full Auto';
            autoButton.style.backgroundColor = '#e91e63';
            
            runFullAutomation();
            autoTimer = setInterval(() => {
                runFullAutomation();
            }, 35000);
        }
    });
    container.appendChild(autoButton);

    // 2. Manual Single Joke Post Button
    const jokeButton = document.createElement('button');
    jokeButton.innerHTML = '🤣 Post New Joke';
    jokeButton.style.padding = '10px 15px';
    jokeButton.style.backgroundColor = '#FF9800';
    jokeButton.style.color = '#fff';
    jokeButton.style.border = 'none';
    jokeButton.style.borderRadius = '5px';
    jokeButton.style.fontSize = '14px';
    jokeButton.style.fontWeight = 'bold';
    jokeButton.style.cursor = 'pointer';
    jokeButton.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';

    jokeButton.addEventListener('click', () => {
        getFreshJoke();
        fillJoke();
        setTimeout(() => {
            clickPostSubmit();
        }, 2000);
    });
    container.appendChild(jokeButton);

    // 3. Direct Post Submit Button ("पोस्ट करें" button)
    const submitButton = document.createElement('button');
    submitButton.innerHTML = '📢 पोस्ट करें';
    submitButton.style.padding = '10px 15px';
    submitButton.style.backgroundColor = '#4CAF50';
    submitButton.style.color = '#fff';
    submitButton.style.border = 'none';
    submitButton.style.borderRadius = '5px';
    submitButton.style.fontSize = '14px';
    submitButton.style.fontWeight = 'bold';
    submitButton.style.cursor = 'pointer';
    submitButton.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';

    submitButton.addEventListener('click', () => {
        clickPostSubmit();
    });
    container.appendChild(submitButton);

    // 4. Auto Scroll Button
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '▶ Start Scroll';
    scrollButton.style.padding = '10px 15px';
    scrollButton.style.backgroundColor = '#4267B2';
    scrollButton.style.color = '#fff';
    scrollButton.style.border = 'none';
    scrollButton.style.borderRadius = '5px';
    scrollButton.style.fontSize = '14px';
    scrollButton.style.fontWeight = 'bold';
    scrollButton.style.cursor = 'pointer';
    scrollButton.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';

    scrollButton.addEventListener('click', () => {
        if (isScrolling) {
            clearInterval(scrollTimer);
            scrollTimer = null;
            isScrolling = false;
            scrollButton.innerHTML = '▶ Start Scroll';
            scrollButton.style.backgroundColor = '#4267B2';
        } else {
            scrollTimer = setInterval(() => {
                window.scrollBy({
                    top: scrollHeight,
                    behavior: 'smooth'
                });
            }, scrollInterval);
            isScrolling = true;
            scrollButton.innerHTML = '⏸ Stop Scroll';
            scrollButton.style.backgroundColor = '#d9534f';
        }
    });
    container.appendChild(scrollButton);
})();
