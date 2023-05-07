import axios from 'axios'
import TelegramBot from 'node-telegram-bot-api'
import shortNumber from '@pogix3m/short-number';
import express from 'express'
import {convert} from 'html-to-text';
import * as dotenv from 'dotenv'

dotenv.config()

const TOKEN = process.env.TOKEN || "5931738762:AAEoeKavD9HAky8dE9pU6IVGydPLRY4om_Q"
const API_KEY = process.env.X_RapidAPI_Key || "65ec0c991cmshd9ff5d22f3e8bc8p1a58c0jsn98de86d5a6b9"
const PORT = process.env.PORT || 5000
const app = express()
const bot = new TelegramBot(TOKEN, {polling: true});

const options = {
    method: 'GET',
    url: 'https://coinranking1.p.rapidapi.com/coins',
    
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com'
    }
  };

  const options2 = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com'
    }
  };

  const options3 = {
    method: 'GET',
    headers: {
      'X-BingApis-SDK': 'true',
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': 'bing-news-search1.p.rapidapi.com'
    }
  };

app.get('/',(req,res)=>{
    res.send('Hello traders!!')
});


axios.request(options).then(function(response){
   const coins  = response.data.data.coins
   const{
          total,
          totalCoins,
          totalMarkets,
          totalExchanges,
          totalMarketCap,
          total24hVolume
        } = response.data.data.stats

    bot.on('message',(message)=>{
        const userId = message.chat.id
        const name = message.from.first_name + " " + message.from.last_name
        const input = message.text

        if(input=="hello" || input=="hi" || input=="Hello"){
            bot.sendMessage(userId,`Hello ${name} this is trading status bot. send help or /start for instructions.`)
        }

        if(input=="/start" || input=="help" || input=="Help"){
            bot.sendMessage(userId,`
            Hello ${name}! Welcome to trading status bot by Pal Bijewar. 
            Here are the tools that you can do with this bot :
            💱 "Stats" - To get current statasticts of crypto currencies.
            💱 "Bitcoin"(or any other crypto name) - To get the information of that particular crypto currency.
            💱 "List" - To get list of all the crypto currency with there rank, name , id , etc.
            💱 "News Bitcoin"(or any other crypto name) - To get latest five news articles about the particular crypto currency.
            ⚠️ Make sure you are using given format for the name to get accurate information.
            ℹ️ If the name donot work so type "list" to fetch all the available crypto currency and choose accordingly from them.
            💲 Thanks for using this bot! 💲
            `)}
        
            if(input=="Stats" || input=="stats"){
                bot.sendMessage(userId,
                    `   Total = ${shortNumber(total)}
                    Total Coins = ${shortNumber(totalCoins)}
                    Total Markets = ${shortNumber(totalMarkets)}
                    Total Exchanges = ${shortNumber(totalExchanges)}
                    Total Market Cap = ${shortNumber(totalMarketCap)}
                    Total 24h Volume = ${shortNumber(total24hVolume)}
           `)}
    
           const crypto = (query) => {

            function toTitleCase(str) {
                return str.replace(
                  /\w\S*/g,
                  function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                  }
                );
              }

            function toUpperCase(str) {
                return str.replace(
                  /\w\S*/g,
                  function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toUpperCase();
                  }
                );
            }

              const item = toTitleCase(query)
              const item2 = toUpperCase(query)

            coins.filter(coin => {
                if (item === coin.name || query===coin.name || item2 === coin.name) {
                    const uuid = coin.uuid
                    const url = `https://coinranking1.p.rapidapi.com/coin/${uuid}?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=24h`;
        

                    fetch(url, options2)
                    .then(res => res.json())
                    .then(json => {
                        const data = json.data.coin
                        bot.sendMessage(userId,`
                        Rank = ${data.rank}
                        Name = ${data.name}
                        Symbol = ${data.symbol}
                        Price = ${shortNumber(data.price)}
                        Number of Markets = ${shortNumber(data.numberOfMarkets)}
                        Number of Exchanges = ${shortNumber(data.numberOfExchanges)}
                        24h Volume = ${shortNumber(data['24hVolume'])}
                        Market Cap = ${shortNumber(data.marketCap)}
                        Official Website = ${data.websiteUrl}
                        Description = 
                        ${convert(data.description)}
                        Learn More = ${data.coinrankingUrl}
                        `)

                        data?.links?.map(link=>{
                            bot.sendMessage(userId,
                                `${link.name}-->${link.url}`
                                )
                        })
                    })
                    .catch(err => console.error('error:' + err));
                }

            })
        }
        crypto(input)


        const cryptoNews = (query) => {

            function toLowerCase(str) {
                return str.replace(
                  /\w\S*/g,
                  function(txt) {
                    return txt.charAt(0).toLowerCase() + txt.substr(1).toLowerCase();
                  }
                );
              }

              const item = toLowerCase(query)

            coins.filter(coin => {
                if (item.includes('news' || 'News')) {

                    const q = item.slice(5)
                    const url = `https://bing-news-search1.p.rapidapi.com/news/search?q=${q}&count=5&freshness=Day&textFormat=Raw&safeSearch=Off`
        
                fetch(url, options3)
                .then(res => res.json())
                .then(json => {
                    const data = json?.value
                    data?.map(item=>{
                        bot.sendMessage(userId,`
                        ${item?.about[0]?.name}
                        Title -> ${item?.name}
                        Description -> ${item?.description}
                        ${item.url}
                        `)
                        
                    })
                })
                .catch(err => console.error('error:' + err));
                }
            })
        }
        
        cryptoNews(input)


        if (input === 'crypto list' || input === 'list' || input === 'show all crypto') {
            for (let i = 0; i <= coins.length; i++) {
                bot.sendMessage(userId,
                    `
                    Rank - ${coins[i].rank}
                    Name - ${coins[i].name}
                    id - ${coins[i].uuid}
                    `)
            }
        }
    })

}).catch (function(error){
    console.error(error);
}); 
	

app.listen(PORT,()=>{
    console.log('server runing at PORT!')
});

