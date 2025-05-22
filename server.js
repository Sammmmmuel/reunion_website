require('dotenv').config();
const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_KEY);
const path = require('path');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/success.html'));
});

app.get('/cancel', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/cancel.html'));
});

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'High School Reunion Ticket',
        },
        unit_amount: 2500, // $25.00
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/success`,
    cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
  });

  res.redirect(303, session.url);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
