const puppeteer = require('puppeteer');

const jokesList = [
    "😂 Santosh: Yaar, biwi se jhagdne ke baad mujhe ek baat samajh aa gayi...\n\nPappu: Kya?\n\nSantosh: Ki jeet chahe kisi ki bhi ho, aakhir mein bartan humein hi saaf karne padte hain! 😜 ROFL",
    "🔥 Husband: Suno, agar main kho jaun toh tum kya karogi?\n\nWife: Main police mein report kar dungi aur kya!\n\nHusband (khush hokar): Aur agar main kisi doosri aurat ke sath mila toh?\n\Wife: Toh main police ko bolungi ki purana wala wapas nahi chahiye, naya hi theek hai! 🤣",
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
        console.log("Navigating to Facebook login page...");
        await page.goto('https://m.facebook.com/login', { waitUntil: 'networkidle2' });

        const username = process.env.FB_USERNAME;
        const password = process.env.FB_PASSWORD;

        if (!username || !password) {
            console.error("Error: FB_USERNAME or FB_PASSWORD environment variables are missing!");
            return;
        }

        console.log("Entering credentials...");
        await page.type('input[name="email"]', username, { delay: 50 });
        await page.type('input[name="pass"]', password, { delay: 50 });

        // Password type karne ke baad Enter press karein (sabse reliable method)
        console.log("Pressing Enter to submit login...");
        await Promise.all([
            page.keyboard.press('Enter'),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {})
        ]);

        await new Promise(r => setTimeout(r, 4000));
        console.log("Login attempted. Current URL:", page.url());

        if (page.url().includes('checkpoint') || page.url().includes('login')) {
            console.log("Login failed or Security checkpoint detected (OTP/Two-Factor required).");
            return;
        }

        console.log("Navigating to Facebook composer...");
        await page.goto('https://m.facebook.com/composer/', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 4000));

        const randomJoke = jokesList[Math.floor(Math.random() * jokesList.length)] + "\n\n#Funny #Jokes #DesiComedy";

        // Text box dhoondhne ke liye thoda wait aur multiple selectors
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
