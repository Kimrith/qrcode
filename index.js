const express = require("express");
const QRCode = require("qrcode");
const cors = require("cors");
const { BakongKHQR, MerchantInfo, khqrData } = require("bakong-khqr");

const app = express();

app.use(cors()); // enable CORS
app.use(express.json()); // parse JSON

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.post("/generate-khqr", async (req, res) => {
  try {
    const optionalData = {
      currency: khqrData.currency.usd,
      amount: req.body.amount,
      expirationTimestamp: Date.now() + 15 * 60 * 1000, // Expires in 15 mins
      billNumber: `INV-${Date.now()}`,
    };

    const merchantInfo = new MerchantInfo(
      "vann_sak@bkrt",
      "SAK VANN",
      "PHNOM PENH",
      "1643151",
      "bakong",
      optionalData, // Passed as the 6th argument, which is perfectly correct!
    );

    const KHQR = new BakongKHQR();
    const merchant = KHQR.generateMerchant(merchantInfo);

    console.log("Merchant result:", merchant);

    if (merchant.status.code !== 0) {
      return res.status(400).json({
        error: merchant.status.message,
      });
    }

    const qrImage = await QRCode.toDataURL(merchant.data.qr);

    res.json({
      qrString: merchant.data.qr,
      qrImage,
      md5: merchant.data.md5,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
