const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateScreenshots() {
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set viewport to mobile logical size with 3x scale factor
    // 428 x 926 * 3 = 1284 x 2778
    await page.setViewport({ 
        width: 428, 
        height: 926, 
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true
    });

    const htmlPath = path.resolve(__dirname, '..', 'index.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    // Hide topbar because we want just the slide content.
    await page.addStyleTag({ content: `
        .topbar { display: none !important; }
    ` });

    // Wait for the initial load animations
    await new Promise(r => setTimeout(r, 2000));

    const slides = [
        { id: 'slide-1', name: '01_hero' },
        { id: 'slide-2', name: '02_market' },
        { id: 'slide-3', name: '03_alert' },
        { id: 'slide-4', name: '04_ai' },
        { id: 'slide-5', name: '05_insights' },
        { id: 'slide-7', name: '06_theme' }
    ];

    for (const slide of slides) {
        console.log(`Capturing ${slide.name}...`);
        
        const element = await page.$(`#${slide.id}`);
        if (element) {
            // Scroll to the slide
            await page.evaluate((el) => {
                el.scrollIntoView({ behavior: 'instant', block: 'start' });
            }, element);

            // Wait for any entry animations to settle
            await new Promise(r => setTimeout(r, 1500));

            const scrollY = await page.evaluate(() => window.scrollY);

            // Capture exactly the 428x926 logical viewport (1284x2778 physical)
            await page.screenshot({
                path: path.join(outputDir, `${slide.name}.png`),
                clip: {
                    x: 0,
                    y: scrollY,
                    width: 428,
                    height: 926
                }
            });
            console.log(`Saved ${slide.name}.png`);
        }
    }

    await browser.close();
    console.log('All screenshots generated successfully!');
}

generateScreenshots().catch(console.error);
