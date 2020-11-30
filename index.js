const Discord = require('discord.js');
const puppeteer = require('puppeteer');
const client = new Discord.Client({ disableEveryone: true });
const prefix = '-';
const searchUrl = 'https://www.tcgplayer.com/search/dragon-ball-super-ccg/product?productLineName=dragon-ball-super-ccg&q=';

  client.once('ready', () => {
    console.log('DBS Bot is online!');
  })

  client.on('message', async message => {
    //we verify the message
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length);
    const command = args.toLowerCase(); //we get the Card Name
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const urlCard = command.replace(/\s/g, '%20').replace(/[&]/g, '%26').replace(/[/]/g, '%2F');
    try{
      await page.goto(`${searchUrl + urlCard}`);
      await page.waitForXPath('//*[@id="app"]/div/section[2]/section/section/span/section/div[1]/div/a[1]', { timeout: 8000 });
    //Seleccionamos el primer resultado y hacemos click
      const firstResult = await page.$x('//*[@id="app"]/div/section[2]/section/section/span/section/div[1]/div/a[1]');
      await firstResult[0].click();
      await page.waitForXPath('/html/body/div[4]/section[1]/div/section/div[3]/div[1]/h1');
   }catch (e) {
      console.log(e);
      return message.channel.send('Card could not be found');
    }

    //Traemos los datos de la página
    //Se trae la imagen
    const srcText = await cardImage(page)

    //Card Name
    const name = await cardName(page);

    //Card Effect
    const effect = await cardEffect(page);

    //Card Type
    const type = await cardType(page);

    //Color
    const color = await cardColor(page);

    //Character
    const char = await cardChar(page, type);

    const cardInfo = new Discord.MessageEmbed()
    .setTitle(`${name}`)
    .setDescription(`${effect}`)
    .addFields(
      { name: 'Card Type', value: type },
      { name: 'Color', value: color },
      { name: 'Character', value: char },
    )
    .setImage(`${srcText}`);

    return message.channel.send(cardInfo);

    //message.channel.send(`${rawText}`);

    //message.channel.send(`${searchUrl + urlCard}`);

    browser.close();
    /*if (command === 'ping'){
      message.channel.send('pong');
    }*/
  })

async function cardImage(page){
  const [img] = await page.$x('//*[@id="cardImage"]');
  const src = await img.getProperty('src');
  const srcText = await src.jsonValue();
  return srcText;
}

async function cardName(page){
  const [el] = await page.$x('/html/body/div[4]/section[1]/div/section/div[3]/div[1]/h1');
  const txt = await el.getProperty('textContent');
  const name = await txt.jsonValue();
  return name;
}

async function cardEffect(page){
  const [el2] = await page.$x('/html/body/div[4]/section[1]/div/section/div[3]/table/tbody/tr/td/dl/dd[3]');
  const txt2 = await el2.getProperty('textContent');
  const effect = await txt2.jsonValue();
  return effect;
}

async function cardType(page){
  const [el3] = await page.$x('/html/body/div[4]/section[1]/div/section/div[3]/table/tbody/tr/td/dl/dd[4]');
  const txt3 = await el3.getProperty('textContent');
  const type = await txt3.jsonValue();
  return type;
}

async function cardColor(page){
  const [el4] = await page.$x('/html/body/div[4]/section[1]/div/section/div[3]/table/tbody/tr/td/dl/dd[5]');
  const txt4 = await el4.getProperty('textContent');
  const color = await txt4.jsonValue();
  return color;
}

async function cardChar(page, type){
  if (type.toLowerCase() === 'leader' || type.toLowerCase() === 'battle'){
    if (type.toLowerCase() === 'battle'){
      const [el5] = await page.$x('/html/body/div[4]/section[1]/div/section/div[3]/table/tbody/tr/td/dl/dd[12]');
      const txt5 = await el5.getProperty('textContent');
      const char = await txt5.jsonValue();
      return char;
    }else{
      const [el5] = await page.$x('/html/body/div[4]/section[1]/div/section/div[3]/table/tbody/tr/td/dl/dd[9]');
      const txt5 = await el5.getProperty('textContent');
      const char = await txt5.jsonValue();
      return char;
    }
  }else{
    const char = '-';
    return char;
  }
}

client.login('Nzc4MzM4NTE1NjM3MjM5ODA4.X7QiOg.tfPA3a6Dh10kkpiOFZHAVORD33c');
