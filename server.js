const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const puppeteer = require("puppeteer");
const fs = require("fs");
const IP = require("ip").address();

const app = express();

const port = 5400;

app.use(bodyParser.json());
app.use(cors());
// const URL = "http://localhost:5500/";

app.get("/pdf-generator", async (req, res) => {
  const reportFormat = [
    {
      format: "CarteID",
      params: ["nom", "prenom", "date_naiss"],
    },
    {
      format: "hoballa_report",
      params: ["id_c"],
    },
    {
      format: "ticket_caisse",
      params: ["id_t"],
    },
    {
      format: "Font1",
      params: ["contrat_id"],
      host:"hoballahome",
      ip_host:""
    },
  ];

  let makeRequestForPDF = true;
  let reqToSendIs = ""
  let reqToken = ""

  reportFormat.forEach((el)=>{
    if(el.host === req.query["host"]){
      reqToSendIs = `http://${el.ip_host}:8080/jasperserver/rest_v2/reports/reports/`;
      reqToken = `http://${el.ip_host}:8080/jasperserver/rest_v2/login?j_username=jasperadmin&j_password=jasperadmin`
    }
  })

  let error =
    "ERREUR PARAMETRE POUR " +
    req.query.reportFormat +
    " FORMAT: Parametre manquant ==>";

  reportFormat.forEach((el) => {
    if (el.format === req.query["reportFormat"]) {
      reqToSendIs = reqToSendIs + req.query["reportFormat"] + ".html?";
      for (item in el.params) {
        if (
          req.query[el.params[item]] === "" ||
          req.query[el.params[item]] === undefined
        ) {
          makeRequestForPDF = false;
          error = error + " | " + el.params[item];
        }
        reqToSendIs =
          item >= 1
            ? reqToSendIs +
              "&" +
              el.params[item] +
              "=" +
              req.query[el.params[item]]
            : reqToSendIs + el.params[item] + "=" + req.query[el.params[item]];
      }
    }
  });

  const formatExist = reportFormat.find(
    (el) => el.format === req.query["reportFormat"]
  );

  const hostExist = reportFormat.find(
    (el) => el.host === req.query["host"]
  );

  if (makeRequestForPDF && formatExist && hostExist) {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1440,
      height: 1080,
      deviceScaleFactor: 1,
    });

    await page
      .goto(
        reqToken,
        { waitUntil: "networkidle0" }
      )
      .then(() => page.goto(reqToSendIs, { waitUntil: "networkidle0" }));

    await page.emulateMediaType("print");
    await page.addStyleTag({
      content: `body{ 
                    margin:0;
                    padding:0;
                  }`,
    });

    const ItemToGetInPDF = await page.$(".jrPage>tbody");
    const rectItemToGetInPDF = await page.evaluate((info) => {
      const { top, left, bottom, right, height, width } =
        info.getBoundingClientRect();
      return { top, left, bottom, right, height, width };
    }, ItemToGetInPDF);

    await page
      .pdf({
        path: `pdf.pdf`,
        width: rectItemToGetInPDF.width,
        height: rectItemToGetInPDF.height,
        margin: 0,
        printBackground: true,
      })
      .then(async (pdf) => {
        res.sendFile(__dirname + "/pdf.pdf");
        await browser.close();
      });
  } else {
    res.send(
      formatExist ? error  : hostExist ? 'Params "HOST" on url is missing ': `Server listening on Port : ${port} | IP address : ${IP} | ERROR : format ` +req.query["reportFormat"]
    );
  }
});

app.listen(process.env.PORT || port, async () => {
  console.log(
    `Server listening on Port : ${port} | IP address : ${IP}`
  );
});
