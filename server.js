require('dotenv').config();
const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // 🔥 Needed for JSON POST bodies

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/success.html'));
});

app.get('/cancel', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/cancel.html'));
});

// Stripe Checkout
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { plusOne = false, plusOneName = '' } = req.body;
    const totalQuantity = plusOne ? 2 : 1;

    console.log('Received checkout request with:');
    console.log('Plus One?', plusOne);
    console.log('Plus One Name:', plusOneName);

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'High School Reunion Ticket',
      },
      unit_amount: 6000,
    },
    quantity: totalQuantity,
  }],
  mode: 'payment',
  success_url: `${req.protocol}://${req.get('host')}/success`,
  cancel_url: `${req.protocol}://${req.get('host')}/cancel`,

  // ✅ THIS is what actually attaches metadata to the final payment
  payment_intent_data: {
    metadata: {
      plusOne: plusOne ? 'yes' : 'no',
      plusOneName: plusOneName || 'N/A',
    }
  }
});


    res.json({ id: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
