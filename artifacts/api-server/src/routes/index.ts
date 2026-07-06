import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import addressesRouter from "./addresses";
import bookingsRouter from "./bookings";
import ordersRouter from "./orders";
import panditsRouter from "./pandits";
import storeItemsRouter from "./store-items";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/addresses", addressesRouter);
router.use("/bookings", bookingsRouter);
router.use("/orders", ordersRouter);
router.use("/pandits", panditsRouter);
router.use("/store-items", storeItemsRouter);

router.get("/payment/checkout", (req, res) => {
  const { amount, name, email, contact, description, redirect_url } = req.query;

  const baseRedirect = (redirect_url as string) || "mobile://payment-success";
  const successRedirect = baseRedirect;
  const cancelRedirect = baseRedirect.includes("payment-success")
    ? baseRedirect.replace("payment-success", "payment-cancelled")
    : "mobile://payment-cancelled";

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sankalp Payment Checkout</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #FAF3E8;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            color: #4A3E3D;
        }
        .container {
            text-align: center;
            padding: 20px;
        }
        .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #E25822;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="loader"></div>
        <h3>Processing Payment Gateway...</h3>
        <p>Please complete your payment. Do not close this window.</p>
    </div>
    <script>
        window.onload = function() {
            const options = {
                key: "rzp_test_RrQEP8mxFd8g3W",
                amount: parseInt("${amount || 100}", 10) * 100, // in paise
                currency: "INR",
                name: "Sankalp Services",
                description: "${description || 'Ritual Booking'}",
                image: "https://cdn-icons-png.flaticon.com/512/2913/2913520.png",
                prefill: {
                    name: "${name || ''}",
                    email: "${email || ''}",
                    contact: "${contact || ''}"
                },
                handler: function (response) {
                    console.log('[PaymentSuccess]', response);
                    window.location.href = "${successRedirect}" + (("${successRedirect}".indexOf('?') !== -1) ? "&" : "?") + "payment_id=" + response.razorpay_payment_id;
                },
                modal: {
                    ondismiss: function () {
                        console.log('[PaymentDismissed]');
                        window.location.href = "${cancelRedirect}";
                    }
                },
                theme: {
                    color: "#E25822"
                }
            };
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function (response){
                console.log('[PaymentFailed]', response);
                window.location.href = "${cancelRedirect}";
            });
            rzp.open();
        };
    </script>
</body>
</html>
  `;
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

export default router;
