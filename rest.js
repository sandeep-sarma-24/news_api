const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const app = express();
const port = 3000;

async function times_of_india() {
  const toi_news = {
    'top_news_url': 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    'world_news_url': 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms',
    'tech_news_url': 'https://timesofindia.indiatimes.com/rssfeeds/66949542.cms',
    'science_url': 'https://timesofindia.indiatimes.com/rssfeeds/-2128672765.cms',
    'hyderabad_url': 'https://timesofindia.indiatimes.com/rssfeeds/-2128816011.cms'
  };

  const results = {};
  
  for (const [news_topic, news_url_item] of Object.entries(toi_news)) {
    try {
      const response = await axios.get(news_url_item);
      if (response.status === 200) {
        const parsed = await xml2js.parseStringPromise(response.data);
        const items = parsed.rss.channel[0].item;

        const titles = items.map(item => item.title[0]);
        const links = items.map(item => item.link[0]);
        const images = items.map(item => item.enclosure[0].$.url);
        const descriptions = items.map(item => item.description[0]);

        results[news_topic] = titles.map((title, i) => ({
          Title: title,
          Link: links[i],
          'Image URL': images[i],
          Description: descriptions[i]
        }));
      } else {
        console.log(`Error fetching RSS feed for ${news_topic}. Status Code: ${response.status}`);
      }
    } catch (e) {
      console.log(`Error processing ${news_topic}: ${e}`);
    }
  }
  
  return results;
}

app.get('/toi', async (req, res) => {
  const news = await times_of_india();
  res.json(news);
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
