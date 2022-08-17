import puppeteer from "puppeteer";
import * as cheerio from 'cheerio';
import http from "http";

const server = http.createServer(async (req, res) => {
    if (req.method === 'POST') {
        let body = ''
            req.on('data', (chunk) => {
            body += chunk.toString()
            })
            req.on('end', async () => {
                let { url } =  JSON.parse(body);
                console.log(url);

                const browser = await puppeteer.launch();

                const page = await browser.newPage();
                await page.goto(url);
                const title = await page.title();
                console.log("Page Title : "+title);

                const imageUrl = await page.evaluate(() => {
                    const srcs = Array.from(
                      document.querySelectorAll("img")
                    ).map((image) => image.getAttribute("src"));
                    return srcs;
              });
              console.log("Page has been evaluated!", imageUrl);

              const description = await page.evaluate(() => {
                return document.querySelectorAll("head > meta[name='description']")[0].content
              });
              console.log(description);


                await browser.close();
                
                const result = {
                    title: title,
                    description: description,
                    imageUrls: imageUrl
                }

                res.writeHead(200, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify(result));
            })

            req.on('error', (error) => {
                console.log(error);
            });

    };
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));

