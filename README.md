# Baby Turbo vs. The Trenches

A retro-style space shooter game where Baby Turbo battles through the crypto trenches!

## Play the Game

**Note: The game is currently being set up on GitHub Pages. Please check back soon!**

<!-- Once GitHub Pages is set up, uncomment and update this link:
[Play Baby Turbo vs. The Trenches](https://scootermcgavin121.github.io/turbo300shooter/)
-->

## Game Features

- Classic space shooter gameplay with crypto-themed enemies
- Power-ups: Triple Shot, Shield, Speed Boost, Bomb, and Jeet Stomper
- Combo system for higher scores
- Global leaderboard to compete with other players
- Retro arcade cabinet styling

## Controls

- **Left/Right Arrow Keys**: Move Baby Turbo
- **Space**: Fire
- **Enter**: Confirm/Restart (on game over screen)

## Setup Instructions

1. Clone this repository
2. Create a `supabase-config.js` file with your Supabase credentials:
   ```javascript
   const supabaseConfig = {
     supabaseUrl: "YOUR_SUPABASE_URL",
     supabaseKey: "YOUR_SUPABASE_ANON_KEY"
   };
   ```
3. Open `index.html` in your browser to play locally

## GitHub Pages Setup

To make the game playable online:

1. Go to your repository settings
2. Navigate to the "Pages" section
3. Under "Source", select the branch you want to deploy (usually "main" or "master")
4. Select the root folder (/) and click "Save"
5. Wait a few minutes for GitHub to build and deploy your site
6. Your game will be available at: https://scootermcgavin121.github.io/turbo300shooter/

## Leaderboard Setup

The game uses Supabase for the leaderboard functionality. To set up your own leaderboard:

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the following SQL in the SQL editor:
   ```sql
   CREATE TABLE leaderboard (
     id SERIAL PRIMARY KEY,
     player_name VARCHAR NOT NULL,
     score INTEGER NOT NULL,
     game_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
   ```
4. Set up Row Level Security policies as needed
5. Update the `supabase-config.js` file with your project credentials

## Credits

Created by Scooter 