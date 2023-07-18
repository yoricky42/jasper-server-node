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
  const reportFormat_id = [
    {
      format: "CarteID",
      params: ["nom", "prenom", "date_naiss"],
      host: null,
      ip_host: "80.240.29.46",
    },
    {
      format: "hoballa_report",
      params: ["id_c"],
      host: null,
      ip_host: "80.240.29.46",
    },
    {
      format: "ticket_caisse",
      params: ["id_t"],
      host: null,
      ip_host: "80.240.29.46",
    },
    {
      format: "Font1",
      params: ["contrat_id"],
      host: "hoballahome",
      ip_host: "172.17.0.2",
    },
  ];

  let makeRequestForPDF = true;
  let reqToSendIs = "";
  let reqToken = "";
  let error =
    "Erreur :  paramètre pour le format id= " +
    req.query.reportFormat_id?.toString().toUpperCase() +
    " - Parametre manquant ==>";

  const hostExist = reportFormat_id.find((el) => el.host === req.query["host"]);
  const formatExist = [hostExist]?.find(
    (el) => el?.format === req.query["reportFormat_id"]
  );

  if (!hostExist) {
    res.send(
      `<body>
          <style>
          h1 {
            color: #26b72b;
          }
          h3 {
            color: red;
          }
          </style>
          <h1 >Server listening on Port : ${port} | IP address : ${IP}</h1> 
          <h3 >
          ${
            req.query["host"] === undefined || req.query["host"] === ""
              ? "Le paramètre 'hôte' est manquant ou vide dans l'url"
              : `Erreur : l'hôte '${req.query["host"]}' n'est pas valide`
          }
          </h3> 

          </body>
          `
    );
  } else if (!formatExist) {
    res.send(`
    <body>
          <style>
          h1 {
            color: #26b72b;
          }
          h3 {
            color: red;
          }
          </style>
          <h1 >Server listening on Port : ${port} | IP address : ${IP}</h1> 
          <h3 >
          ${
            req.query["reportFormat_id"] === undefined || req.query["reportFormat_id"] === ""
              ? "Le paramètre 'reportFormat_id' est manquant ou vide dans l'url"
              : `Erreur : reportFormat_id '${req.query["reportFormat_id"]}' n'existe pas sur l'hôte '${hostExist.host}'`
          }
          </h3> 

          </body>
          `);
  } else if (formatExist) {
    // Dans le cas ou on a l'hote et les
    reqToSendIs = `http://${hostExist?.ip_host}:8080/jasperserver/rest_v2/reports/reports/`;
    reportFormat_id.forEach((el) => {
      if (el.format === req.query["reportFormat_id"]) {
        reqToSendIs = reqToSendIs + req.query["reportFormat_id"] + ".html?";
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
              : reqToSendIs +
                el.params[item] +
                "=" +
                req.query[el.params[item]];
        }
      }
    });
  }
  if (makeRequestForPDF) {
    reqToken = `http://${hostExist?.ip_host}:8080/jasperserver/rest_v2/login?j_username=jasperadmin&j_password=jasperadmin`;

    if (makeRequestForPDF && formatExist && hostExist) {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
        timeout:0
      });
      const page = await browser.newPage();
      await page.setViewport({
        width: 1440,
        height: 1080,
        deviceScaleFactor: 1,
      });

      console.log('======= initialization ======== | ',reqToken)
  
      await page
        .goto(
          reqToken,
          { waitUntil: "networkidle0" }
        )
        .then(()=> console.log('======= Tocken initialized ======== | ',reqToSendIs))
        .then(() => page.goto(reqToSendIs, { waitUntil: "networkidle0" }))
        .then(()=> console.log('======= in jreport ======='))
  
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
    }
  } else {
    res.send(`
    <body>
          <style>
          h1 {
            color: #26b72b;
          }
          h3 {
            color: red;
          }
          </style>
          <h1 >Server listening on Port : ${port} | IP address : ${IP}</h1> 
          <h3 >
          ${
            error
          }
          </h3> 

          </body>
          `);
  }

});

app.listen(process.env.PORT || port, async () => {
  console.log(`Server listening on Port : ${port} | IP address : ${IP}`);
});
