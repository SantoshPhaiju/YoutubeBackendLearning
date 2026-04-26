// routes/searchRoutes.js
import express from 'express';
import {
    saveSuggestion,
    searchSuggestions,
    searchVideos,
} from '../controllers/search.controller';
import { optionalVerifyJWT } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/', searchVideos); // GET /api/v1/search?q=keyword
router.get("/suggestions", optionalVerifyJWT, searchSuggestions); // GET /api/v1/search/suggestions?q=react

router.post("/suggestions/save", optionalVerifyJWT, saveSuggestion);

export default router;
