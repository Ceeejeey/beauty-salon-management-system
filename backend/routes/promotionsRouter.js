const express = require('express');
const { createPromotion, getPromotionById, getPromotions, updatePromotion, deletePromotion, getActivePromotions} = require('../controllers/promotionsController/promotionsController');
const { verifyAdmin } = require('../middlewares/verifyUser');
const promotionsRouter = express.Router();

// Route for creating a promotion
promotionsRouter.post('/create-promotion', verifyAdmin, createPromotion);

// Route for getting all promotions
promotionsRouter.get('/get-promotions', getPromotions);

// Route for getting a promotion by ID
promotionsRouter.get('/get-promotion/:id', getPromotionById);

// Route for updating a promotion
promotionsRouter.put('/update-promotion/:id', verifyAdmin, updatePromotion);

// Route for deleting a promotion
promotionsRouter.delete('/delete-promotion/:id', verifyAdmin, deletePromotion);

// Route for getting active promotions
promotionsRouter.get('/active-promotions', getActivePromotions);


module.exports = promotionsRouter;
