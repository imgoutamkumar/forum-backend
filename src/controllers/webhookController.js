import { RazorpayService } from "../services/razorpay";





export const razorpay = async (req, res) => {

    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);
    const valid =
        RazorpayService.verifySignature(
            body,
            signature
        );

    if (!valid)
        return res.status(400).send("Invalid");

    const event = req.body.event;

    switch (event) {

        case "subscription.activated":
            await RazorpayService
                .handleSubscriptionActivated(
                    req.body.payload.subscription.entity
                );
            break;

        case "subscription.charged":
            await RazorpayService
                .handleSubscriptionCharged(
                    req.body.payload.payment.entity
                );
            break;



        case "subscription.cancelled":
            await RazorpayService
                .handleSubscriptionCancelled(
                    req.body.payload.subscription.entity
                );

            break;
    }

    return res.json({
        received: true
    });

}

