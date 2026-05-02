import express from "express";
import Stripe from "stripe";
import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import User from "../models/userModel.js";

const orderRouter = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getUserId = (req) => req.headers["user-id"];
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);


// =======================
// 💳 CREAR PAYMENT INTENT
// =======================
orderRouter.post("/create-payment-intent", async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId || !isValidId(userId)) return res.status(400).json({ error: "user-id inválido" });

        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart || cart.items.length === 0) return res.status(400).json({ error: "El carrito está vacío" });

        const total = cart.items.reduce((acc, item) => {
            if (!item.product) return acc;
            return acc + item.product.price * item.quantity;
        }, 0);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100),
            currency: "mxn",
            metadata: { userId }
        });

        res.json({ clientSecret: paymentIntent.client_secret, total });

    } catch (error) {
        console.error("POST /orders/create-payment-intent ERROR:", error.message);
        res.status(500).json({ error: "Error al crear el intento de pago" });
    }
});


// =======================
// ✅ CONFIRMAR ORDEN
// =======================
orderRouter.post("/confirm", async (req, res) => {
    try {
        const userId = getUserId(req);
        const { paymentIntentId, shippingAddress } = req.body;

        if (!userId || !isValidId(userId)) return res.status(400).json({ error: "user-id inválido" });
        if (!paymentIntentId) return res.status(400).json({ error: "Falta paymentIntentId" });
        if (!shippingAddress) return res.status(400).json({ error: "Falta dirección de envío" });

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== "succeeded") return res.status(400).json({ error: "El pago no fue completado" });

        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart || cart.items.length === 0) return res.status(400).json({ error: "El carrito está vacío" });

        const items = cart.items
            .filter(item => item.product)
            .map(item => ({
                product: item.product._id,
                name: item.product.name,
                image: item.product.images?.[0]?.url || null,
                price: item.product.price,
                quantity: item.quantity
            }));

        const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

        const order = await Order.create({
            user: userId,
            items,
            shippingAddress,
            total,
            status: "paid",
            stripePaymentIntentId: paymentIntentId
        });

        cart.items = [];
        await cart.save();

        res.status(201).json(order);

    } catch (error) {
        console.error("POST /orders/confirm ERROR:", error.message);
        res.status(500).json({ error: "Error al confirmar la orden" });
    }
});


// =======================
// 🔑 OBTENER TODAS LAS ÓRDENES (admin)
// FIX: ANTES de /:id — si no, Express trata "admin" como un ID
// =======================
orderRouter.get("/admin", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("GET /orders/admin ERROR:", error.message);
        res.status(500).json({ error: "Error al obtener órdenes" });
    }
});


// =======================
// 📋 OBTENER ÓRDENES DEL USUARIO
// =======================
orderRouter.get("/", async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId || !isValidId(userId)) return res.status(400).json({ error: "user-id inválido" });

        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        res.json(orders);

    } catch (error) {
        console.error("GET /orders ERROR:", error.message);
        res.status(500).json({ error: "Error al obtener órdenes" });
    }
});


// =======================
// 🔍 OBTENER ORDEN POR ID
// =======================
orderRouter.get("/:id", async (req, res) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;

        if (!userId || !isValidId(userId)) return res.status(400).json({ error: "user-id inválido" });
        if (!isValidId(id)) return res.status(400).json({ error: "ID de orden inválido" });

        const order = await Order.findOne({ _id: id, user: userId });
        if (!order) return res.status(404).json({ error: "Orden no encontrada" });

        res.json(order);

    } catch (error) {
        console.error("GET /orders/:id ERROR:", error.message);
        res.status(500).json({ error: "Error al obtener la orden" });
    }
});


// =======================
// 🔄 ACTUALIZAR STATUS (admin)
// =======================
orderRouter.put("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!isValidId(id)) return res.status(400).json({ error: "ID de orden inválido" });

        const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: `Status inválido. Debe ser uno de: ${validStatuses.join(", ")}` });
        }

        const order = await Order.findByIdAndUpdate(id, { status }, { returnDocument: "after" });
        if (!order) return res.status(404).json({ error: "Orden no encontrada" });

        res.json(order);

    } catch (error) {
        console.error("PUT /orders/:id/status ERROR:", error.message);
        res.status(500).json({ error: "Error al actualizar el status" });
    }
});


// =======================
// ❌ ELIMINAR ORDEN (admin)
// =======================
orderRouter.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) return res.status(400).json({ error: "ID de orden inválido" });

        const order = await Order.findByIdAndDelete(id);
        if (!order) return res.status(404).json({ error: "Orden no encontrada" });

        res.json({ message: "Orden eliminada correctamente" });

    } catch (error) {
        console.error("DELETE /orders/:id ERROR:", error.message);
        res.status(500).json({ error: "Error al eliminar orden" });
    }
});

export default orderRouter;