
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
