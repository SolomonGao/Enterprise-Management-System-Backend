import express from "express";
import { addProduct, deleteProduct } from "../controllers/product.controller";
import multer from "multer";
import { linkMaterialToProduct } from "../controllers/product.material.controller";

const upload = multer({storage: multer.memoryStorage()})
const productRouter = express.Router();

productRouter.post("/addProduct", upload.single('drawingNo'), addProduct);
productRouter.post("/productToMaterial", linkMaterialToProduct);
productRouter.delete("/delete/:idProduct", deleteProduct);
export default productRouter;;