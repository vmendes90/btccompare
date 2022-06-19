//express js
const express = require('express');
const app = express();
app.use(express.static("public"));
//port
const port = process.env.PORT || 3000;
//coingeck API
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
//ejs
app.set('view engine', 'ejs'); 
//fs para passar info da console para txt
const fs = require('fs');  //para usar o myConsole para escrever o array inteiro num txt
const { Console } = require('console');
const myConsole = new console.Console(fs.createWriteStream('./output.txt')); //para usar o myConsole para escrever o array inteiro num txt
//body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
let lastTime = new Date();
let data;


let comparePrices = async () => { // Queria fazer para uma lista de X moedas, mas após conseguir tirar os id's que queria, não consegui associar com o respetivo preço


    let bitcoinPrice = await CoinGeckoClient.simple.price({ ids: ["bitcoin"] }); // preço simples da bitcoin , só para testar, nao retorna nada daqui
    //let exchangerList = await CoinGeckoClient.exchanges.list(); //usei para ir buscar os ID dos exchangers
    //exchangerList.data.forEach(item => myConsole.log(item))  //exchange ID pretendido: binance, gdax (coinbase), bitstamp, kraken , poloniex , ftx_spot .. depois ver outros

    let btcBinance = await CoinGeckoClient.exchanges.fetchTickers("binance", { coin_ids: ["bitcoin"] }); //buscar todos os pares BTC qualquer coisa da Binance
    let btcGdax = await CoinGeckoClient.exchanges.fetchTickers("gdax", { coin_ids: ["bitcoin"] }); //buscar todos os pares BTC qualquer coisa da Coinbase
    let btcBitStamp = await CoinGeckoClient.exchanges.fetchTickers("bitstamp", { coin_ids: ["bitcoin"] }); //buscar todos os pares BTC qualquer coisa da bitstamp
    let btcKraken = await CoinGeckoClient.exchanges.fetchTickers("kraken", { coin_ids: ["bitcoin"] }); //buscar todos os pares BTC qualquer coisa da kraken
    //let btcPoloniex = await CoinGeckoClient.exchanges.fetchTickers("poloniex",{ coin_ids: ["bitcoin"]}); //buscar todos os pares BTC qualquer coisa da poloniex EXCLUIDO DEVIDO A LIMITE
    let btcFtx = await CoinGeckoClient.exchanges.fetchTickers("ftx_spot", { coin_ids: ["bitcoin"] }); //buscar todos os pares BTC qualquer coisa da ftx_spot

    let btc = [];           //array com todos os dados pedidos, a ser usado com os forEach em baixo, mas podemos adicionar os ... e fica melhor
    let btcAll = [...btcBinance.data.tickers, ...btcGdax.data.tickers, ...btcBitStamp.data.tickers, ...btcKraken.data.tickers, ...btcFtx.data.tickers];


    btcBinance.data.tickers.forEach(element => {
        btc.push(element);
    })
    btcGdax.data.tickers.forEach(element => {
        btc.push(element);
    })
    btcBitStamp.data.tickers.forEach(element => {
        btc.push(element);
    })
    btcKraken.data.tickers.forEach(element => {
        btc.push(element);
    })
    //EXCLUIDO DEVIDO A LIMITE REQUEST
    /*   btcPoloniex.data.tickers.forEach(element => {      /
          btc.push(element);
      }) */
    btcFtx.data.tickers.forEach(element => {
        btc.push(element);
    })

    let prices = [];
    let base = [];
    let target = [];
    let market = [];

    btcAll.forEach(element => {

        if (element.target.includes("USD")) {   //Buscar apenas os pares que tenham como contraparte USD , aqui podemos guardar mais informações basta meter mais push e criar outro array
            prices.push(element.last);
            base.push(element.base);
            target.push(element.target);
            market.push(element.market.name);
        }
    });

    let largest = 0;                   //Comprar preços
    let smaller = Number.POSITIVE_INFINITY;
    for (let i = 0; i < prices.length; i++) {
        if (largest < prices[i]) {                  //maior preço
            largest = prices[i];
        }
        if (smaller > prices[i]) {                   //menor preço
            smaller = prices[i];
        }
    }
    let posicaoMaiorPreco = prices.indexOf(largest);            //associar posições
    let posicaoMenorPreco = prices.indexOf(smaller);
    //let highest =[prices[posicaoMaiorPreco],base[posicaoMaiorPreco],target[posicaoMaiorPreco], market[posicaoMaiorPreco]];
    //let lowest = [prices[posicaoMenorPreco],base[posicaoMenorPreco],target[posicaoMenorPreco], market[posicaoMenorPreco]];
    //console.log(highest);           //par e maior preço do exchange 
    //console.log(lowest);           //par e menor preço do exchange 

    //console.log ( prices, base, target, market); // ver se info tá correta

    var dadosFinais = {
        highest: {
            price: prices[posicaoMaiorPreco],
            base: base[posicaoMaiorPreco],
            target: target[posicaoMaiorPreco],
            market: market[posicaoMaiorPreco]
        },
        lowest: {
            price: prices[posicaoMenorPreco],
            base: base[posicaoMenorPreco],
            target: target[posicaoMenorPreco],
            market: market[posicaoMenorPreco]
        },
        prices: prices,
        base: base,
        target: target,
        market: market,
        bitcoin: bitcoinPrice.data.bitcoin.usd
    };

    //console.log(dadosFinais); // confirmar novamente

    //Tentativa falhada da parte inicial da funcao coinId
    /* listaCoins.forEach(element => {     
        
    listaIds.push(element.id);
    
    });

    console.log(listaIds)
 */
    console.log(dadosFinais);
    console.log("---------------")
    dados = dadosFinais;
    return dadosFinais;

};

// const run = async () => {               //mais usual usar wait do que then
//     let bitcoinPrice = await comparePrices();
//     console.log(bitcoinPrice);
//     console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

//     app.get('/', function (req, res) {
//         console.log(bitcoinPrice);
//         console.log("*******************************************")
//         res.render('home', {bitcoinPrice2: bitcoinPrice.bitcoin, cheap: bitcoinPrice.lowest.price , expensive:bitcoinPrice.highest.price,
//          marketCheap : bitcoinPrice.lowest.market , marketExpensive: bitcoinPrice.highest.market, bitcoinPrice } );
//     })
// };


    app.get('/', async (req, res) => {
        let bitcoinPrice;
        let now = new Date();
        if(now > lastTime.setSeconds(30))
        {
            bitcoinPrice = await comparePrices();
            lastTime = new Date();
            data = bitcoinPrice;
        }
        else {
            bitcoinPrice = data;
        }
        console.log(bitcoinPrice);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    
        console.log(bitcoinPrice);
        console.log("*******************************************")
        res.render('home', {bitcoinPrice2: bitcoinPrice.bitcoin, cheap: bitcoinPrice.lowest.price , expensive:bitcoinPrice.highest.price,
         marketCheap : bitcoinPrice.lowest.market , marketExpensive: bitcoinPrice.highest.market, bitcoinPrice } );
    })



app.post('/', function (req,res) {
   
/*     function timeFunction1() {
            (){
            comparePrices();
                    }, 50);} */

/*     function timeFunction2() {
        setTimeout(function(){
            run(); 
            }, 1000);
    } */


/*     timeFunction1(); */
res.redirect('/');

});
 
// run();


/*  bitcoinPrice.then(function(result) {
   console.log(result) // "bitcoin price" - pesquisei promise pending e encontrei isto e funciona , embora agora não seja comum usar then
}) */

app.listen(port, function () {
    console.log('running on port '+port);
})