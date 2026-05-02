import express from "express";
import mongoose from "mongoose";
import Cart from "../models/cartModel.js";

const cartRouter = express.Router();

// helper para obtener userId (reemplazar por middleware JWT en producción)
const getUserId = (req) => req.headers["user-id"];

// helper para validar ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/////////////////////////////////////
// 📌 Obtener carrito (Upsert)
/////////////////////////////////////
cartRouter.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({ message: "Falta user-id en headers" });
    }

    if (!isValidId(userId)) {
      return res.status(400).json({ message: "user-id inválido" });
    }

    // FIX: usar populate en lugar de manual find + map
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { user: userId, items: [] } },
      { new: true, upsert: true }
    ).populate("items.product");

    res.json(cart);

  } catch (error) {
    console.error("GET /carts ERROR:", error);
    res.status(500).json({ message: "Error al obtener carrito" });
  }
});

/////////////////////////////////////
// ➕ Agregar producto
/////////////////////////////////////
cartRouter.post("/add", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId, quantity = 1 } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Falta user-id en headers" });
    }

    if (!isValidId(userId)) {
      return res.status(400).json({ message: "user-id inválido" });
    }

    if (!productId || !isValidId(productId)) {
      return res.status(400).json({ message: "productId inválido" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, quantity }]
      });
    } else {
      const item = cart.items.find(
        item => item.product.toString() === productId
      );

      if (item) {
        item.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    // FIX: nueva consulta con populate en lugar de cart.populate() directo
    cart = await Cart.findById(cart._id).populate("items.product");

    res.json(cart);

  } catch (error) {
    console.error("POST /carts/add ERROR:", error.message);
    res.status(500).json({ message: "Error al agregar producto" });
  }
});

/////////////////////////////////////
// 🧹 Vaciar carrito
// FIX: debe ir ANTES de /:productId para evitar conflicto de rutas
/////////////////////////////////////
cartRouter.delete("/clear", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({ message: "Falta user-id en headers" });
    }

    if (!isValidId(userId)) {
      return res.status(400).json({ message: "user-id inválido" });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: "Carrito vaciado" });

  } catch (error) {
    console.error("DELETE /carts/clear ERROR:", error.message);
    res.status(500).json({ message: "Error al vaciar carrito" });
  }
});

/////////////////////////////////////
// ❌ Eliminar producto
/////////////////////////////////////
cartRouter.delete("/:productId", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "Falta user-id en headers" });
    }

    if (!isValidId(userId) || !isValidId(productId)) {
      return res.status(400).json({ message: "IDs inválidos" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();

    // FIX: nueva consulta con populate
    cart = await Cart.findById(cart._id).populate("items.product");

    res.json(cart);

  } catch (error) {
    console.error("DELETE /carts/:productId ERROR:", error.message);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
});

/////////////////////////////////////
// 🔄 Actualizar cantidad
/////////////////////////////////////
cartRouter.put("/update/:productId", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Falta user-id en headers" });
    }

    if (!isValidId(userId) || !isValidId(productId)) {
      return res.status(400).json({ message: "IDs inválidos" });
    }

    if (quantity === undefined) {
      return res.status(400).json({ message: "Falta quantity" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    const item = cart.items.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Producto no encontrado en el carrito" });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        item => item.product.toString() !== productId
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    // FIX: nueva consulta con populate
    cart = await Cart.findById(cart._id).populate("items.product");

    res.json(cart);

  } catch (error) {
    console.error("PUT /carts/update ERROR:", error.message);
    res.status(500).json({ message: "Error al actualizar carrito" });
  }
});

export default cartRouter;