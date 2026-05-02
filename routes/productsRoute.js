import express from "express";
import Product from "../models/productModel.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";

const productsRouter = express.Router();

// Obtener todos los productos
productsRouter.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener producto por id
productsRouter.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Crear producto
productsRouter.post("/", upload.single("image"), async (req, res) => {
    try {
        const { name, price, description, stock, category } = req.body;

        let images = [];

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "products" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(req.file.buffer);
            });

            images.push({
                url: result.secure_url,
                public_id: result.public_id
            });
        }

        const newProduct = new Product({
            name,
            description,
            price: Number(price),
            stock: Number(stock),
            category,
            images
        });

        const savedProduct = await newProduct.save();

        res.status(201).json(savedProduct);

    } catch (error) {
        console.error("ERROR CREATE:", error);
        res.status(500).json({ error: error.message });
    }
});

// Editar producto
productsRouter.put("/:id", upload.single("image"), async (req, res) => {
    try {
        const { name, price, description, stock, category } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        // Nueva imagen
        if (req.file) {
            // borrar anterior si existe
            if (product.images[0]?.public_id) {
                await cloudinary.uploader.destroy(product.images[0].public_id);
            }

            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "products" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(req.file.buffer);
            });

            product.images = [{
                url: result.secure_url,
                public_id: result.public_id
            }];
        }

        // Actualizar campos
        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = Number(price);
        if (stock !== undefined) product.stock = Number(stock);
        if (category !== undefined) product.category = category;

        const updatedProduct = await product.save();

        res.json(updatedProduct);

    } catch (error) {
        console.error("ERROR UPDATE:", error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar producto
productsRouter.delete("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        // eliminar imagen de cloudinary
        if (product.images[0]?.public_id) {
            await cloudinary.uploader.destroy(product.images[0].public_id);
        }

        await product.deleteOne();

        res.json({ message: "Producto eliminado correctamente" });

    } catch (error) {
        console.error("ERROR DELETE:", error);
        res.status(500).json({ error: error.message });
    }
});

export default productsRouter;