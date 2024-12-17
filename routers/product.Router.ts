import express from "express";
import { addProduct, deleteProduct, getProducts } from "../controllers/product.controller";
import { getMaterialsByProduct, linkMaterialToProduct } from "../controllers/product.material.controller";
import { authorizeRoles, isAutheticated } from "../middlewares/auth";

const productRouter = express.Router();

productRouter.post("/add-product", isAutheticated, authorizeRoles("管理"), addProduct);
productRouter.post("/product-to-material", isAutheticated, authorizeRoles("管理"), linkMaterialToProduct);
productRouter.delete("/delete/:idProduct", deleteProduct);
productRouter.get("/get-products", isAutheticated, authorizeRoles("管理"), getProducts);
productRouter.get("/get-materials-by-product", isAutheticated, authorizeRoles("管理"), getMaterialsByProduct);

export default productRouter;;