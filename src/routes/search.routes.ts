// routes/searchRoutes.js
import express from 'express';
import {
    searchSuggestions,
    searchVideos,
} from '../controllers/search.controller';

const router = express.Router();

router.get('/', searchVideos); // GET /api/v1/search?q=keyword
router.get("/suggestions", searchSuggestions); // GET /api/v1/search/suggestions?q=react

export default router;
