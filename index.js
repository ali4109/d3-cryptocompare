const express = require('express')
const app = express()
const request = require('request')
const path = require('path')
const asyncNode = require('async')
let cache = {};
let lastTs = 0;
let exchanges = [
    "BTCChina","Bitstamp","OKCoin","Coinbase","Poloniex",
    "Cexio","BitTrex","Kraken","Bitfinex","LocalBitcoins",
    "itBit","HitBTC","Coinfloor","LakeBTC","Bit2C",
    "CCEX","Gatecoin","Gemini","Cryptopia","Exmo","Yobit","Korbit",
    "BitBay","BTCMarkets","Coincheck","QuadrigaCX","BitSquare","Vaultoro",
    "MercadoBitcoin","Bitso","Paymium","TheRockTrading","bitFlyer","Quoine",
    "Luno","EtherDelta","bitFlyerFX","TuxExchange","Liqui","BitMarket",
    "LiveCoin","Coinone","Tidex","Bleutrade","EthexIndia","Bithumb","Zaif",
    "WavesDEX","Binance","Lykke","Remitano","Coinroom","Gateio",
    "HuobiPro","OKEX","EXX","Kucoin","TrustDEX","BitZ","TradeSatoshi",
    "BitFlip","Foxbit","ChileBit","VBTC","Coincap","Coinnest","Velox",
    "LAToken","BitBank","Graviex","ExtStock","Upbit","IDEX","DSX",
    "CoinEx","Braziliex","Bitlish","AidosMarket","TokenStore","CoinDeal",
    "Ethfinex","Buda","CoinCorner","BitMart","BTCTurk","Neraex",
    "ZB","LBank","Bibox","Bitmex","DDEX","SingularityX","Nebula","Simex",
    "RightBTC","WEX","ABCC","OpenLedger","Kuna","CryptoCarbon",
    "BitexBook","WorldCryptoCap","FCoin","BigONE","CoinBene","IndependentReserve",
    "Qryptos","HADAX","BTCBOX","Hikenex","Nexchange","CryptoBulls","IDAX",
    "Tokenomy","CoinHub","DEx"
]

app.use('/', express.static(path.join(__dirname, 'public')))

const getExchangeData = function(url, callback){
    request(url, (err, response, body) => {
        if (err) {
            callback(null)
            return;
        }
        let parsedResponse = JSON.parse(body);
        let data = parsedResponse.Data.map(function(item){
            item.time = item.time * 1000;
            return item;
        })
        callback(data)
    })
}

app.get('/exchange', (req, res) => {
    if (Date.now() - lastTs < 1000*60*30) {
        console.log("sending cache")
        res.send(cache)
    } else {
        let allData = {};
        asyncNode.eachSeries(exchanges, (currentExchange, done) => {
            let url = "https://min-api.cryptocompare.com/data/exchange/histoday?e=" + currentExchange + "&tsym=USD&limit=30&aggregate=1&extraParams=your_app_name"
            console.log(url);
            getExchangeData(url, (data) => {
                if (data != null) {
                    if (currentExchange === "IndependentReserve") {
                        currentExchange = "IR"
                    }
                    allData[currentExchange] = ({"id": currentExchange, "values": data})
                } else {
                    console.log("null " + currentExchange);
                }
                setTimeout(done, 200)
            });
        }, () => {
            let dataToSend = []
            let exchanges = Object.keys(allData).sort()
            for (let i=0; i<exchanges.length; i++) {
                dataToSend.push(allData[exchanges[i]])
            }
            console.log("done")
            lastTs = Date.now();
            cache = dataToSend;
            res.send(JSON.stringify(dataToSend))
        })
    }
})

app.listen(3000, () => console.log('App listening on port 3000!'))