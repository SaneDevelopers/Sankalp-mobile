import { Hono } from 'hono'
import { cors } from 'hono/cors'
import healthRouter from './routes/health'
import authRouter from './routes/auth'
import panditsRouter from './routes/pandits'
import bookingsRouter from './routes/bookings'
import ordersRouter from './routes/orders'
import addressesRouter from './routes/addresses'
import storeItemsRouter from './routes/store-items'
import paymentsRouter from './routes/payments'
import type { Bindings, Variables } from './types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// CORS
app.use('*', cors())

// Root
app.get('/', (c) => c.json({
  status: 'ok',
  service: 'Sankalp API (Cloudflare Worker)',
  message: 'Sankalp API Server is live and healthy 🚀',
  timestamp: new Date().toISOString(),
  endpoints: {
    health: '/api/healthz',
    auth: '/api/auth',
    pandits: '/api/pandits',
    storeItems: '/api/store-items',
    bookings: '/api/bookings',
    orders: '/api/orders',
    addresses: '/api/addresses',
    payments: '/api/payments',
  },
}))

// Mount routes
app.route('/api', healthRouter)
app.route('/api/auth', authRouter)
app.route('/auth', authRouter)
app.route('/api/pandits', panditsRouter)
app.route('/api/bookings', bookingsRouter)
app.route('/api/orders', ordersRouter)
app.route('/api/addresses', addressesRouter)
app.route('/api/store-items', storeItemsRouter)
app.route('/api/payments', paymentsRouter)

// Razorpay checkout page (same HTML as original)
app.get('/api/payment/checkout', (c) => {
  const { amount, name, email, contact, description, redirect_url } = c.req.query() as Record<string, string>
  const baseRedirect = redirect_url || 'mobile://payment-success'
  const successRedirect = baseRedirect
  const cancelRedirect = baseRedirect.includes('payment-success')
    ? baseRedirect.replace('payment-success', 'payment-cancelled')
    : 'mobile://payment-cancelled'

  return c.html(`<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sankalp Payment Checkout</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
        body { margin: 0; padding: 0; background-color: #FAF3E8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #4A3E3D; }
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #E25822; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div style="text-align:center;padding:20px">
        <div class="loader"></div>
        <h3>Processing Payment Gateway...</h3>
        <p>Please complete your payment. Do not close this window.</p>
    </div>
    <script>
        window.onload = function() {
            const options = {
                key: "rzp_test_RrQEP8mxFd8g3W",
                amount: parseInt("${amount || 100}", 10) * 100,
                currency: "INR",
                name: "Sankalp Services",
                description: "${description || 'Ritual Booking'}",
                image: "https://cdn-icons-png.flaticon.com/512/2913/2913520.png",
                prefill: { name: "${name || ''}", email: "${email || ''}", contact: "${contact || ''}" },
                handler: function(response) {
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYMENT_SUCCESS', paymentId: response.razorpay_payment_id }));
                    }
                    window.location.href = "${successRedirect}" + ("${successRedirect}".indexOf('?') !== -1 ? "&" : "?") + "payment_id=" + response.razorpay_payment_id;
                },
                modal: { ondismiss: function() {
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYMENT_CANCELLED' }));
                    }
                    window.location.href = "${cancelRedirect}";
                }},
                theme: { color: "#7B1F1F" }
            };
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function(response) {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYMENT_FAILED', error: response.error?.description || 'Payment Failed' }));
                }
                window.location.href = "${cancelRedirect}";
            });
            rzp.open();
        };
    </script>
</body>
</html>`)
})

export default app
