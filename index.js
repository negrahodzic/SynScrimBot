console.log('Hi I am Syn bot!');

var fs = require('fs');
require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.BOTTOKEN);

let config = {
    brojScrima: 0,
    datum: new Date(),
    prijaveOtkljucane: false,
    brojTimova : 0,
    vipTimovi: [],
    prijave: [],
    tabelaLista : [],
    cekanjeLista : []
};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    fs.readFile('./config.json', 'utf8', (err, data) => {

        if (err) {
            console.log(`Error reading file from disk: ${err}`);
        } else {
            config = JSON.parse(data);
            console.log(`Poslednji scrim je bio #` + config.brojScrima);

            const [month, day, year] = [new Date(config.datum).getMonth(), new Date(config.datum).getDate(), new Date(config.datum).getFullYear()];
            console.log('Datum scrima: ' + day + '.' + (month + 1) + '.' + year);

            console.log(`vip timovi: ` + config.vipTimovi);
            console.log(`prijaveOtkljucane: ` + config.prijaveOtkljucane);
            console.log(`brojTimova: ` + config.brojTimova);
            console.log(`Prijave: ` + config.prijave);
            console.log(`tabelaLista: ` + config.tabelaLista);
            console.log(`cekanjeLista: ` + config.cekanjeLista);
        }

    });
});

client.on('message', (msg) => {
    if (msg.channel.id === process.env.SCRIM_KANAL_ID) { // #scrim
        let komanda = msg.content.split(" ");
        if (komanda.length <= 1 && komanda[0] === '!syn') {
            msg.channel.send('Morate uneti komandu nakon **!syn** :eyes:\nUkucaj **!syn info** za vise informacija.');
        } else {
            if (komanda[0] === '!syn') {
                if (komanda[1] === 'novi' && komanda[2] === 'scrim') {
                    config.brojScrima++;
                    config.vipTimovi.forEach((tim) => {
                        if (tim.broj !== 1000) {
                            tim.broj--;
                            if (tim.broj === -1) {
                                config.vipTimovi.splice(config.vipTimovi.indexOf(tim), 1);
                            }
                        }
                    });
                    config.tabelaLista = [];
                    config.cekanjeLista = [];
                    config.brojTimova = config.vipTimovi.length;
                    config.datum = new Date();
                    prijaveSave();
                    configSave();
                    msg.channel.send("Sve je spremno za #" + config.brojScrima + " Syn Scrim! :trident: \n\nOtvorite prijave komandom **!syn otkljucaj** :unlock: \n");
                } else
                    if (komanda[1] === 'dobro' && komanda[2] === 'jutro!') {
                        msg.reply("DOBROOO JUTROOOOO!!! Spreman sam za rad!");
                    } else
                        if (komanda[1] === 'tim') {
                            let postoji = false;
                            config.prijave.forEach((tim) => {
                                tim = JSON.parse(tim);
                                let imeTima = '';
                                for (let i = 2; i < komanda.length; i++) {
                                    imeTima = imeTima + ' ' + komanda[i];
                                }
                                console.log(tim.teamName + " - " + imeTima);
                                if (imeTima.trim() === tim.teamName.trim()) {
                                    msg.reply('prijava tima **' + tim.teamName + '**:\n\n' +
                                        '-Team Name | ' + tim.teamName + '\n-Team Tag | ' + tim.teamTag + '\n-Team Manager | ' + tim.teamManager + '\n\n' +
                                        '-P1 | ' + tim.igraci[0].ime + ' | ' + tim.igraci[0].id + ' | ' + tim.igraci[0].zastava + '\n' +
                                        '-P2 | ' + tim.igraci[1].ime + ' | ' + tim.igraci[1].id + ' | ' + tim.igraci[1].zastava + '\n' +
                                        '-P3 | ' + tim.igraci[2].ime + ' | ' + tim.igraci[2].id + ' | ' + tim.igraci[2].zastava + '\n' +
                                        '-P4 | ' + tim.igraci[3].ime + ' | ' + tim.igraci[3].id + ' | ' + tim.igraci[3].zastava + '\n\n' +
                                        (tim.rezerve[0] ? '-S1 | ' + tim.rezerve[0].ime + ' | ' + tim.rezerve[0].id + ' | ' + tim.rezerve[0].zastava + '\n' : '') +
                                        (tim.rezerve[1] ? '-S2 | ' + tim.rezerve[1].ime + ' | ' + tim.rezerve[1].id + ' | ' + tim.rezerve[1].zastava + '\n' : '') +
                                        (tim.rezerve[2] ? '-S3 | ' + tim.rezerve[2].ime + ' | ' + tim.rezerve[2].id + ' | ' + tim.rezerve[2].zastava + '\n' : ''));
                                    postoji = true;
                                }
                            });

                            let imeTima = '';
                            for (let i = 2; i < komanda.length; i++) {
                                imeTima = imeTima + ' ' + komanda[i];
                            }

                            if (postoji === false) {
                                msg.reply("nisam nasao prijavu tima **" + imeTima + "** :x:");
                            }
                        } else
                            if (komanda[1] === 'ukloniSynRolu') {
                                msg.channel.send("Ova komanda radi samo u kanalu #scrim-vip !");
                            } else

                                if (komanda[1] === 'otkljucaj') {
                                    msg.channel.updateOverwrite(msg.channel.guild.roles.everyone, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
                                    msg.channel.send(textPrijaveOtvorene);
                                    config.prijaveOtkljucane = true;
                                    configSave();
                                } else
                                    if (komanda[1] === 'tabela') {
                                        tabela(msg);
                                    } else
                                        if (komanda[1] === 'info') {
                                            msg.channel.send(textInfo);
                                        } else

                                            if (komanda[1] === 'vip') {
                                                vip(msg);
                                            } else
                                                if (komanda[1] === 'prijava' && komanda[2] === 'format') {
                                                    msg.channel.send('Molim te da popunis prijavu u formatu:\n\n!syn prijava  :trident: \n-Team Name | XxxxxX\n-Team Tag | xxx\n-Team Manager | XxxxxX\n' +
                                                        '-P1 | XxxxxX | 123456789 | :flag_ba:\n-P2 | XxxxxX | 123456789 | :flag_rs:\n-P3 | XxxxxX | 123456789 | :flag_me:\n-P4 | XxxxxX | 123456789 | :flag_hr:\n\n' +
                                                        '-S1 | XxxxxX | 123456789 | :flag_de:\n-S2 | XxxxxX | 123456789 | :flag_al:\n-S3 | XxxxxX | 123456789 | :flag_mk:');
                                                } else
                                                    if (komanda[1] === 'prijava' || komanda[1].startsWith("prijava\n")) {
                                                        let vecPostoji = false;
                                                        if (komanda.length > 2 && config.prijaveOtkljucane === true) {
                                                            if (config.brojTimova <= 5) {
                                                                let redovi = msg.content.split('-');
                                                                let info = new Array();
                                                                let teamName = '';
                                                                let teamTag = '';
                                                                let teamManager = '';
                                                                let igraci = [];
                                                                let rezerve = [];

                                                                redovi.forEach((red) => {
                                                                    if (red !== redovi[0]) {
                                                                        let r = red.split('|').map(function (item) {
                                                                            return item.trim();
                                                                        });
                                                                        info.push(r);
                                                                    }
                                                                });

                                                                info.forEach((red) => {
                                                                    if (red[0] === 'Team Name') teamName = red[1];

                                                                    if (red[0] === 'Team Tag') teamTag = red[1];

                                                                    if (red[0] === 'Team Manager') teamManager = red[1];

                                                                    if (red[0][0] === 'P') igraci.push({
                                                                        "ime": red[1],
                                                                        "id": red[2],
                                                                        "zastava": red[3]
                                                                    });
                                                                    if (red[0][0] === 'S') rezerve.push({
                                                                        "ime": red[1],
                                                                        "id": red[2],
                                                                        "zastava": red[3]
                                                                    });

                                                                });

                                                                let prijavaJSON = JSON.stringify({ teamName, teamTag, teamManager, igraci, rezerve }, null, 2);

                                                                config.tabelaLista.forEach((tim) => {
                                                                    if (info[0][1] === tim[0][1]) {
                                                                        msg.reply("vec ste prijavili tim " + info[0][1] + " :warning:");
                                                                        vecPostoji = true;
                                                                    }
                                                                });

                                                                if (vecPostoji === false) {
                                                                    console.log(info);
                                                                    let p = 0;
                                                                    let s = 0;
                                                                    for (let i = 3; i < info.length; i++) {
                                                                        if (info[i][0][0] === 'P') {
                                                                            p++;
                                                                        } else if (info[i][0][0] === 'S') {
                                                                            s++;
                                                                        }
                                                                    }
                                                                    if (p !== 4 || s > 3) {
                                                                        msg.reply("neuspesna prijava! :x:\n\nJa sam samo bot i da bih znao da je prijava ispravna mora biti striktno u formatu koji znam. :eyes:\n" +
                                                                            "**Proverite format i uslove prijave**. (minimum 4 igraca, maksimum 3 rezerve)\n\n" +
                                                                            "Ukucaj **!syn prijava** da vidis kako treba da izgleda format prijave.");
                                                                    } else if (config.brojTimova === 5 && config.cekanjeLista.length < 3) {
                                                                        config.cekanjeLista.push(info);
                                                                        msg.reply("nema slobodnih mesta. Ubaceni ste na listu za cekanje.");
                                                                        if (config.cekanjeLista.length === 3) {
                                                                            msg.channel.updateOverwrite(msg.channel.guild.roles.everyone, { VIEW_CHANNEL: true, SEND_MESSAGES: false });
                                                                            msg.channel.send("Lista za cekanje je popunjena. Zatvaram prijave i zakljucavam kanal!");
                                                                            config.prijaveOtkljucane = false;
                                                                            tabela(msg);
                                                                        }
                                                                    } else {
                                                                        config.tabelaLista.push(info);
                                                                        config.brojTimova++;

                                                                        msg.reply("uspesno ste prijavljeni. :white_check_mark: \n\n Unesite komandu **!syn tabela** da bi videli vas slot.\n\nBroj slobodnih mesta: " + (20 - config.brojTimova));
                                                                        dodajSynRolu(msg);
                                                                        configSave();
                                                                        
                                                                        fs.readFile('./prijave' + config.brojScrima + '.json', 'utf8', (err, data) => {

                                                                            if (err) {
                                                                                console.log(`Error reading file from disk: ${err}`);
                                                                            } else {

                                                                                config.prijave = JSON.parse(data);
                                                                                config.prijave.push(prijavaJSON);

                                                                                fs.writeFile('./prijave' + config.brojScrima + '.json', JSON.stringify(config.prijave, null, 2), (err) => {
                                                                                    if (err) {
                                                                                        console.log(`Error writing file: ${err}`);
                                                                                    }
                                                                                });
                                                                            }

                                                                        });
                                                                    }
                                                                }
                                                            }
                                                        } else {
                                                            if (config.prijaveOtkljucane === false) {
                                                                msg.channel.send('Prijave su zakljucane. :lock: \n\nSacekajte da admini otvore prijave komandom **!syn otkljucaj**\n\nDa vidis format prijave pozovi komandu **!syn prijava format**');
                                                            } else {
                                                                msg.reply('da vidis format prijave unesi **!syn prijava format**');
                                                            }
                                                        }

                                                    } else {
                                                        msg.channel.send("Jos uvek ne znam tu komandu :(\nUkucaj **!syn info** za vise informacija.");
                                                    }
            }
        }

    } else if (msg.channel.id === process.env.SCRIM_VIP_KANAL_ID) { // #scrim-vip
        if (msg.content === '!syn ukloniSynRolu') { //TODO: ogranici ko sme da koristi ovu komandu
            if (msg.member.roles.cache.find(role => role.name === 'Scrim Bot Admin')) {
                const role = msg.guild.roles.cache.find(role => role.name === 'syn');

                msg.guild.roles.create({
                    data: {
                        name: role.name,
                        color: role.color,
                    },
                    reason: 'Vip channel role',
                })
                    .then((data) => {
                        msg.channel.updateOverwrite(data, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
                    })
                    .catch(console.error);

                role.delete('Brisem rolu syn.');

                msg.channel.send('Sklonio sam SYN rolu svima!');
            } else {
                msg.reply(' samo admini mogu da koriste ovu komandu.');
            }

        }
    } else { // svi ostali kanali
        if (msg.content === '!syn') {
            msg.channel.send('radim samo u kanalu #scrim i #scrim-vip!');
        }
    }
});

function vip(msg) {
    let i = 1;
    let text = "Vip lista:\n";
    config.vipTimovi.forEach((tim) => {
        text = text + "\n" + i + ". " + tim.tim + " - " + (tim.broj === 1000 ? "VIP" : tim.broj);
        i++;
    });
    msg.channel.send(text);
    return text;
}

function dodajSynRolu(msg) {
    //nadji rolu i dodeli je autoru poruke
    const role = msg.guild.roles.cache.find(role => role.name === 'syn');
    msg.member.roles.add(role);
    //obavesti autora da je ubacen u vip kanal
    const user = msg.author;
    msg.guild.channels.cache.get(process.env.SCRIM_VIP_KANAL_ID).send(`${user}, dobrodosao u vip kanal scrima!`);
}

function tabela(msg) {
    const [month, day, year] = [new Date(config.datum).getMonth(), new Date(config.datum).getDate(), new Date(config.datum).getFullYear()];
    let text = "syn :trident: SCRIM #" + config.brojScrima + "\n\n:calendar_spiral: " + day + '.' + (month + 1) + '.' + year + '\n:clock8: Vreme: 21:00\n:park: Mape: Erangel, Miramar, Sanhok, Erangel' +
        "\n\n1: :heavy_multiplication_x:\n2: :heavy_multiplication_x:\n3: :heavy_multiplication_x:\n";
    let i = 4;
    config.vipTimovi.forEach((tim) => {
        if (tim.broj >= 0) {
            text = text + i + ". " + tim.tim + " " + (tim.broj === 1000 ? "VIP" : tim.broj) + "\n";
            i++;
        }
    });
    if (config.tabelaLista.length > 0) {
        config.tabelaLista.forEach((tim) => {
            text = text + i + ". " + tim[0][1] + "\n";
            i++;
        });
    }

    while (i < 26) {
        text = text + i + ". :heavy_multiplication_x:\n";
        i++;
    }

    if (config.cekanjeLista.length > 0) {
        text = text + "\n:door:Na čekanju:\n\n ";

        let j = 1;
        config.cekanjeLista.forEach((tim) => {
            text = text + j + ". " + tim[0][1] + "\n";
            j++;
        });
    }

    msg.channel.send(text);
}

function configSave() {
    fs.writeFile('./config.json', JSON.stringify(config, null, 2), (err) => {
        if (err) {
            console.log(`Error writing file: ${err}`);
        }
    });
}
function prijaveSave(){
    fs.writeFile('./prijave' + config.brojScrima + '.json', JSON.stringify([], null, 2), (err) => {
        if (err) {
            console.log(`Error writing file: ${err}`);
        }
    });
}

let textInfo = 'Zdravo! Ja sam syn bot! \n Ja sam odgovoran za prijave naseg scrima.\n Komande: info, prijava, vip, tabela, otkljucaj, ukloniSynRolu';

let textPrijaveOtvorene = 'Otkljucavam kanal. **Prijave su otvorene!** :unlock:\n\nJa sam nov bot i zato odbijam sve prijave koje nisu u dobrom formatu.\nMolim te da pazis na format prijave! (najbolje je da kopiras i izmenis)\n\n' +
    '**Format prijave:**\n\n!syn prijava  :trident: \n-Team Name | XxxxxX\n-Team Tag | xxx\n-Team Manager | XxxxxX\n' +
    '-P1 | XxxxxX | 123456789 | :flag_ba:\n-P2 | XxxxxX | 123456789 | :flag_rs:\n-P3 | XxxxxX | 123456789 | :flag_me:\n-P4 | XxxxxX | 123456789 | :flag_hr:\n\n' +
    '-S1 | XxxxxX | 123456789 | :flag_de:\n-S2 | XxxxxX | 123456789 | :flag_al:\n-S3 | XxxxxX | 123456789 | :flag_mk:\n\n' +
    'Prijave ce se zatvoriti cim se uspesno prijavi 20 timova. \nProveri slobodna mesta komandom **!syn tabela**\nSrecno!:four_leaf_clover: ';


/*
{
  "brojScrima": 76,
  "datum": "2021-07-09T13:09:15.682Z",
  "vipTimovi": [
    {
      "tim": "Saiyans Army Ladies",
      "broj": 1000
    },
    {
      "tim": "EUX TEAM",
      "broj": 1
    },
    {
      "tim": "PMBOeSports",
      "broj": 12
    }
  ]
}
*/

/*
!syn prijava :trident:
-Team Name | XxxxxX
-Team Tag | xxx
-Team Manager | XxxxxX
-P1 | XxxxxX | 123456789 | :flag_ba:
-P2 | XxxxxX | 123456789 | :flag_rs:
-P3 | XxxxxX | 123456789 | :flag_me:
-P4 | XxxxxX | 123456789 | :flag_hr:

-S1 | XxxxxX | 123456789 | :flag_de:
-S2 | XxxxxX | 123456789 | :flag_al:
-S3 | XxxxxX | 123456789 | :flag_mk:
*/
/*

TODO:
1. Jedna prijava po timu :white_check_mark:
2. resi problem sa razmakom nakon prijava :white_check_mark:
3. ogranici neke komande samo na odredjene ljude/role
4. blokiraj komandu prijava dok se ne otkljucaju prijave i kanal :white_check_mark:
5. ako salje prijavu nakon zatvaranja, stavi obavestenje
6. hvataj exception!
7. redni broj scrima da se menja :white_check_mark:
8. zasto je mimi3 dupliran u listi za cekanje
9. izbaci iz vipa one sa 0 + pazi na broj timova kad se izbaci neko iz vipa :white_check_mark:
10. cuvaj i prijave timova na cekanju

UPGRADE LATER:
1. Pamti ekipu da mogu da se prijave samo preko imena tima
2. Zapamcene ekipe mogu da izmene prijavu
3. omoguci vise formata, fleksibilnije
4. omoguci da preko checkbox reakcije 30min pre scrima potvrde dolazak
5. Jedna prijava po timu - unapredi logiku (proveri da li se ponavljaju igraci)
6. Ban lista
*/