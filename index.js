//'use strict' 
//
//async function ssr(url) { 
//  var chromium = require("chrome-aws-lambda");
//
//  browser = await chromium.puppeteer.launch({
//    args: chromium.args,
//    defaultViewport: chromium.defaultViewport,
//    executablePath: await chromium.executablePath,
//    headless: true,
//    ignoreHTTPSErrors: true,
//  }); 
//  const page = await browser.newPage();
//  await page.goto(url, { waitUntil: 'networkidle0' });
//  //const pdf = await page.pdf({ path: './pdf.pdf',format: 'A4' }); // serialized HTML of page DOM.
////
////
//  //const s3 = new AWS.S3({ apiVersion: '2006-03-01', region: process.env.AWS_REGION });
//  //const fileContent = fs.readFileSync(filePath);
////
//  //const params = {
//  //    Bucket: process.env.AWS_S3_BUCKET,
//  //    Key: fileName,
//  //    Body: fileContent,
//  //    //ContentType: mimeType//geralmente se acha sozinho
//  //};
////
//  //const data = await s3.upload(params).promise();
//
//  const html = await page.content().ca;
//  await browser.close();
//  return html;
//}
//
//async function name(params) {
//  const html = await ssr('http://google.com')
//  console.log(html);
//}
// 
//exports.handler = async function (event, context) {
//  console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2));
//  console.log("EVENT\n" + JSON.stringify(event, null, 2));
//  name(1); 
//  return ''; 
//}


const chromium = require('chrome-aws-lambda');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  let result = null;
  let browser = null; 
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    console.log("browser launched");
    let page = await browser.newPage();
    await page.goto(process.env.URL);
    const pdf = await page.pdf({ format: 'A4' });
    const uploadedImage = await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: process.env.NAME,
      Body: pdf,
    }).promise()
    result = await page.title();
  } catch (error) {
    console.log(error);
    return error;
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  } 
  return callback(null, result.toString("base64"));
};
