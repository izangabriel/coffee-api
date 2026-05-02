import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error obteniendo usuarios:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

userRouter.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.status(200).json(user);

    } catch (error) {
        console.error("Error obteniendo usuario:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});


userRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("--- LOGIN DEBUG ---");
        console.log("email:", email);
        console.log("password:", password);

        if (!email || !password) {
            return res.status(400).json({ error: "Email y contraseña son obligatorios" });
        }

        const user = await User.findOne({ email });

        console.log("user encontrado:", user ? "sí" : "no");
        console.log("password en DB:", user?.password);

        if (!user) {
            return res.status(404).json({ error: "Usuario no existe" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
          console.log("isMatch:", isMatch);
        console.log("-------------------");

        if (!isMatch) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        const { password: _, ...userSafe } = user._doc;

        res.status(200).json(userSafe);

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

userRouter.post("/", async (req, res) => {
    try {
        const { name, email, password, rol } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            rol
        });

        const savedUser = await newUser.save();

        const { password: _, ...userSafe } = savedUser._doc;

        res.status(201).json({
            mensaje: "Usuario creado",
            user: userSafe
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }
        console.error("Error creando usuario:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});


userRouter.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.status(200).json({ message: "Usuario eliminado correctamente" });

    } catch (error) {
        console.error("Error eliminando usuario:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});


userRouter.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { password, rol, ...safeFields } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            safeFields,
            { returnDocument: "after" }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.status(200).json(updatedUser);

    } catch (error) {
        console.error("Error actualizando usuario:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

export default userRouter;