import express from "express";
import {
  getOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  getOrder,
  reportSales
} from "../controllers/OrderController.js";
import ProtectMiddleware from "../middlewares/ProtectMiddleware.js";
import PermissionMiddleware from "../middlewares/PermissionMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(PermissionMiddleware, getOrders)
  .post(ProtectMiddleware, addOrder);

router
  .route("/report-sales")
  .get(PermissionMiddleware, reportSales);

router
  .route("/:id")
  .get(ProtectMiddleware, getOrder)
  .put(ProtectMiddleware, updateOrder)
  .delete(ProtectMiddleware, deleteOrder);

export default router;
