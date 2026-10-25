const puppeteer = require('puppeteer');
const fs = require('fs');

const jokesList = [
    "😂 Santosh: Yaar, biwi se jhagdne ke baad mujhe ek baat samajh aa gayi...\n\nPappu: Kya?\n\nSantosh: Ki jeet chahe kisi ki bhi ho, aakhir mein bartan humein hi saaf karne padte hain! 😜 ROFL",
    "🔥 Husband: Suno, agar main kho jaun toh tum kya karogi?\n\nWife: Main police mein report kar dungi aur kya!\n\nHusband (khush hokar): Aur agar main kisi doosri aurat ke sath mila toh?\n\nWife: Toh main police ko bolungi ki purana wala wapas nahi chahiye, naya hi theek hai! 🤣",
    "😜 Santa aur Banta:\n\nSanta: Yaar, kal raat mere ghar chor aaya aur saari tijori khali karke chala gaya...\n\nBanta: Arre bhai, police mein report ki?\n\nSanta: Nahi yaar, khushi ke maare so gaya ki kam se kam kisi ne toh maana ki meri tijori mein kuch tha toh sahi! 😭😂",
    "😎 Teacher: Kal school kyun nahi aaye the?\n\nPappu: Sir, raste mein ek board laga tha jispe likha tha 'Aage School hai, Kripya dheere chalein'. Isiliye main poora din dheere-dheere hi chalta raha! 🐢😂",
    "📱 Aaj ka gyaan:\n\nJo ladkiyan subah jaldi uth kar ghar ki safai karti hain...\n\nUnke pati WhatsApp par sabse zyada 'Good Morning' ke GIF bhejte hain! 😜😂",
    "💥 Doctor: Agar jeena hai toh cigarette aur alcohol dono chhod do!\n\nPatient: Doctor sahab, iske baad kitne saal aur jiyunga?\n\nDoctor: Pata nahi, par jitne bhi din jiyoge, bahut lambe aur boring lagenge! 🤣"
];

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1');
    await page.setViewport({ width: 390, height: 844 });

    try {
        // GitHub Secret se jo fbccooky.json file bani hai, use load aur clean karein
        if (fs.existsSync('fbccooky.json')) {
            const cookiesString = fs.readFileSync('fbccooky.json', 'utf8');
            let cookies = JSON.parse(cookiesString);
            
            cookies = cookies.map(cookie => {
                delete cookie.session;
                delete cookie.storeId;
                if (cookie.partitionKey === null) {
                    delete cookie.partitionKey;
                }
                return cookie;
            });

            await page.setCookie(...cookies);
            console.log("Cookies loaded and cleaned successfully!");
        } else {
            console.log("Cookies file not found!");
            return;
        }

        // Direct Facebook composer par jayein (Login ki zaroorat nahi)
        console.log("Navigating to Facebook composer...");
        await page.goto('https://m.facebook.com/composer/', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 4000));

        // Check karein ki cookies valid hain ya login page par redirect ho gaya
        if (page.url().includes('login')) {
            console.log("Cookies expired or invalid.");
            return;
        }

        const randomJoke = jokesList[Math.floor(Math.random() * jokesList.length)] + "\n\n#Funny #Jokes #DesiComedy";

        // Text box dhoondhne ke liye wait aur multiple selectors
        let textBox = await page.$('div[contenteditable="true"], textarea, div[role="textbox"]');
        if (!textBox) {
            await new Promise(r => setTimeout(r, 3000));
            textBox = await page.$('div[contenteditable="true"], textarea, div[role="textbox"]');
        }

        if (textBox) {
            await textBox.click();
            await page.keyboard.type(randomJoke);
            console.log("Joke typed into box.");
            await new Promise(r => setTimeout(r, 2000));

            // Post submit button click using safe evaluation
            await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('button, span, div, a'));
                const submitBtn = elements.find(el => {
                    const text = el.innerText ? el.innerText.trim() : '';
                    return text === 'पोस्ट करें' || text === 'Post';
                });
                if (submitBtn) {
                    submitBtn.click();
                }
            });
            console.log("Post submit triggered!");

            await new Promise(r => setTimeout(r, 5000));
        } else {
            console.log("Text box not found!");
        }

    } catch (error) {
        console.error("Error during automation:", error);
    } finally {
        await browser.close();
    }
})();
