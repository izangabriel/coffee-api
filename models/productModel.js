import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    slug: {
        type: String,
        unique: true,
        default: function () {
            return this.name
                ? this.name.toLowerCase().trim()
                    .replace(/\s+/g, "-")
                    .replace(/[^\w-]+/g, "") + "-" + Date.now()
                : undefined;
        }
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    discountPrice: {
        type: Number,
        default: 0
    },

    stock: {
        type: Number,
        required: true,
        min: 0
    },

    category: {
        type: String,
        enum: ["grano", "molido", "capsulas", "accesorios"],
        default: "grano"
    },

    brand: {
        type: String,
        default: "Café Imperium"
    },

    images: [
        {
            url: String,
            public_id: String
        }
    ],

    isActive: {
        type: Boolean,
        default: true
    },

    featured: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

const Product = mongoose.model("Product", productSchema);

export default Product;