const express = require('express')
const app = express()
const request = require('request')
const path = require('path')
const asyncNode = require('async')
let exchanges = ["Coinbase", "Bitfinex", "Binance", "CoinEx","HuobiPro"]

app.use('/', express.static(path.join(__dirname, 'public')))

const getExchangeData = function(url, callback){
    request(url, (err, response, body) => {
        let parsedResponse = JSON.parse(body);
        let data = parsedResponse.Data.map(function(item){
            item.time = item.time * 1000;
            return item;
        })
        callback(data)
    })
}

app.get('/exchange', (req, res) => {
    let dataToSend = [];

    asyncNode.each(exchanges, (currentExchange, done) => {
        let url = "https://min-api.cryptocompare.com/data/exchange/histoday?e=" + currentExchange + "&tsym=USD&limit=30&aggregate=1&extraParams=your_app_name"
        getExchangeData(url, (data) => {
            dataToSend.push({"id": currentExchange, "values": data})
            done()
        });
    }, () => {
        res.send(JSON.stringify(dataToSend))
    })

    
})

app.listen(3000, () => console.log('App listening on port 3000!'))