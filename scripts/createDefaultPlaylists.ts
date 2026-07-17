import dotenv from 'dotenv';
import connectToDb from '../src/db/db';
import { Playlist } from '../src/models/playlist.model';
import { User } from '../src/models/user.model';
dotenv.config();

async function createDefaultPlaylists() {
    await connectToDb();
    console.log('Starting migration to create default playlists for users...');
    const users = await User.find({}, '_id');

    for (const user of users) {
        const existing = await Playlist.find({
            owner: user._id,
            type: { $in: ['watchlater', 'likedvideos'] },
        });

        const existingTypes = existing.map((playlist) => playlist.type);
        const playlists = [];

        if (!existingTypes.includes('watchlater')) {
            playlists.push({
                owner: user._id,
                playlistName: 'Watch Later',
                type: 'watchlater',
                isSystem: true,
                visibility: 'private',
                description: 'Videos you want to watch later',
            });
        }

        if (!existingTypes.includes('likedvideos')) {
            playlists.push({
                owner: user._id,
                playlistName: 'Liked Videos',
                type: 'likedvideos',
                isSystem: true,
                visibility: 'private',
                description: 'Videos you have liked',
            });
        }

        if (playlists.length) {
            await Playlist.insertMany(playlists);
        }
    }

    console.log('Migration completed.');
}

createDefaultPlaylists();
