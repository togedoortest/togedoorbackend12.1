const Stripe = require("stripe");

const express = require("express");
const router = express.Router();
const stripe = new Stripe(
  "sk_test_51HAVMjGmxAb4lhZb7GMpXqaiuwbhN3slCD4YG2mv3AeWmDjHwZFVijZy7AyqedxlghlBv3CgAUzN3VWX7ttJUJ6m00lpPEq7Yz"
);

const Payment = require("../models/Payment");

// @route     POST /payments/
// @desc      create payment
// @access    Public
router.post("/", async (req, res) => {
  const { id, amount, name, user } = req.body;
  // console.log("User : ", user);
  try {
    await stripe.paymentIntents.create({
      amount,
      currency: "USD",
      description: name,
      payment_method: id,
      confirm: true,
    });

    const newPayment = new Payment({
      description: name,
      amount,
      customer: user,
    });

    const payment = await newPayment.save();
    return res.status(200).json({ payment, confirm: "Payment confirmed !" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
